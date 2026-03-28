<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import activityService from '@/services/activityService'
import participationService from '@/services/participationService'

const authStore = useAuthStore()
const activities = ref([])
const loading = ref(true)
const showParticipationModal = ref(false)
const selectedActivity = ref(null)
const participating = ref(false)
const participationSuccess = ref(false)
const participationError = ref(null)

const participationForm = ref({
  nomParticipant: '',
  emailParticipant: ''
})

async function fetchActivities() {
  loading.value = true
  try {
    activities.value = await activityService.getAll()
  } catch (err) {
    console.error('Error fetching activities:', err)
  } finally {
    loading.value = false
  }
}

function openParticipationModal(activity) {
  selectedActivity.value = activity
  participationForm.value = {
    nomParticipant: authStore.userName || '',
    emailParticipant: authStore.user?.email || ''
  }
  participationSuccess.value = false
  participationError.value = null
  showParticipationModal.value = true
}

async function submitParticipation() {
  if (!selectedActivity.value) return
  
  participating.value = true
  participationError.value = null
  
  try {
    await participationService.create({
      nomParticipant: participationForm.value.nomParticipant,
      emailParticipant: participationForm.value.emailParticipant,
      activiteId: selectedActivity.value.id
    })
    participationSuccess.value = true
    setTimeout(() => {
      showParticipationModal.value = false
    }, 2000)
  } catch (err) {
    participationError.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
  } finally {
    participating.value = false
  }
}

function closeModal() {
  showParticipationModal.value = false
  selectedActivity.value = null
}

function getTypeColor(type) {
  const colors = {
    'FORMATION': 'bg-blue-100 text-blue-800',
    'EVENEMENT': 'bg-green-100 text-green-800',
    'REUNION': 'bg-purple-100 text-purple-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function getStatusColor(statut) {
  const colors = {
    'ACTIF': 'bg-green-100 text-green-800',
    'INACTIF': 'bg-gray-100 text-gray-800',
    'EN_COURS': 'bg-yellow-100 text-yellow-800',
    'TERMINE': 'bg-red-100 text-red-800'
  }
  return colors[statut] || 'bg-gray-100 text-gray-800'
}

onMounted(fetchActivities)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Activités</h1>
      <p class="text-gray-600 mt-1">Découvrez et participez aux activités de l'association</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Activities Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="activity in activities"
        :key="activity.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <span :class="['badge', getTypeColor(activity.type)]">
            {{ activity.type }}
          </span>
          <span :class="['badge', getStatusColor(activity.statut)]">
            {{ activity.statut }}
          </span>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ activity.titre }}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ activity.description }}</p>

        <div v-if="activity.membre && activity.membre.length > 0" class="mb-4">
          <p class="text-xs text-gray-500 mb-2">Membres associés:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(membre, index) in activity.membre.slice(0, 3)"
              :key="index"
              class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
            >
              {{ membre }}
            </span>
            <span v-if="activity.membre.length > 3" class="text-xs text-gray-500">
              +{{ activity.membre.length - 3 }}
            </span>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100">
          <button
            @click="openParticipationModal(activity)"
            class="btn btn-primary w-full"
          >
            Participer
          </button>
        </div>
      </article>

      <div v-if="activities.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucune activité disponible
      </div>
    </div>

    <!-- Participation Modal -->
    <div
      v-if="showParticipationModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Inscription à l'activité</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <!-- Success State -->
          <div v-if="participationSuccess" class="text-center py-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Inscription réussie!</h3>
            <p class="text-gray-600">Vous êtes maintenant inscrit à cette activité.</p>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="submitParticipation" class="space-y-4">
            <div v-if="selectedActivity" class="p-4 bg-primary-50 rounded-lg mb-4">
              <h3 class="font-semibold text-primary-900">{{ selectedActivity.titre }}</h3>
              <p class="text-sm text-primary-700">{{ selectedActivity.type }}</p>
            </div>

            <div v-if="participationError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {{ participationError }}
            </div>

            <div>
              <label class="form-label">Votre nom</label>
              <input
                v-model="participationForm.nomParticipant"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div>
              <label class="form-label">Votre email</label>
              <input
                v-model="participationForm.emailParticipant"
                type="email"
                class="form-input"
                required
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button type="button" @click="closeModal" class="btn btn-secondary flex-1">
                Annuler
              </button>
              <button type="submit" :disabled="participating" class="btn btn-primary flex-1">
                {{ participating ? 'Inscription...' : 'S\'inscrire' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
