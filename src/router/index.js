import { createRouter, createWebHistory } from 'vue-router'
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
    component: Dashboard
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: Contracts
  },
  {
    path: '/installments',
    name: 'Installments',
    component: Installments
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: Reminders
  },
  {
    path: '/points',
    name: 'Points',
    component: Points
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 