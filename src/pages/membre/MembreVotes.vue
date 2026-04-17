<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import voteService from '@/services/voteService'
import activityService from '@/services/activityService'

const authStore = useAuthStore()
const votes = ref([])
const activities = ref([])
const loading = ref(true)
const voting = ref(null)
const voteSuccess = ref(null)
const voteError = ref(null)

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

async function submitVote(vote, choix) {
  voting.value = { voteId: vote.id, choix }
  voteError.value = null
  voteSuccess.value = null

  try {
    await voteService.participate(vote.id, choix)
    voteSuccess.value = vote.id
    setTimeout(() => {
      voteSuccess.value = null
    }, 3000)
  } catch (err) {
    if (err.response?.status === 409) {
      voteError.value = { id: vote.id, message: 'Vous avez déjà voté pour cette activité' }
    } else {
      try {
        await voteService.submitVote(authStore.user?.id, vote.id, choix)
        voteSuccess.value = vote.id
        setTimeout(() => {
          voteSuccess.value = null
        }, 3000)
      } catch (altErr) {
        if (altErr.response?.status === 409) {
          voteError.value = { id: vote.id, message: 'Vous avez déjà voté pour cette activité' }
        } else {
          voteError.value = { id: vote.id, message: 'Erreur lors du vote' }
        }
      }
    }
  } finally {
    voting.value = null
  }
}

function getActivityTitle(activityId) {
  const activity = activities.value.find(a => a.id === activityId)
  return activity?.titre || 'Activité inconnue'
}

function getActivityDescription(activityId) {
  const activity = activities.value.find(a => a.id === activityId)
  return activity?.description || ''
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

function isVotingFor(voteId, choix) {
  return voting.value?.voteId === voteId && voting.value?.choix === choix
}

function isVisibleVote(vote) {
  if (!vote) return false

  // statut réel
  const isOpen = vote.statut === 'OUVERT'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const limit = vote.dateLimite ? new Date(vote.dateLimite) : null
  if (limit) limit.setHours(0, 0, 0, 0)

  // visible si :
  // - ouvert
  // - ET (pas de date OU date valide)
  const isDateValid = !limit || limit >= today

  return isOpen && isDateValid
}

onMounted(fetchData)
</script>

<template>
  <div class="p-6">

    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Votes</h1>
      <p class="text-gray-600 mt-1">Participez aux votes de l'association</p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
    </div>

    <!-- LIST -->
    <div v-else class="space-y-5">

      <article
          v-for="vote in votes.filter(v => isVisibleVote(v))"
          :key="vote.id"
          class="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition"
      >

        <!-- HEADER CARD -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ getActivityTitle(vote.activiteId) }}
            </h3>
            <p class="text-xs text-gray-400">Vote #{{ vote.id }}</p>
          </div>

          <span
              class="text-xs px-3 py-1 rounded-full font-medium"
              :class="vote.statut === 'OUVERT'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'"
          >
            {{ vote.statut }}
          </span>
        </div>

        <!-- DESCRIPTION -->
        <p v-if="getActivityDescription(vote.activiteId)"
           class="text-sm text-gray-600 mb-3">
          {{ getActivityDescription(vote.activiteId) }}
        </p>

        <!-- DATE -->
        <div class="text-xs text-gray-500 mb-4">
          Date limite :
          <span class="font-medium text-gray-700">
            {{ formatDate(vote.dateLimite) }}
          </span>
        </div>

        <!-- SUCCESS -->
        <div
            v-if="voteSuccess === vote.id"
            class="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
        >
          ✔ Vote enregistré avec succès
        </div>

        <!-- ERROR -->
        <div
            v-if="voteError?.id === vote.id"
            class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {{ voteError.message }}
        </div>

        <!-- BUTTONS (UI ONLY MODIFIED) -->
        <div v-if="vote.statut === 'OUVERT'" class="flex justify-end gap-2">

          <button
              @click="submitVote(vote, true)"
              :disabled="voting !== null"
              class="px-3 py-1.5 text-xs rounded-md bg-green-500 text-white hover:bg-green-600 transition shadow-sm"
          >
            ✔ OUI
          </button>

          <button
              @click="submitVote(vote, false)"
              :disabled="voting !== null"
              class="px-3 py-1.5 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
          >
            ✖ NON
          </button>

        </div>

        <!-- CLOSED -->
        <div v-else class="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          Ce vote est clôturé
        </div>

      </article>

      <!-- EMPTY -->
      <div
          v-if="votes.filter(v => isVisibleVote(v)).length === 0"
          class="text-center py-12 text-gray-500"
      >
        Aucun vote disponible
      </div>

    </div>
  </div>
</template>