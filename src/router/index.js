import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, getToken, initializeMsal } from '@/services/authConfig'
import Dashboard from '@/views/Dashboard.vue'
import Customers from '@/views/Customers.vue'
import Products from '@/views/Products.vue'
import Contracts from '@/views/Contracts.vue'
import Installments from '@/views/Installments.vue'
import Reminders from '@/views/Reminders.vue'
import Points from '@/views/Points.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts,
    meta: { requiresAuth: true }
  },
  {
    path: '/installments',
    name: 'Installments',
    component: Installments,
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: Reminders,
    meta: { requiresAuth: true }
  },
  {
    path: '/points',
    name: 'Points',
    component: Points,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
  console.log('Navegando a:', to.path)
  
  try {
    // Inicializar MSAL antes de cualquier operación
    await initializeMsal()
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
      console.log('Ruta requiere autenticación')
      
      // Verificar si el usuario está autenticado
      if (isAuthenticated()) {
        console.log('Usuario autenticado, permitiendo acceso')
        next()
      } else {
        console.log('Usuario no autenticado, redirigiendo a Microsoft login')
        // Redirigir directamente a Microsoft para login
        getToken().catch(error => {
          console.error('Error al redirigir a login:', error)
        })
        // No llamar next() aquí, getToken() manejará la redirección
      }
    } else {
      // Ruta no requiere autenticación
      console.log('Ruta no requiere autenticación')
      next()
    }
  } catch (error) {
    console.error('Error en guardia de navegación:', error)
    // En caso de error, permitir la navegación
    next()
  }
})

export default router 