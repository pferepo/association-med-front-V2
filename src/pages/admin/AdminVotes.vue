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

/* =========================
   LOAD DATA
========================= */
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
    console.error(err)
  } finally {
    loading.value = false
  }
}

/* =========================
   CLOSE VOTE
========================= */
async function closeVote(id, approve) {
  const msg = approve ? 'Approuver ce vote ?' : 'Refuser ce vote ?'
  if (!confirm(msg)) return

  try {
    await voteService.closeVote(id, approve)
    await fetchData()
  } catch (err) {
    alert('Erreur lors de la clôture du vote')
  }
}

/* =========================
   DELETE VOTE
========================= */
async function deleteVote(id) {
  if (!confirm('Supprimer ce vote ?')) return

  try {
    await voteService.deleteVote(id)
    await fetchData()
  } catch (err) {
    alert('Erreur lors de la suppression du vote')
  }
}

/* =========================
   VIEW RESULTS
========================= */
async function viewResults(vote) {
  selectedVote.value = vote
  loadingResults.value = true

  try {
    voteResults.value = await voteService.getVoteResults(vote.id)
  } catch (err) {
    voteResults.value = []
  } finally {
    loadingResults.value = false
  }
}

function closeResultsModal() {
  selectedVote.value = null
  voteResults.value = []
}

/* =========================
   HELPERS
========================= */
function getActivityTitle(activityId) {
  const a = activities.value.find(x => x.id === activityId)
  return a?.titre || 'Activité inconnue'
}

function formatDate(date) {
  if (!date) return 'Non définie'
  return new Date(date).toLocaleString('fr-FR')
}

function stats(results) {
  const total = results.length
  const yes = results.filter(r => r.choix).length
  const no = total - yes

  return {
    total,
    yes,
    no,
    yesPercent: total ? (yes * 100 / total) : 0,
    noPercent: total ? (no * 100 / total) : 0
  }
}

onMounted(fetchData)
</script>

<template>
  <div>

    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des votes</h1>
      <p class="text-gray-600 mt-1">Administration des votes des activités</p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- LIST -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <article
          v-for="vote in votes"
          :key="vote.id"
          class="card hover:shadow-lg transition-shadow"
      >

        <!-- HEADER -->
        <div class="flex items-start justify-between mb-4">
          <span :class="['badge', vote.statut === 'OUVERT' ? 'badge-green' : 'badge-red']">
            {{ vote.statut }}
          </span>

          <span class="text-sm text-gray-500">#{{ vote.id }}</span>
        </div>

        <!-- TITLE -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ getActivityTitle(vote.activiteId) }}
        </h3>

        <p class="text-sm text-gray-600 mb-4">
          Date limite: {{ formatDate(vote.dateLimite) }}
        </p>

        <!-- ACTIONS -->
        <div class="flex flex-col gap-2 pt-4 border-t border-gray-100">

          <button
              @click="viewResults(vote)"
              class="btn btn-secondary text-sm py-2"
          >
            Voir résultats
          </button>

          <div v-if="vote.statut === 'OUVERT'" class="flex gap-2">

            <!-- 🟢 VALIDER (UNCHANGED) -->
            <button
                @click="closeVote(vote.id, true)"
                class="btn btn-success flex-1 text-sm py-2"
            >
              Approuver
            </button>

            <!-- 🩷 REFUSER (soft red) -->
            <button
                @click="closeVote(vote.id, false)"
                class="btn bg-red-300 hover:bg-red-400 text-white flex-1 text-sm py-2"
            >
              Refuser
            </button>

          </div>

          <!-- 🔴 SUPPRIMER (strong red) -->
          <button
              @click="deleteVote(vote.id)"
              class="btn bg-red-600 hover:bg-red-700 text-white text-sm py-2"
          >
            Supprimer
          </button>

        </div>

      </article>

      <div v-if="votes.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucun vote trouvé
      </div>

    </div>

    <!-- MODAL RESULTS -->
    <div
        v-if="selectedVote"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
        @click.self="closeResultsModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">
            Résultats vote #{{ selectedVote.id }}
          </h2>
          <button @click="closeResultsModal">✕</button>
        </div>

        <div class="p-6">

          <div v-if="loadingResults" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          <template v-else>

            <div v-if="voteResults.length > 0">

              <div class="grid grid-cols-3 gap-4 mb-6">

                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-xl font-bold">{{ stats(voteResults).total }}</p>
                  <p class="text-sm text-gray-500">Total</p>
                </div>

                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <p class="text-xl font-bold text-green-600">{{ stats(voteResults).yes }}</p>
                  <p class="text-sm text-gray-500">Pour</p>
                </div>

                <div class="text-center p-4 bg-red-50 rounded-lg">
                  <p class="text-xl font-bold text-red-500">{{ stats(voteResults).no }}</p>
                  <p class="text-sm text-gray-500">Contre</p>
                </div>

              </div>

              <div class="space-y-2 max-h-60 overflow-y-auto">

                <div
                    v-for="r in voteResults"
                    :key="r.id"
                    class="flex justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span class="text-sm text-gray-600">
                    Utilisateur #{{ r.utilisateurId }}
                  </span>

                  <span :class="r.choix ? 'text-green-600' : 'text-red-500'">
                    {{ r.choix ? 'Pour' : 'Contre' }}
                  </span>
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