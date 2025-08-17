<template>
  <v-app>
    <!-- Solo mostrar navegación si el usuario está autenticado -->
    <template v-if="currentUser">
      <!-- Barra de navegación -->
      <v-navigation-drawer
        v-model="drawer"
        app
        :permanent="isDesktop"
        :temporary="!isDesktop"
        width="280"
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
      <v-app-bar app>
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
      <v-main class="pa-0 router-render">
        <router-view></router-view>
      </v-main>
    </template>

    <!-- Si no hay usuario autenticado, mostrar solo el contenido del router -->
    <template v-else>
      <v-main>
        <router-view></router-view>
      </v-main>
    </template>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
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
    window.addEventListener('resize', this.handleResize)
    
    // Inicializar autenticación con Azure Entra
    await this.initializeAuth()
    
    // Verificar estado de autenticación cada 10 segundos
    setInterval(async () => {
      await this.checkAuthStatus()
    }, 10000)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async initializeAuth() {
      try {
        console.log('Iniciando autenticación...')
        
        // Inicializar MSAL primero
        console.log('Inicializando MSAL...')
        await initializeMsal()
        console.log('MSAL inicializado correctamente')
        
        // Manejar la promesa de redirección después de inicializar MSAL
        const response = await handleRedirectPromise()
        console.log('Respuesta de handleRedirectPromise:', response)
        
        // Si hay una respuesta de redirección, significa que el usuario se acaba de loguear
        if (response) {
          console.log('Usuario logueado desde redirección:', response)
          // Verificar inmediatamente el estado de autenticación
          this.checkAuthStatus()
        }
        
        // Verificar si ya hay un usuario logueado
        const isAuth = isAuthenticated()
        console.log('¿Usuario autenticado?', isAuth)
        
        if (isAuth) {
          // Obtener información del usuario logueado
          this.currentUser = getUserInfo()
          console.log('Usuario logueado:', this.currentUser)
          
          // Solo obtener token si es necesario (para las llamadas a la API)
          try {
            await getToken()
            console.log('Token obtenido exitosamente')
          } catch (error) {
            console.error('Error obteniendo token:', error)
            // No es crítico si falla el token, el usuario puede seguir usando la app
          }
        } else {
          console.log('No hay usuario logueado, redirigiendo a Microsoft...')
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
      console.log('Cambiar tema')
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
        console.log('Estado de autenticación:', isAuth)
        
        if (isAuth && !this.currentUser) {
          this.currentUser = getUserInfo()
          console.log('Usuario recuperado:', this.currentUser)
        } else if (!isAuth && this.currentUser) {
          this.currentUser = null
          console.log('Usuario removido (no autenticado)')
          
          // Solo redirigir si no estamos ya en proceso de login
          // El router guard se encargará de la redirección si es necesario
          console.log('Usuario no autenticado, el router guard manejará la redirección')
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


</style> 