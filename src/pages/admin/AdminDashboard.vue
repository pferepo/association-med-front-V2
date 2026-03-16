<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'
import activityService from '@/services/activityService'
import voteService from '@/services/voteService'
import participationService from '@/services/participationService'

const stats = ref({
  users: 0,
  activities: 0,
  votes: 0,
  participations: 0
})
const loading = ref(true)
const recentActivities = ref([])

onMounted(async () => {
  try {
    const [users, activities, votes, participations] = await Promise.all([
      userService.getAll().catch(() => []),
      activityService.getAll().catch(() => []),
      voteService.getAll().catch(() => []),
      participationService.getAll().catch(() => [])
    ])
    
    stats.value = {
      users: users.length || 0,
      activities: activities.length || 0,
      votes: votes.length || 0,
      participations: participations.length || 0
    }
    
    recentActivities.value = activities.slice(0, 5)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <p class="text-gray-600 mt-1">Bienvenue dans votre espace d'administration</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Users Stat -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Utilisateurs</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.users }}</p>
          </div>
        </div>
      </div>

      <!-- Activities Stat -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Activités</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.activities }}</p>
          </div>
        </div>
      </div>

      <!-- Votes Stat -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Votes</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.votes }}</p>
          </div>
        </div>
      </div>

      <!-- Participations Stat -->
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Participations</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.participations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h2>
      
      <div v-if="loading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
        Aucune activité récente
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
        >
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 truncate">{{ activity.titre }}</p>
            <p class="text-sm text-gray-500">{{ activity.type }} - {{ activity.statut }}</p>
          </div>
          <span class="badge badge-blue">{{ activity.statutProposition || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
