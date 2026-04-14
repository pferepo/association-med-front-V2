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

    <!-- HEADER -->
    <div class="flex items-center justify-between">

      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Bienvenue, {{ authStore.userName }}
        </h1>
        <p class="text-sm text-gray-500">
          Tableau de bord membre
        </p>
      </div>

      <div class="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
        {{ authStore.userRole }}
      </div>

    </div>

    <!-- STATS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow transition">
        <p class="text-sm text-blue-600">Activités</p>
        <p class="text-2xl font-bold text-blue-900">
          {{ activities.length }}
        </p>
      </div>

      <div class="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm hover:shadow transition">
        <p class="text-sm text-green-600">Votes ouverts</p>
        <p class="text-2xl font-bold text-green-900">
          {{ openVotes.length }}
        </p>
      </div>

      <div class="bg-purple-50 border border-purple-100 rounded-xl p-5 shadow-sm hover:shadow transition">
        <p class="text-sm text-purple-600">Statut</p>
        <p class="text-2xl font-bold text-purple-900">
          Actif
        </p>
      </div>

    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ACTIVITIES -->
      <div class="lg:col-span-2 bg-white border rounded-xl p-5 shadow-sm">

        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">
            Activités récentes
          </h2>
        </div>

        <div v-if="loading" class="text-gray-400 text-sm">
          Chargement...
        </div>

        <div v-else class="space-y-3">

          <div
            v-for="a in activities"
            :key="a.id"
            class="p-4 border rounded-lg transition transform hover:-translate-y-1 hover:shadow-md"
            :class="getActivityCardColor(a.type)"
          >

            <div class="flex justify-between items-start">

              <div>
                <p class="font-medium text-gray-900">
                  {{ a.titre }}
                </p>

                <p class="text-sm text-gray-600 mt-1">
                  {{ a.description }}
                </p>

                <p
                  class="text-xs mt-2 px-2 py-1 rounded border inline-block"
                  :class="getStatusBadge(a.statut)"
                >
                  {{ a.statut }}
                </p>
              </div>

              <span
                class="text-xs px-2 py-1 rounded-md border"
                :class="getTypeBadge(a.type)"
              >
                {{ a.type }}
              </span>

            </div>

          </div>

        </div>

      </div>

      <!-- VOTES -->
      <div class="bg-white border rounded-xl p-5 shadow-sm">

        <h2 class="font-semibold text-gray-900 mb-4">
          Votes en cours
        </h2>

        <div v-if="loading" class="text-gray-400 text-sm">
          Chargement...
        </div>

        <div v-else class="space-y-3">

          <div
            v-for="v in openVotes"
            :key="v.id"
            class="p-3 border rounded-lg hover:shadow-md transition bg-green-50 border-green-100"
          >

            <p class="font-medium text-gray-900">
              Vote #{{ v.id }}
            </p>

            <p class="text-xs text-gray-500">
              Activité ID: {{ v.activiteId }}
            </p>

            <span
              class="inline-block mt-2 text-xs px-2 py-1 rounded-md border"
              :class="getVoteBadge(v.statut)"
            >
              {{ v.statut }}
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>