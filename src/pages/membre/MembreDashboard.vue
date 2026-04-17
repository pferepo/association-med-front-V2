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

    activities.value = activitiesData.slice(0, 6)
    openVotes.value = votesData.filter(v => v.statut === 'OUVERT').slice(0, 5)

  } finally {
    loading.value = false
  }
})

/* TYPE BADGE */
function getTypeBadge(type) {
  const map = {
    FORMATION: 'bg-blue-100 text-blue-800 border-blue-200',
    EVENEMENT: 'bg-green-100 text-green-800 border-green-200',
    REUNION: 'bg-purple-100 text-purple-800 border-purple-200'
  }
  return map[type] || 'bg-gray-100 text-gray-700 border-gray-200'
}

/* ACTIVITY CARD COLOR */
function getActivityCardColor(type) {
  const map = {
    FORMATION: 'bg-blue-50 border-blue-100',
    EVENEMENT: 'bg-green-50 border-green-100',
    REUNION: 'bg-purple-50 border-purple-100'
  }
  return map[type] || 'bg-gray-50 border-gray-100'
}

/* STATUS BADGE */
function getStatusBadge(statut) {
  const map = {
    PLANIFIE: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    EN_COURS: 'bg-blue-50 text-blue-700 border-blue-100',
    TERMINE: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  return map[statut] || 'bg-gray-50 text-gray-600 border-gray-200'
}

/* VOTE BADGE */
function getVoteBadge(statut) {
  return statut === 'OUVERT'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'
}
</script>

<template>
  <div class="space-y-8">

    <!-- HEADER with role badge -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-foreground">
          Bienvenue, {{ authStore.userName }} 👋
        </h1>
        <p class="text-muted-foreground mt-2">Tableau de bord personnalisé</p>
      </div>

      <div class="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg w-fit">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <p class="text-sm font-semibold text-primary">{{ authStore.userRole }}</p>
      </div>
    </div>

    <!-- STATS GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">📅</span>
          <span class="text-xs font-semibold text-accent px-2 py-1 bg-accent/10 rounded-full">+{{ Math.max(0, activities.length) }}</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Activités disponibles</p>
        <p class="text-3xl font-bold text-foreground">{{ activities.length }}</p>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">🗳️</span>
          <span class="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">Actifs</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Votes ouverts</p>
        <p class="text-3xl font-bold text-foreground">{{ openVotes.length }}</p>
      </div>

      <div class="stat-card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">✨</span>
          <span class="text-xs font-semibold text-secondary px-2 py-1 bg-secondary/10 rounded-full">Premium</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Statut</p>
        <p class="text-3xl font-bold text-foreground">Actif</p>
      </div>
    </div>

    <!-- MAIN CONTENT GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ACTIVITIES SECTION -->
      <div class="lg:col-span-2">
        <div class="card-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-foreground">Activités Récentes</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ activities.length }} activité(s) disponible(s)</p>
            </div>
            <span class="text-2xl">📋</span>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-muted-foreground">⏳ Chargement...</div>
          </div>

          <div v-else-if="activities.length === 0" class="py-12 text-center">
            <p class="text-muted-foreground">Aucune activité disponible</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="a in activities"
              :key="a.id"
              class="group p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {{ a.titre }}
                  </p>
                </div>
                <span
                  class="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                  :class="{
                    'bg-blue-100 text-blue-700': a.type === 'FORMATION',
                    'bg-green-100 text-green-700': a.type === 'EVENEMENT',
                    'bg-purple-100 text-purple-700': a.type === 'REUNION',
                    'bg-gray-100 text-gray-700': !a.type
                  }"
                >
                  {{ a.type }}
                </span>
              </div>

              <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
                {{ a.description }}
              </p>

              <div class="flex items-center justify-between">
                <span
                  class="text-xs px-2 py-1 rounded border font-medium"
                  :class="{
                    'bg-yellow-50 text-yellow-700 border-yellow-200': a.statut === 'PLANIFIE',
                    'bg-blue-50 text-blue-700 border-blue-200': a.statut === 'EN_COURS',
                    'bg-gray-50 text-gray-600 border-gray-200': a.statut === 'TERMINE'
                  }"
                >
                  {{ a.statut }}
                </span>
                <button class="text-primary font-medium text-sm hover:underline group-hover:opacity-100 opacity-0 transition-opacity">
                  Détails →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VOTES SECTION -->
      <div>
        <div class="card-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-foreground">Votes en Cours</h2>
            <span class="text-2xl">🗳️</span>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="text-muted-foreground text-sm">⏳ Chargement...</div>
          </div>

          <div v-else-if="openVotes.length === 0" class="py-8 text-center">
            <p class="text-muted-foreground text-sm">Aucun vote en cours</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="v in openVotes"
              :key="v.id"
              class="p-4 border border-secondary/30 rounded-lg bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/50 transition-all"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <p class="font-semibold text-foreground text-sm">Vote #{{ v.id }}</p>
                <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                  Ouvert
                </span>
              </div>

              <p class="text-xs text-muted-foreground mb-3">
                Activité ID: {{ v.activiteId }}
              </p>

              <button class="w-full py-2 px-3 text-sm font-medium bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors">
                Voter maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
