<template>
  <v-app>
    <!-- Barra de navegación -->
    <v-navigation-drawer
      v-if="currentUser"
      v-model="drawer"
      app
      :permanent="isDesktop"
      :temporary="!isDesktop"
      
      class="main-sidebar"
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            ElectroApp
          </v-list-item-title>
          <v-list-item-subtitle>
            Gestión de Contratos
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Barra superior -->
    <v-app-bar v-if="currentUser" app>
      <v-app-bar-nav-icon v-if="!isDesktop" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ElectroApp</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Información del usuario logueado -->
      <div v-if="currentUser" class="d-flex align-center mr-4">
        <v-avatar size="32" class="mr-2">
          <v-icon>mdi-account</v-icon>
        </v-avatar>
        <span class="text-body-2">{{ currentUser.name || currentUser.username }}</span>
      </div>
      
      <!-- Botón de sign out -->
      <v-btn
        v-if="currentUser"
        icon
        @click="handleSignOut"
        title="Cerrar sesión"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
      
      <v-btn icon @click="toggleTheme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main :class="currentUser ? 'pa-0 router-render' : ''" style="padding-top: 90px !important; ">
      <div v-if="!isInitialized" class="d-flex justify-center align-center" style="height: 100vh;">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <router-view v-else></router-view>
    </v-main>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn
          variant="text"
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/Customers.vue'
import Products from '@/views/Products.vue'
import Contracts from '@/views/Contracts.vue'
import Installments from '@/views/Installments.vue'
import Reminders from '@/views/Reminders.vue'
import Points from '@/views/Points.vue'
import { getToken, handleRedirectPromise, getUserInfo, logout, isAuthenticated, initializeMsal } from '@/services/authConfig'
import automaticReminderService from '@/services/automaticReminderService'

export default {
  name: 'App',
  components: {
    Dashboard,
    Customers,
    Products,
    Contracts,
    Installments,
    Reminders,
    Points
  },
  data() {
    return {
      drawer: true,
      isDesktop: window.innerWidth >= 1264,
      currentUser: null,
      isInitialized: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
        timeout: 3000
      },
      menuItems: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          path: '/'
        },
        {
          title: 'Clientes',
          icon: 'mdi-account-group',
          path: '/customers'
        },
        {
          title: 'Productos',
          icon: 'mdi-package-variant',
          path: '/products'
        },
        {
          title: 'Contratos',
          icon: 'mdi-file-document',
          path: '/contracts'
        },
        {
          title: 'Cuotas',
          icon: 'mdi-cash-multiple',
          path: '/installments'
        },
        {
          title: 'Recordatorios',
          icon: 'mdi-bell',
          path: '/reminders'
        },
        {
          title: 'Puntos de Lealtad',
          icon: 'mdi-star',
          path: '/points'
        }
      ]
    }
  },

  provide() {
    return {
      toast: {
        success: (message) => this.showSnackbar(message, 'success'),
        error: (message) => this.showSnackbar(message, 'error'),
        warning: (message) => this.showSnackbar(message, 'warning'),
        info: (message) => this.showSnackbar(message, 'info')
      }
    }
  },
  watch: {
    // Watcher para monitorear cambios en la URL (para detectar redirecciones de login)
    async '$route'() {
      await this.checkAuthStatus()
    }
  },
  async mounted() {
    try {
      window.addEventListener('resize', this.handleResize)
      
      // Inicializar autenticación con Azure Entra
      await this.initializeAuth()
      
      // Marcar como inicializado
      this.isInitialized = true
      
      // Verificar estado de autenticación cada 10 segundos
      setInterval(async () => {
        if (this.isInitialized) {
          await this.checkAuthStatus()
        }
      }, 10000)
      
      // Iniciar servicio de recordatorios automáticos solo si el usuario está autenticado
      if (this.currentUser) {
        automaticReminderService.start()
      }
    } catch (error) {
      console.error('Error en mounted:', error)
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    // Detener servicio de recordatorios automáticos
    automaticReminderService.stop()
  },
  methods: {
    async initializeAuth() {
      try {
        // Inicializar MSAL primero
        await initializeMsal()
        
        // Manejar la promesa de redirección después de inicializar MSAL
        const response = await handleRedirectPromise()
        
        // Si hay una respuesta de redirección, significa que el usuario se acaba de loguear
        if (response) {
          // Verificar inmediatamente el estado de autenticación
          this.checkAuthStatus()
        }
        
        // Verificar si ya hay un usuario logueado
        const isAuth = isAuthenticated()
        
        if (isAuth) {
          // Obtener información del usuario logueado
          this.currentUser = getUserInfo()
          
          // Solo obtener token si es necesario (para las llamadas a la API)
          try {
            await getToken()
          } catch (error) {
            console.error('Error obteniendo token:', error)
            // No es crítico si falla el token, el usuario puede seguir usando la app
          }
        } else {
          // Solo redirigir si no hay interacción en progreso
          getToken().catch(error => {
            console.error('Error al redirigir a login:', error)
          })
        }
      } catch (error) {
        console.error('Error durante la autenticación:', error)
      }
    },
    
    toggleTheme() {
      // Implementar cambio de tema
    },
    handleResize() {
      this.isDesktop = window.innerWidth >= 1264
      if (this.isDesktop) this.drawer = true
      else this.drawer = false
    },
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
    async handleSignOut() {
      try {
        await logout()
        this.currentUser = null
        this.showSnackbar('Sesión cerrada exitosamente', 'info')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
        this.showSnackbar('Error al cerrar sesión', 'error')
      }
    },
    // Método para verificar el estado de autenticación
    async checkAuthStatus() {
      try {
        // Asegurar que MSAL esté inicializado
        await initializeMsal()
        
        const isAuth = isAuthenticated()
        
        if (isAuth && !this.currentUser) {
          this.currentUser = getUserInfo()
          // Iniciar servicio de recordatorios cuando el usuario se autentica
          if (!automaticReminderService.isActive()) {
            automaticReminderService.start()
          }
        } else if (!isAuth && this.currentUser) {
          this.currentUser = null
          // Detener servicio de recordatorios cuando el usuario se desautentica
          if (automaticReminderService.isActive()) {
            automaticReminderService.stop()
          }
        }
      } catch (error) {
        console.error('Error verificando estado de autenticación:', error)
      }
    }
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif;
}

.v-main {
  background-color: #f5f5f5;
}

/* Eliminar espacios en blanco y columnas negras */
.v-navigation-drawer {
  border-right: none !important;

}

/* .main-sidebar {
  background-color: red !important;
  width: 15% !important;
}

.router-render{
    background-color: blue !important;
    width: 85% !important;
    margin-left: 15% !important;
} */

.v-app-bar {
  border-bottom: none !important;
}

/* Asegurar que el contenido principal ocupe todo el espacio disponible */
.v-main__wrap {
  width: 100% !important;
  max-width: 100% !important;
}


/* Eliminar márgenes y padding innecesarios */
.v-container {
  max-width: 100% !important;
  padding: 16px !important;
}

/* Asegurar que las tablas no causen overflow */
.v-data-table {
  width: 100% !important;
  max-width: 100% !important;
}

/* Eliminar scroll horizontal innecesario */
html, body {
  overflow-x: hidden;
}

.v-application {
  overflow-x: hidden;
}

/* Asegurar que el layout sea responsive */
.v-application {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Ajustar el contenido cuando el drawer es temporal */
@media (max-width: 1263px) {
  .v-main {
    margin-left: 0 !important;
  }

}


@media (min-width: 1263px) {

  .main-sidebar {
    width: 15% !important;
  }

  .router-render{
    width: 85% !important;
    margin-left: 15% !important;
  }
}


/* Asegurar que las vistas ocupen todo el espacio disponible */
.v-container {
  height: 100%;
  max-width: none !important;
}

/* Estilos para los iconos del sidebar */
.v-navigation-drawer .v-list-item .v-list-item__icon .v-icon {
  color: #1976d2 !important; /* Azul principal de Material Design */
  transition: all 0.3s ease !important;
}

/* Efecto hover en los iconos */
.v-navigation-drawer .v-list-item:hover .v-list-item__icon .v-icon {
  color: #42a5f5 !important; /* Azul más claro en hover */
  transform: scale(1.1) !important;
}

/* Icono activo (ruta actual) */
.v-navigation-drawer .v-list-item--active .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list-item.v-list-item--active .v-list-item__icon .v-icon {
  color: #ff6b35 !important; /* Naranja vibrante para la ruta activa */
  transform: scale(1.15) !important;
}

/* Colores específicos para cada tipo de icono - usando selectores más específicos */
.v-navigation-drawer .v-list .v-list-item:nth-child(1) .v-list-item__icon .v-icon {
  color: #4caf50 !important; /* Verde para Dashboard */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(2) .v-list-item__icon .v-icon {
  color: #2196f3 !important; /* Azul para Clientes */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(3) .v-list-item__icon .v-icon {
  color: #ff9800 !important; /* Naranja para Productos */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(4) .v-list-item__icon .v-icon {
  color: #9c27b0 !important; /* Púrpura para Contratos */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(5) .v-list-item__icon .v-icon {
  color: #f44336 !important; /* Rojo para Cuotas */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(6) .v-list-item__icon .v-icon {
  color: #ffc107 !important; /* Amarillo para Recordatorios */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(7) .v-list-item__icon .v-icon {
  color: #00bcd4 !important; /* Cian para Puntos de Lealtad */
}

/* Efecto de sombra sutil en los iconos */
.v-navigation-drawer .v-list-item__icon .v-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) !important;
}

/* Animación de entrada para los iconos */
.v-navigation-drawer .v-list-item__icon .v-icon {
  animation: iconFadeIn 0.5s ease-in-out !important;
}

/* Selector adicional para asegurar que los colores se apliquen */
.v-navigation-drawer .v-list .v-list-item .v-list-item__icon .v-icon {
  color: inherit !important;
}

/* Forzar colores específicos con mayor especificidad */
.v-navigation-drawer .v-list .v-list-item:nth-child(1) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(1) .v-list-item__icon .v-icon::before {
  color: #4caf50 !important; /* Verde para Dashboard */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(2) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(2) .v-list-item__icon .v-icon::before {
  color: #2196f3 !important; /* Azul para Clientes */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(3) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(3) .v-list-item__icon .v-icon::before {
  color: #ff9800 !important; /* Naranja para Productos */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(4) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(4) .v-list-item__icon .v-icon::before {
  color: #9c27b0 !important; /* Púrpura para Contratos */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(5) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(5) .v-list-item__icon .v-icon::before {
  color: #f44336 !important; /* Rojo para Cuotas */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(6) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(6) .v-list-item__icon .v-icon::before {
  color: #ffc107 !important; /* Amarillo para Recordatorios */
}

.v-navigation-drawer .v-list .v-list-item:nth-child(7) .v-list-item__icon .v-icon,
.v-navigation-drawer .v-list .v-list-item:nth-child(7) .v-list-item__icon .v-icon::before {
  color: #00bcd4 !important; /* Cian para Puntos de Lealtad */
}

@keyframes iconFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style> 