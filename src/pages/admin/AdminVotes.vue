<script setup>
import { ref, onMounted } from 'vue'
import voteService from '@/services/voteService'
import activityService from '@/services/activityService'

const votes = ref([])
const activities = ref([])
const loading = ref(true)
const selectedVote = ref(null)
const voteResults = ref([])
const loadingResults = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [votesData, activitiesData] = await Promise.all([
      voteService.getAll(),
      activityService.getAll()
    ])
    votes.value = votesData
    activities.value = activitiesData
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

async function closeVote(id) {
  if (!confirm('Êtes-vous sûr de vouloir clôturer ce vote ?')) return
  
  try {
    await voteService.closeVote(id)
    await fetchData()
  } catch (err) {
    alert('Erreur lors de la clôture du vote')
  }
}

async function viewResults(vote) {
  selectedVote.value = vote
  loadingResults.value = true
  try {
    voteResults.value = await voteService.getVoteResults(vote.id)
  } catch (err) {
    console.error('Error fetching vote results:', err)
    voteResults.value = []
  } finally {
    loadingResults.value = false
  }
}

function closeResultsModal() {
  selectedVote.value = null
  voteResults.value = []
}

function getActivityTitle(activityId) {
  const activity = activities.value.find(a => a.id === activityId)
  return activity?.titre || 'Activité inconnue'
}

function formatDate(dateString) {
  if (!dateString) return 'Non définie'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getVoteStats(results) {
  const total = results.length
  const yes = results.filter(r => r.choix === true).length
  const no = total - yes
  return {
    total,
    yes,
    no,
    yesPercent: total > 0 ? Math.round((yes / total) * 100) : 0,
    noPercent: total > 0 ? Math.round((no / total) * 100) : 0
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des votes</h1>
      <p class="text-gray-600 mt-1">Consultez et gérez les votes de l'association</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Votes List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="vote in votes"
        :key="vote.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <span :class="['badge', vote.statut === 'OUVERT' ? 'badge-green' : 'badge-red']">
            {{ vote.statut }}
          </span>
          <span class="text-sm text-gray-500">#{{ vote.id }}</span>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ getActivityTitle(vote.activiteId) }}
        </h3>

        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date limite: {{ formatDate(vote.dateLimite) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Activité ID: {{ vote.activiteId }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button @click="viewResults(vote)" class="btn btn-secondary flex-1 text-sm py-2">
            Voir résultats
          </button>
          <button
            v-if="vote.statut === 'OUVERT'"
            @click="closeVote(vote.id)"
            class="btn btn-danger flex-1 text-sm py-2"
          >
            Clôturer
          </button>
        </div>
      </article>

      <div v-if="votes.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucun vote trouvé
      </div>
    </div>

    <!-- Vote Results Modal -->
    <div
      v-if="selectedVote"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      @click.self="closeResultsModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            Résultats du vote #{{ selectedVote.id }}
          </h2>
          <button @click="closeResultsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div v-if="loadingResults" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>

          <template v-else>
            <div class="mb-6">
              <h3 class="font-medium text-gray-900 mb-2">
                {{ getActivityTitle(selectedVote.activiteId) }}
              </h3>
              <p class="text-sm text-gray-500">
                Statut: {{ selectedVote.statut }} | Date limite: {{ formatDate(selectedVote.dateLimite) }}
              </p>
            </div>

            <div v-if="voteResults.length > 0" class="space-y-6">
              <!-- Stats -->
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">{{ getVoteStats(voteResults).total }}</p>
                  <p class="text-sm text-gray-500">Total votes</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <p class="text-2xl font-bold text-green-600">{{ getVoteStats(voteResults).yes }}</p>
                  <p class="text-sm text-gray-500">Pour</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg">
                  <p class="text-2xl font-bold text-red-600">{{ getVoteStats(voteResults).no }}</p>
                  <p class="text-sm text-gray-500">Contre</p>
                </div>
              </div>

              <!-- Progress bars -->
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-green-600 font-medium">Pour</span>
                    <span class="text-gray-500">{{ getVoteStats(voteResults).yesPercent }}%</span>
                  </div>
                  <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full transition-all"
                      :style="{ width: getVoteStats(voteResults).yesPercent + '%' }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-red-600 font-medium">Contre</span>
                    <span class="text-gray-500">{{ getVoteStats(voteResults).noPercent }}%</span>
                  </div>
                  <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-red-500 rounded-full transition-all"
                      :style="{ width: getVoteStats(voteResults).noPercent + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Vote list -->
              <div>
                <h4 class="font-medium text-gray-900 mb-3">Détail des votes</h4>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <div
                    v-for="result in voteResults"
                    :key="result.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-sm text-gray-600">Utilisateur #{{ result.utilisateurId }}</span>
                    <span :class="['badge', result.choix ? 'badge-green' : 'badge-red']">
                      {{ result.choix ? 'Pour' : 'Contre' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              Aucun vote enregistré
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
