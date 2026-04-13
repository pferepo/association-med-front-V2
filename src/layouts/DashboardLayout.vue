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
  <div class="min-h-screen bg-gray-50">

    <!-- SIDEBAR -->
    <aside
        :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">

        <!-- LOGO -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold"> AMB </span>
          </div>
          <span class="text-lg font-bold text-gray-900">
            Association Médicale Ben Guerdane
          </span>
        </div>

        <!-- NAV -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <router-link
              v-for="item in navigation"
              :key="item.path"
              :to="item.path"
              :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- USER -->
        <div class="px-4 py-4 border-t border-gray-100">
          <div class="text-sm text-gray-700">
            {{ authStore.userName }}
          </div>
        </div>

      </div>
    </aside>

    <!-- MAIN -->
    <div class="lg:pl-64">

      <!-- HEADER -->
      <header class="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between px-6 h-16">

          <!-- LEFT -->
          <div class="flex items-center gap-4">
            <button @click="sidebarOpen = true" class="lg:hidden">☰</button>

            <!-- 🔥 LIENS PRO -->
            <nav class="hidden md:flex items-center gap-6">
              <router-link
                  to="/about"
                  class="text-sm font-medium text-gray-600 hover:text-primary-600 transition"
              >
                Qui sommes-nous ?
              </router-link>

              <router-link
                  to="/contact"
                  class="text-sm font-medium text-gray-600 hover:text-primary-600 transition"
              >
                Contactez-nous
              </router-link>
            </nav>
          </div>

          <!-- RIGHT -->
          <div class="flex items-center gap-4">
            <span class="text-sm">{{ authStore.userName }}</span>

            <button @click="handleLogout" class="text-sm text-red-500 hover:underline">
              Déconnexion
            </button>
          </div>

        </div>
      </header>

      <!-- CONTENT -->
      <main class="p-6">
        <RouterView />
      </main>

    </div>

  </div>
</template>