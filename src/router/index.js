import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Public pages
import InvitePage from '@/pages/InvitePage.vue'
import LoginPage from '@/pages/LoginPage.vue'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminUsers from '@/pages/admin/AdminUsers.vue'
import AdminActivities from '@/pages/admin/AdminActivities.vue'
import AdminVotes from '@/pages/admin/AdminVotes.vue'
import AdminParticipations from '@/pages/admin/AdminParticipations.vue'

// Member pages
import MembreDashboard from '@/pages/membre/MembreDashboard.vue'
import MembreActivites from '@/pages/membre/MembreActivites.vue'
import MembreVotes from '@/pages/membre/MembreVotes.vue'
import MembreParticipations from '@/pages/membre/MembreParticipations.vue'

const routes = [
  {
    path: '/',
    redirect: '/invite'
  },
  {
    path: '/invite',
    name: 'invite',
    component: InvitePage,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsers
      },
      {
        path: 'activites',
        name: 'admin-activites',
        component: AdminActivities
      },
      {
        path: 'votes',
        name: 'admin-votes',
        component: AdminVotes
      },
      {
        path: 'participations',
        name: 'admin-participations',
        component: AdminParticipations
      }
    ]
  },
  {
    path: '/membre',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'MEMBRE' },
    children: [
      {
        path: '',
        name: 'membre-dashboard',
        component: MembreDashboard
      },
      {
        path: 'activites',
        name: 'membre-activites',
        component: MembreActivites
      },
      {
        path: 'votes',
        name: 'membre-votes',
        component: MembreVotes
      },
      {
        path: 'participations',
        name: 'membre-participations',
        component: MembreParticipations
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Public routes
  if (to.meta.public) {
    // If authenticated and trying to access login, redirect to dashboard
    if (to.name === 'login' && authStore.isAuthenticated) {
      if (authStore.isAdmin) {
        return next('/admin')
      } else if (authStore.isMembre) {
        return next('/membre')
      }
    }
    return next()
  }
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  // Check role permissions
  if (to.meta.role) {
    const userRole = authStore.userRole
    
    if (to.meta.role === 'ADMIN' && userRole !== 'ADMIN') {
      // Non-admin trying to access admin routes
      if (userRole === 'MEMBRE') {
        return next('/membre')
      }
      return next('/login')
    }
    
    if (to.meta.role === 'MEMBRE' && userRole !== 'MEMBRE' && userRole !== 'ADMIN') {
      // Non-member trying to access member routes
      return next('/login')
    }
  }
  
  next()
})

export default router
