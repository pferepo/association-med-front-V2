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
    // Try the participation endpoint first
    await voteService.participate(vote.id, choix)
    voteSuccess.value = vote.id
    setTimeout(() => {
      voteSuccess.value = null
    }, 3000)
  } catch (err) {
    if (err.response?.status === 409) {
      voteError.value = { id: vote.id, message: 'Vous avez déjà voté pour cette activité' }
    } else {
      // Try alternative endpoint
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

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Votes</h1>
      <p class="text-gray-600 mt-1">Participez aux votes de l'association</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Votes List -->
    <div v-else class="space-y-6">
      <article
        v-for="vote in votes"
        :key="vote.id"
        class="card"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ getActivityTitle(vote.activiteId) }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">Vote #{{ vote.id }}</p>
          </div>
          <span :class="['badge', vote.statut === 'OUVERT' ? 'badge-green' : 'badge-red']">
            {{ vote.statut }}
          </span>
        </div>

        <p v-if="getActivityDescription(vote.activiteId)" class="text-gray-600 text-sm mb-4">
          {{ getActivityDescription(vote.activiteId) }}
        </p>

        <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date limite: {{ formatDate(vote.dateLimite) }}</span>
          </div>
        </div>

        <!-- Success Message -->
        <div
          v-if="voteSuccess === vote.id"
          class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
        >
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-green-700">Votre vote a été enregistré avec succès!</span>
        </div>

        <!-- Error Message -->
        <div
          v-if="voteError?.id === vote.id"
          class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
        >
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-700">{{ voteError.message }}</span>
        </div>

        <!-- Voting Buttons -->
        <div v-if="vote.statut === 'OUVERT'" class="flex items-center gap-4">
          <button
            @click="submitVote(vote, true)"
            :disabled="voting !== null"
            class="btn btn-success flex-1 py-3"
          >
            <span v-if="isVotingFor(vote.id, true)" class="inline-flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vote en cours...
            </span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Voter OUI
            </span>
          </button>
          <button
            @click="submitVote(vote, false)"
            :disabled="voting !== null"
            class="btn btn-danger flex-1 py-3"
          >
            <span v-if="isVotingFor(vote.id, false)" class="inline-flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Vote en cours...
            </span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Voter NON
            </span>
          </button>
        </div>

        <div v-else class="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
          Ce vote est clôturé
        </div>
      </article>

      <div v-if="votes.length === 0" class="text-center py-12 text-gray-500">
        Aucun vote disponible
      </div>
    </div>
  </div>
</template>
