import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VendedorView from '@/views/VendedorView.vue'
import CompradorView from '@/views/CompradorView.vue'
import NotarioView from '@/views/NotarioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/buyer',
      name: 'buyer',
      component: CompradorView
    },
    {
      path: '/seller',
      name: 'seller',
      component: VendedorView
    },
    {
      path: '/admin',
      name: 'admin',
      component: NotarioView
    },
  ]
})

export default router
