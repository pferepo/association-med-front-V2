<script setup>
import { ref, onMounted, watch } from 'vue'
import activityService from '@/services/activityService'
import userService from '@/services/userService'

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
  modeEnvoi: 'MEMBRES',

  dateLimiteVote: ''
})

const membreInput = ref('')
const saving = ref(false)
const error = ref(null)

/* =========================
   MODE ENVOI (RADIO LOGIC)
========================= */
watch(() => form.value.modeEnvoi, async (val) => {
  if (val === 'ABONNES') {
    try {
      const emails = await userService.getAllEmails()
      form.value.membre = emails
    } catch (e) {
      console.error(e)
    }
  }

  if (val === 'MEMBRES') {
    try {
      const emailsB = await userService.getAllEmailsBureau()
      form.value.membre = emailsB
    } catch (e) {
      console.error(e)
    }
    }
})

/* =========================
   AUTO DATE VOTE
========================= */
watch(() => form.value.statutProposition, (val) => {
  if (val === 'POUR_VOTE') {
    if (!form.value.dateLimiteVote) {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      form.value.dateLimiteVote = d.toISOString().slice(0, 16)
    }
  } else {
    form.value.dateLimiteVote = ''
  }
})

/* =========================
   FETCH
========================= */
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

function clearEmails() {
  form.value.membre = []
}

/* =========================
   SAVE
========================= */
async function saveActivity() {
  saving.value = true
  error.value = null

  try {
    const payload = {
      ...form.value,
      dateLimiteVote:
          form.value.statutProposition === 'POUR_VOTE'
              ? form.value.dateLimiteVote
              : null
    }

    if (editingActivity.value) {
      await activityService.update(editingActivity.value.id, payload)
    } else {
      await activityService.create(payload)
    }

    showModal.value = false
    resetForm()
    await fetchActivities()

  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur sauvegarde'
  } finally {
    saving.value = false
  }
}

/* =========================
   DELETE
========================= */
async function deleteActivity(id) {
  if (!confirm('Supprimer cette activité ?')) return
  await activityService.delete(id)
  await fetchActivities()
}

/* =========================
   EDIT
========================= */
function editActivity(activity) {
  editingActivity.value = activity

  form.value = {
    titre: activity.titre,
    description: activity.description,
    type: activity.type,
    membre: activity.membre || [],
    statut: activity.statut,
    statutProposition: activity.statutProposition,
    modeEnvoi: 'MEMBRES',

    dateLimiteVote: activity.dateLimiteVote
        ? activity.dateLimiteVote.substring(0, 16)
        : ''
  }

  showModal.value = true
}

/* =========================
   RESET
========================= */
function resetForm() {
  editingActivity.value = null

  form.value = {
    titre: '',
    description: '',
    type: 'FORMATION',
    membre: [],
    statut: 'EN_ATTENTE',
    statutProposition: 'SANS_VOTE',
    modeEnvoi: 'MEMBRES',
    dateLimiteVote: ''
  }

  membreInput.value = ''
  error.value = null
}

function openModal() {
  resetForm()
  showModal.value = true
}

/* =========================
   MEMBRES
========================= */
function addMembre() {
  if (
      membreInput.value.trim() &&
      !form.value.membre.includes(membreInput.value.trim())
  ) {
    form.value.membre.push(membreInput.value.trim())
    membreInput.value = ''
  }
}

function removeMembre(index) {
  form.value.membre.splice(index, 1)
}

/* =========================
   COLORS
========================= */
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
        <p class="text-gray-600 mt-1">Créer et gérer les activités</p>
      </div>

      <button @click="openModal" class="btn btn-primary">
        + Nouvelle activité
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- LIST -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <article
          v-for="activity in activities"
          :key="activity.id"
          class="card p-4 border rounded-lg"
      >

        <div class="flex gap-2 mb-3 flex-wrap">
          <span :class="['badge', getTypeColor(activity.type)]">{{ activity.type }}</span>
          <span :class="['badge', getStatusColor(activity.statut)]">{{ activity.statut }}</span>
          <span :class="['badge', getPropositionColor(activity.statutProposition)]">
            {{ activity.statutProposition }}
          </span>
        </div>

        <h3 class="font-semibold mb-2">{{ activity.titre }}</h3>
        <p class="text-sm text-gray-600 mb-3">{{ activity.description }}</p>

        <div v-if="activity.dateLimiteVote" class="text-xs text-gray-500 mb-2">
          Vote jusqu’au : {{ activity.dateLimiteVote }}
        </div>

        <div class="flex gap-2 mt-3">
          <button @click="editActivity(activity)" class="btn btn-secondary flex-1">
            Modifier
          </button>

          <button @click="deleteActivity(activity.id)" class="btn btn-danger flex-1">
            Supprimer
          </button>
        </div>

      </article>

    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black/50">
      <div class="bg-white p-6 rounded-xl w-full max-w-lg">

        <form @submit.prevent="saveActivity" class="space-y-4">

          <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

          <input v-model="form.titre" class="form-input" placeholder="Titre" required />
          <textarea v-model="form.description" class="form-input" placeholder="Description" required />

          <div class="grid grid-cols-2 gap-2">
            <select v-model="form.type" class="form-input">
              <option value="FORMATION">Formation</option>
              <option value="EVENEMENT">Événement</option>
              <option value="REUNION">Réunion</option>
            </select>

            <select v-model="form.statut" class="form-input">
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validée</option>
              <option value="REFUSEE">Refusée</option>
            </select>
          </div>

          <select v-model="form.statutProposition" class="form-input">
            <option value="POUR_VOTE">Pour vote</option>
            <option value="SANS_VOTE">Sans vote</option>
            <option value="REJETE">Rejeté</option>
            <option value="PROPOSITION">Proposition</option>
          </select>

          <!-- DATE -->
          <div v-if="form.statutProposition === 'POUR_VOTE'">
            <label class="text-sm text-gray-600">Date limite de vote</label>
            <input type="datetime-local" v-model="form.dateLimiteVote" class="form-input" />
          </div>

          <!-- MODE ENVOI -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Mode d’envoi</label>

            <label class="flex items-center gap-2">
              <input type="radio" value="ABONNES" v-model="form.modeEnvoi" />
              Envoyer à tous les abonnés
            </label>

            <label class="flex items-center gap-2">
              <input type="radio" value="MEMBRES" v-model="form.modeEnvoi" />
              Envoyer au membre de bureau
            </label>
          </div>

          <!-- MEMBRES -->
          <div>
            <input
                v-model="membreInput"
                :disabled="form.modeEnvoi === 'ABONNES'"
                class="form-input"
                placeholder="Email membre"
                @keyup.enter.prevent="addMembre"
            />

            <div class="flex items-center gap-2 mt-2">

              <button
                  type="button"
                  @click="addMembre"
                  :disabled="form.modeEnvoi === 'ABONNES'"
                  class="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
              >
                ➕ Ajouter
              </button>

              <button
                  type="button"
                  @click="clearEmails"
                  class="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  v-if="form.membre.length > 0"
              >
                🗑 Vider les emails
              </button>

            </div>

            <div class="flex flex-wrap gap-2 mt-2">
              <span
                  v-for="(m,i) in form.membre"
                  :key="i"
                  class="bg-gray-200 px-2 py-1 rounded"
              >
                {{ m }}
                <button type="button" @click="removeMembre(i)">x</button>
              </span>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="flex gap-2">
            <button type="button" @click="showModal=false" class="btn btn-secondary flex-1">
              Annuler
            </button>

            <button type="submit" class="btn btn-primary flex-1">
              {{ saving ? '...' : (editingActivity ? 'Mettre à jour' : 'Créer') }}
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>