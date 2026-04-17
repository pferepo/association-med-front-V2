<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const isAdmin = computed(() => authStore.isAdmin)
const basePath = computed(() => isAdmin.value ? '/admin' : '/membre')

const navigation = computed(() => {
  const items = [
    { name: 'Dashboard', path: basePath.value, icon: 'dashboard', roles: ['ADMIN', 'MEMBRE_BUREAU_EXECUTIF'] },
    { name: 'Activités', path: `${basePath.value}/activites`, icon: 'activities', roles: ['ADMIN', 'MEMBRE_BUREAU_EXECUTIF'] },
    { name: 'Votes', path: `${basePath.value}/votes`, icon: 'votes', roles: ['ADMIN', 'MEMBRE_BUREAU_EXECUTIF'] },
    { name: 'Participations', path: `${basePath.value}/participations`, icon: 'participations', roles: ['ADMIN', 'MEMBRE_BUREAU_EXECUTIF'] },
    { name: 'Utilisateurs', path: '/admin/users', icon: 'users', roles: ['ADMIN'] },
    { name: 'Historique', path: `${basePath.value}/historique`, icon: 'history', roles: ['ADMIN'] }
  ]

  return items.filter(item => item.roles.includes(authStore.userRole))
})

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden"></div>

    <!-- SIDEBAR -->
    <aside
        :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-all duration-300 lg:translate-x-0 flex flex-col',
        sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
      ]"
    >
      <!-- LOGO -->
      <div class="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border/30">
        <div class="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-accent rounded-lg flex items-center justify-center shadow-md">
          <span class="text-white font-bold text-sm">🏥</span>
        </div>
        <div>
          <p class="font-bold text-sm leading-tight">AMB</p>
          <p class="text-xs opacity-70">Association Médicale</p>
        </div>
      </div>

      <!-- NAV -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <router-link
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
            isActive(item.path)
              ? 'bg-sidebar-primary/20 text-sidebar-primary'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10'
          ]"
        >
          <span class="text-lg">
            {{ item.icon === 'dashboard' ? '📊' : 
               item.icon === 'activities' ? '📅' : 
               item.icon === 'votes' ? '🗳️' : 
               item.icon === 'participations' ? '👥' : 
               item.icon === 'users' ? '👨‍💼' : 
               item.icon === 'history' ? '📜' : '•' }}
          </span>
          {{ item.name }}
        </router-link>
      </nav>

      <!-- USER SECTION -->
      <div class="px-4 py-4 border-t border-sidebar-border/30 space-y-3">
        <div class="bg-sidebar-accent/10 rounded-lg p-3">
          <p class="text-xs opacity-60 mb-1">Connecté en tant que</p>
          <p class="text-sm font-semibold truncate">{{ authStore.userName }}</p>
        </div>
        <button @click="handleLogout" class="w-full px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium text-sm transition-colors">
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="lg:ml-64">
      <!-- HEADER -->
      <header class="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div class="flex items-center justify-between px-6 h-20">
          <!-- LEFT -->
          <div class="flex items-center gap-4">
            <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
              <span class="text-xl">☰</span>
            </button>

            <!-- NAV LINKS -->
            <nav class="hidden md:flex items-center gap-6 ml-4">
              <router-link
                  to="/about"
                  class="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Qui sommes-nous ?
              </router-link>

              <router-link
                  to="/contact"
                  class="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                Contactez-nous
              </router-link>
            </nav>
          </div>

          <!-- RIGHT -->
          <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <span class="text-xs text-muted-foreground">👤</span>
              <span class="text-sm font-medium text-foreground">{{ authStore.userName }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <main class="p-6 md:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
