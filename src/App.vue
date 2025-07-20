<template>
  <v-app>
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
            Sistema de Electrodomésticos
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
      <v-toolbar-title>Sistema de Electrodomésticos</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn icon @click="toggleTheme">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main class="pa-0 router-render">
      <router-view></router-view>
    </v-main>

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
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
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