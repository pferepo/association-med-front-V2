<script setup>
import { ref, onMounted } from 'vue'
import activityService from '@/services/activityService'

const activities = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingActivity = ref(null)

const form = ref({
  titre: '',
  description: '',
  type: 'FORMATION',
  membre: [],
  statut: 'EN_ATTENTE',
  statutProposition: 'SANS_VOTE',
  envoyerATous: false // ✅ AJOUT
})

const membreInput = ref('')
const saving = ref(false)
const error = ref(null)

// 🔥 Récupération des activités
async function fetchActivities() {
  loading.value = true
  try {
    activities.value = await activityService.getAll()
  } catch (err) {
    console.error('Erreur récupération activités:', err)
  } finally {
    loading.value = false
  }
}

// 🔥 Sauvegarde ou création
async function saveActivity() {
  saving.value = true
  error.value = null
  try {
    if (editingActivity.value) {
      await activityService.update(editingActivity.value.id, form.value)
    } else {
      await activityService.create(form.value)
    }
    showModal.value = false
    resetForm()
    await fetchActivities()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

// 🔥 Suppression
async function deleteActivity(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return
  try {
    await activityService.delete(id)
    await fetchActivities()
  } catch (err) {
    alert('Erreur lors de la suppression')
  }
}

// 🔥 Édition
function editActivity(activity) {
  editingActivity.value = activity
  form.value = {
    titre: activity.titre,
    description: activity.description,
    type: activity.type,
    membre: activity.membre || [],
    statut: activity.statut,
    statutProposition: activity.statutProposition,
    envoyerATous: false
  }
  showModal.value = true
}

// 🔥 Réinitialiser formulaire
function resetForm() {
  editingActivity.value = null
  form.value = {
    titre: '',
    description: '',
    type: 'FORMATION',
    membre: [],
    statut: 'EN_ATTENTE',
    statutProposition: 'SANS_VOTE',
    envoyerATous: false
  }
  membreInput.value = ''
  error.value = null
}

// 🔥 Ouvrir modal
function openModal() {
  resetForm()
  showModal.value = true
}

// 🔥 Gestion membres
function addMembre() {
  if (membreInput.value.trim() && !form.value.membre.includes(membreInput.value.trim())) {
    form.value.membre.push(membreInput.value.trim())
    membreInput.value = ''
  }
}

function removeMembre(index) {
  form.value.membre.splice(index, 1)
}

// 🔥 Couleurs badges
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
    REFUSEE: 'badge-red',
    EN_COURS: 'badge-blue',
    TERMINE: 'badge-purple'
  }[statut] || 'badge-gray'
}

function getPropositionColor(statutProposition) {
  return {
    POUR_VOTE: 'badge-blue',
    SANS_VOTE: 'badge-gray',
    REJETE: 'badge-red',
    PROPOSITION: 'badge-purple'
  }[statutProposition] || 'badge-gray'
}

onMounted(fetchActivities)
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des activités</h1>
        <p class="text-gray-600 mt-1">Créez et gérez les activités de l'association</p>
      </div>
      <button @click="openModal" class="btn btn-primary">
        + Nouvelle activité
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- GRID ACTIVITES -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
          v-for="activity in activities"
          :key="activity.id"
          class="card p-4 transition-shadow hover:shadow-lg border border-gray-200 rounded-lg"
      >
        <!-- BADGES TYPE / STATUT / PROPOSITION -->
        <div class="flex items-start justify-between mb-3 gap-2 flex-wrap">
          <span :class="['badge', getTypeColor(activity.type)]">{{ activity.type }}</span>
          <span :class="['badge', getStatusColor(activity.statut)]">{{ activity.statut }}</span>
          <span :class="['badge', getPropositionColor(activity.statutProposition)]">{{ activity.statutProposition }}</span>
        </div>

        <!-- TITRE & DESCRIPTION -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ activity.titre }}</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-3">{{ activity.description }}</p>

        <!-- MEMBRES -->
        <div v-if="activity.membre?.length" class="mb-3">
          <p class="text-xs text-gray-500 mb-1">Membres:</p>
          <div class="flex flex-wrap gap-1">
            <span
                v-for="(m, i) in activity.membre.slice(0, 3)"
                :key="i"
                class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
            >{{ m }}</span>
            <span v-if="activity.membre.length > 3" class="text-xs text-gray-500">+{{ activity.membre.length - 3 }}</span>
          </div>
        </div>

        <!-- ✅ CORRECTION ICI -->
        <div v-if="activity.createur" class="mt-2">
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
            Proposé par: {{ activity.createur }}
          </span>
        </div>

        <!-- ACTIONS -->
        <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button @click="editActivity(activity)" class="btn btn-secondary flex-1 text-sm py-2">Modifier</button>
          <button @click="deleteActivity(activity.id)" class="btn btn-danger flex-1 text-sm py-2">Supprimer</button>
        </div>
      </article>

      <div v-if="activities.length === 0" class="col-span-full text-center py-12 text-gray-500">
        Aucune activité trouvée
      </div>
    </div>

    <!-- MODAL FORMULAIRE -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50" @click.self="showModal=false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form @submit.prevent="saveActivity" class="p-6 space-y-4">

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{{ error }}</div>

          <div>
            <label class="form-label">Titre</label>
            <input v-model="form.titre" type="text" class="form-input" required />
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea v-model="form.description" rows="3" class="form-input" required></textarea>
          </div>

          <!-- ✅ CHECKBOX AJOUTÉE (BON ENDROIT) -->
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.envoyerATous" id="envoyerTous" />
            <label for="envoyerTous" class="text-sm text-gray-700">
              Envoyer cette activité à tous les abonnés
            </label>
          </div>

          <div v-if="form.envoyerATous" class="text-xs text-green-600">
            Tous les utilisateurs recevront un email
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
              <label class="form-label">Statut</label>
              <select v-model="form.statut" class="form-input">
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDEE">Validée</option>
                <option value="REFUSEE">Refusée</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Statut de proposition</label>
            <select v-model="form.statutProposition" class="form-input">
              <option value="POUR_VOTE">Pour vote</option>
              <option value="SANS_VOTE">Sans vote</option>
              <option value="REJETE">Rejeté</option>
              <option value="PROPOSITION">Proposition</option>
            </select>
          </div>

          <div>
            <label class="form-label">Membres associés</label>
            <div class="flex gap-2 mb-2">
              <input v-model="membreInput" type="text" class="form-input flex-1" placeholder="Nom du membre" @keyup.enter.prevent="addMembre" />
              <button type="button" @click="addMembre" class="btn btn-secondary">Ajouter</button>
            </div>

            <div v-if="form.membre.length > 0" class="flex flex-wrap gap-2">
              <span v-for="(m, i) in form.membre" :key="i" class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {{ m }}
                <button type="button" @click="removeMembre(i)" class="text-gray-400 hover:text-red-500">x</button>
              </span>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal=false" class="btn btn-secondary flex-1">Annuler</button>
            <button type="submit" :disabled="saving" class="btn btn-primary flex-1">
              {{ saving ? 'Sauvegarde...' : (editingActivity ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>