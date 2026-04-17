import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import DashboardLayout from '@/layouts/DashboardLayout.vue'

import InvitePage from '@/pages/InvitePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.vue'

import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'

import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminUsers from '@/pages/admin/AdminUsers.vue'
import AdminActivities from '@/pages/admin/AdminActivities.vue'
import AdminVotes from '@/pages/admin/AdminVotes.vue'
import AdminParticipations from '@/pages/admin/AdminParticipations.vue'
import Historique from '@/pages/admin/Historique.vue'

import MembreDashboard from '@/pages/membre/MembreDashboard.vue'
import MembreActivites from '@/pages/membre/MembreActivites.vue'
import MembreVotes from '@/pages/membre/MembreVotes.vue'
import MembreParticipations from '@/pages/membre/MembreParticipations.vue'

const routes = [
  { path: '/', redirect: '/invite' },

  { path: '/invite', name: 'MEMBRE_INVITE', component: InvitePage, meta: { public: true } },
  { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { public: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage, meta: { public: true } },

  { path: '/about', name: 'about', component: AboutView, meta: { public: true } },
  { path: '/contact', name: 'contact', component: ContactView, meta: { public: true } },

  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'users', name: 'admin-users', component: AdminUsers },
      { path: 'activites', name: 'admin-activites', component: AdminActivities },
      { path: 'votes', name: 'admin-votes', component: AdminVotes },
      { path: 'participations', name: 'admin-participations', component: AdminParticipations },
      { path: 'historique', name: 'admin-historique', component: Historique }
    ]
  },

  {
    path: '/membre',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'MEMBRE_BUREAU_EXECUTIF' },
    children: [
      { path: '', name: 'membre-dashboard', component: MembreDashboard },
      { path: 'activites', name: 'membre-activites', component: MembreActivites },
      { path: 'votes', name: 'membre-votes', component: MembreVotes },
      { path: 'participations', name: 'membre-participations', component: MembreParticipations }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    if (to.name === 'login' && authStore.isAuthenticated) {
      return authStore.isAdmin ? next('/admin') : next('/membre')
    }
    return next()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.role) {
    const userRole = authStore.userRole

    if (to.meta.role === 'ADMIN' && userRole !== 'ADMIN') {
      return userRole === 'MEMBRE_BUREAU_EXECUTIF'
          ? next('/membre')
          : next('/login')
    }

    if (
        to.meta.role === 'MEMBRE_BUREAU_EXECUTIF' &&
        userRole !== 'MEMBRE_BUREAU_EXECUTIF' &&
        userRole !== 'ADMIN'
    ) {
      return next('/login')
    }
  }

  next()
})

export default router