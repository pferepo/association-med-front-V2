<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import activityService from '@/services/activityService'
import voteService from '@/services/voteService'

const authStore = useAuthStore()
const activities = ref([])
const openVotes = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [activitiesData, votesData] = await Promise.all([
      activityService.getAll().catch(() => []),
      voteService.getAll().catch(() => [])
    ])
    
    activities.value = activitiesData.slice(0, 4)
    openVotes.value = votesData.filter(v => v.statut === 'OUVERT').slice(0, 3)
  } finally {
    loading.value = false
  }
})

function getTypeColor(type) {
  const colors = {
    'FORMATION': 'bg-blue-100 text-blue-800',
    'EVENEMENT': 'bg-green-100 text-green-800',
    'EVENNEMENTs': 'bg-green-100 text-green-800',
    'REUNION': 'bg-purple-100 text-purple-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Bienvenue, {{ authStore.userName }}
      </h1>
      <p class="text-gray-600 mt-1">Voici un aperçu de votre espace membre</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div class="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p class="text-white/80 text-sm">Activités disponibles</p>
            <p class="text-2xl font-bold">{{ activities.length }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-white/80 text-sm">Votes ouverts</p>
            <p class="text-2xl font-bold">{{ openVotes.length }}</p>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-white/80 text-sm">Mon rôle</p>
            <p class="text-2xl font-bold">{{ authStore.userRole }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Activities -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Activités récentes</h2>
          <router-link to="/membre/activites" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tout
          </router-link>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500">
          Aucune activité disponible
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ activity.titre }}</p>
              <p class="text-sm text-gray-500">{{ activity.statut }}</p>
            </div>
            <span :class="['badge text-xs', getTypeColor(activity.type)]">
              {{ activity.type }}
            </span>
          </div>
        </div>
      </div>

      <!-- Open Votes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Votes en cours</h2>
          <router-link to="/membre/votes" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tout
          </router-link>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="openVotes.length === 0" class="text-center py-8 text-gray-500">
          Aucun vote en cours
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="vote in openVotes"
            :key="vote.id"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900">Vote #{{ vote.id }}</p>
              <p class="text-sm text-gray-500">Activité #{{ vote.activiteId }}</p>
            </div>
            <span class="badge badge-green">Ouvert</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
