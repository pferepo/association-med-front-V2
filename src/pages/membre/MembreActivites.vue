<script setup>
import { ref, onMounted } from 'vue'
import activityService from '@/services/activityService'

const activities = ref([])
const loading = ref(true)
const showModal = ref(false)

// Formulaire pour proposer une activité
const form = ref({
  titre: '',
  description: '',
  type: 'FORMATION',
  membre: [],
  statut: 'EN_ATTENTE',        // fixe pour membre
  statutProposition: 'PROPOSITION' // fixe pour membre
})

const membreInput = ref('')
const saving = ref(false)
const error = ref(null)

// Récupération uniquement des activités en proposition
async function fetchActivities() {
  loading.value = true
  try {
    const allActivities = await activityService.getAll()
    activities.value = allActivities.filter(a => a.statutProposition === 'PROPOSITION')
  } catch (err) {
    console.error('Erreur lors du chargement des activités :', err)
  } finally {
    loading.value = false
  }
}

async function saveActivity() {
  saving.value = true
  error.value = null
  try {
    await activityService.create(form.value)
    showModal.value = false
    resetForm()
    await fetchActivities()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la proposition'
  } finally {
    saving.value = false
  }
}

function resetForm() {
  form.value = {
    titre: '',
    description: '',
    type: 'FORMATION',
    membre: [],
    statut: 'EN_ATTENTE',
    statutProposition: 'PROPOSITION'
  }
  membreInput.value = ''
  error.value = null
}

function openModal() {
  resetForm()
  showModal.value = true
}

function addMembre() {
  if (membreInput.value.trim() && !form.value.membre.includes(membreInput.value.trim())) {
    form.value.membre.push(membreInput.value.trim())
    membreInput.value = ''
  }
}

function removeMembre(index) {
  form.value.membre.splice(index, 1)
}

// Couleur type
function getTypeColor(type) {
  const colors = {
    'FORMATION': 'badge-blue',
    'EVENEMENT': 'badge-green',
    'REUNION': 'badge-yellow'
  }
  return colors[type] || 'badge-gray'
}

// Couleur statut
function getStatusColor(statut) {
  const colors = {
    'EN_ATTENTE': 'badge-yellow',
    'VALIDEE': 'badge-green',
    'REFUSEE': 'badge-red'
  }
  return colors[statut] || 'badge-gray'
}

onMounted(fetchActivities)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Activités proposées</h1>
        <p class="text-gray-600 mt-1">Proposez de nouvelles activités pour l'association</p>
      </div>
      <button @click="openModal" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Proposer nouvelle activité
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Grid des activités -->
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
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ activity.description }}</p>

        <div v-if="activity.membre && activity.membre.length > 0" class="mb-4">
          <p class="text-xs text-gray-500 mb-2">Membres:</p>
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
      </article>

      <div v-if="activities.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucune activité trouvée
      </div>
    </div>

    <!-- Modal pour proposer une activité -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            Proposer une nouvelle activité
          </h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveActivity" class="p-6 space-y-4">
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {{ error }}
          </div>

          <div>
            <label class="form-label">Titre</label>
            <input v-model="form.titre" type="text" class="form-input" required />
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea v-model="form.description" rows="3" class="form-input" required></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Type</label>
              <select v-model="form.type" class="form-input">
                <option value="FORMATION">Formation</option>
                <option value="EVENEMENT">Événement</option>
                <option value="REUNION">Réunion</option>
              </select>
            </div>
            <div>
              <label class="form-label">Membres associés</label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="membreInput"
                  type="text"
                  class="form-input flex-1"
                  placeholder="Nom du membre"
                  @keyup.enter.prevent="addMembre"
                />
                <button type="button" @click="addMembre" class="btn btn-secondary">
                  Ajouter
                </button>
              </div>
              <div v-if="form.membre.length > 0" class="flex flex-wrap gap-2">
                <span
                  v-for="(membre, index) in form.membre"
                  :key="index"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {{ membre }}
                  <button type="button" @click="removeMembre(index)" class="text-gray-400 hover:text-red-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Boutons proposer / annuler -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" :disabled="saving" class="btn btn-primary flex-1">
              {{ saving ? 'Proposition...' : 'Proposer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>