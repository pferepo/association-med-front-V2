<script setup>
import { ref, onMounted } from 'vue'
import activityService from '@/services/activityService'

const activities = ref([])
const loading = ref(true)
const showModal = ref(false)

// FORMULAIRE ORIGINAL (inchangé)
const form = ref({
  titre: '',
  description: '',
  type: 'FORMATION',
  membre: [],
  statut: 'EN_ATTENTE',
  statutProposition: 'PROPOSITION'
})

const membreInput = ref('')
const saving = ref(false)
const error = ref(null)

// 🔥 récupérer toutes les activités
async function fetchActivities() {
  loading.value = true
  try {
    activities.value = await activityService.getAll()
  } catch (err) {
    console.error(err)
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
      console.error(err.response)
      console.error(err.response?.data)
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

// 🎨 BADGES
function getTypeColor(type) {
  return {
    FORMATION: 'badge-blue',
    EVENEMENT: 'badge-green',
    REUNION: 'badge-yellow'
  }[type] || 'badge-gray'
}

function getStatusColor(statut) {
  return {
    EN_ATTENTE: 'badge-yellow',
    VALIDEE: 'badge-green',
    REFUSEE: 'badge-red'
  }[statut] || 'badge-gray'
}

// COULEUR CARTE SELON statutProposition
function getCardColor(activity) {
  switch (activity.statutProposition) {
    case 'PROPOSITION':
      return 'bg-green-50 border-2 border-green-300 shadow-sm'
    case 'REJETE':
      return 'bg-red-50 border-2 border-red-400 shadow-sm'
    case 'POUR_VOTE':
      return 'bg-yellow-50 border-2 border-yellow-300 shadow-sm'
    case 'SANS_VOTE':
      return 'bg-gray-50 border-2 border-gray-300 shadow-sm'
    default:
      return 'bg-white'
  }
}

// COULEUR BADGE STATUT PROPOSITION
function getStatutPropositionColor(statutProposition) {
  switch (statutProposition) {
    case 'PROPOSITION':
      return 'bg-green-100 text-green-800'
    case 'REJETE':
      return 'bg-red-100 text-red-800'
    case 'POUR_VOTE':
      return 'bg-yellow-100 text-yellow-800'
    case 'SANS_VOTE':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

onMounted(fetchActivities)
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Activités proposées</h1>
        <p class="text-gray-600 mt-1">Proposez de nouvelles activités</p>
      </div>

      <button @click="openModal" class="btn btn-primary">
        + Proposer nouvelle activité
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- GRID -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <article
          v-for="activity in activities"
          :key="activity.id"
          class="card p-4 transition-shadow rounded-xl flex flex-col gap-2"
          :class="getCardColor(activity)"
      >
        <!-- STATUT PROPOSITION EN HAUT DROITE DANS FLEX -->
        <div class="flex justify-end">
          <span
              class="text-xs font-semibold px-3 py-1 rounded-full"
              :class="getStatutPropositionColor(activity.statutProposition)"
          >
            {{ activity.statutProposition }}
          </span>
        </div>

        <!-- TYPE & STATUT BADGES -->
        <div class="flex items-start justify-between mb-1">
          <span :class="['badge', getTypeColor(activity.type)]">
            {{ activity.type }}
          </span>

          <span :class="['badge', getStatusColor(activity.statut)]">
            {{ activity.statut }}
          </span>
        </div>

        <!-- CONTENU -->
        <h3 class="text-lg font-semibold text-gray-900">
          {{ activity.titre }}
        </h3>

        <p class="text-gray-600 text-sm">
          {{ activity.description }}
        </p>

        <!-- MEMBRES -->
        <div v-if="activity.membre?.length" class="mt-2">
          <p class="text-xs text-gray-500 mb-1">Membres:</p>
          <div class="flex flex-wrap gap-1">
            <span
                v-for="(membre, index) in activity.membre.slice(0,3)"
                :key="index"
                class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
            >
              {{ membre }}
            </span>
          </div>
        </div>
      </article>

      <div v-if="activities.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucune activité trouvée
      </div>
    </div>

    <!-- MODAL FORMULAIRE ORIGINAL -->
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
            ✕
          </button>
        </div>

        <form @submit.prevent="saveActivity" class="p-6 space-y-4">

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
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
              <label class="form-label">Membres</label>

              <div class="flex gap-2 mb-2">
                <input
                    v-model="membreInput"
                    type="text"
                    class="form-input flex-1"
                    @keyup.enter.prevent="addMembre"
                />
                <button type="button" @click="addMembre" class="btn btn-secondary">
                  Ajouter
                </button>
              </div>

              <div class="flex flex-wrap gap-2">
                <span
                    v-for="(m, i) in form.membre"
                    :key="i"
                    class="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {{ m }}
                  <button @click="removeMembre(i)">x</button>
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ saving ? 'Proposition...' : 'Proposer' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>