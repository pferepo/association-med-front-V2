<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import activityService from '@/services/activityService'
import participationService from '@/services/participationService'

const router = useRouter()
const activities = ref([])
const loading = ref(true)
const error = ref(null)

// Popup de participation
const showParticipatePopup = ref(false)
const participateEmail = ref('')
const participateFirstName = ref('')
const participateLastName = ref('')
const participateActivity = ref(null)
const participateMessage = ref('')
const participateMessageType = ref('') // ✅ AJOUT
const submittingParticipation = ref(false) // état d'envoi

// Charger les activités
onMounted(async () => {
  try {
    const data = await activityService.getForGuests()
    activities.value = data.map(act => ({ ...act, participated: false }))
  } catch (err) {
    error.value = 'Impossible de charger les activités'
  } finally {
    loading.value = false
  }
})

function goToLogin() {
  router.push('/login')
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

// Ouvrir popup participation
function openParticipate(activity) {
  participateActivity.value = activity
  participateEmail.value = ''
  participateFirstName.value = ''
  participateLastName.value = ''
  participateMessage.value = ''
  participateMessageType.value = '' // ✅ AJOUT
  showParticipatePopup.value = true
}

// Soumettre participation via backend
async function submitParticipation() {
  if (!participateEmail.value || !participateFirstName.value || !participateLastName.value) {
    participateMessage.value = 'Veuillez remplir tous les champs'
    participateMessageType.value = 'error' // ✅ AJOUT
    return
  }

  submittingParticipation.value = true
  participateMessage.value = ''

  try {
    await participationService.create({
      nomParticipant: participateLastName.value,
      prenomParticipant: participateFirstName.value,
      emailParticipant: participateEmail.value,
      activiteId: participateActivity.value.id
    })

    const index = activities.value.findIndex(a => a.id === participateActivity.value.id)
    if (index !== -1) activities.value[index].participated = true

    participateMessage.value = `Merci ${participateFirstName.value} ${participateLastName.value} ! Votre participation a été enregistrée.`
    participateMessageType.value = 'success' // ✅ AJOUT

    participateEmail.value = ''
    participateFirstName.value = ''
    participateLastName.value = ''

    setTimeout(() => {
      showParticipatePopup.value = false
      participateMessage.value = ''
    }, 2000)

  } catch (err) {
    participateMessage.value = err.response?.data?.message || 'Erreur lors de l\'envoi de votre participation'
    participateMessageType.value = 'error' // ✅ AJOUT
  } finally {
    submittingParticipation.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">

    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <img src="@/assets/logo.png" alt="Logo" class="h-12 object-contain">
          </div>
          <button @click="goToLogin" class="btn btn-primary">Se connecter</button>
        </div>
      </div>
    </header>

    <!-- Activities Section -->
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Nos Activités</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Découvrez les activités ouvertes au public. Connectez-vous pour participer et voter.
          </p>
        </div>

        <div>
          <div v-if="loading" class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

          <div v-else-if="activities.length === 0" class="text-center py-12 text-gray-600">
            Aucune activité disponible
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article v-for="activity in activities" :key="activity.id"
                     class="card hover:shadow-lg transition-shadow duration-300 p-4 bg-white rounded-lg">
              <div class="flex items-start justify-between mb-4">
                <span :class="['badge', getTypeColor(activity.type)]">{{ activity.type }}</span>
                <span :class="['badge', getStatusColor(activity.statut)]">{{ activity.statut }}</span>
              </div>

              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ activity.titre }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ activity.description }}</p>

              <div class="pt-4 border-t border-gray-100 flex justify-between items-center">
                <template v-if="activity.participated">
                  <span class="text-green-600 font-semibold">Participation envoyée ✅</span>
                </template>
                <template v-else>
                  <button @click="openParticipate(activity)" class="btn btn-primary text-sm px-4 py-2">
                    Je veux participer
                  </button>
                </template>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Popup Participation -->
    <div v-if="showParticipatePopup" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-80">
        <h3 class="text-lg font-bold mb-4">
          Participer à "{{ participateActivity.titre }}"
        </h3>

        <input type="text" v-model="participateFirstName" placeholder="Votre prénom" class="w-full border rounded px-3 py-2 mb-2">
        <input type="text" v-model="participateLastName" placeholder="Votre nom" class="w-full border rounded px-3 py-2 mb-2">
        <input type="email" v-model="participateEmail" placeholder="Votre email" class="w-full border rounded px-3 py-2 mb-4">

        <!-- Message dynamique -->
        <p v-if="participateMessage"
           class="text-sm mb-2"
           :class="participateMessageType === 'error' ? 'text-red-600' : 'text-green-600'">
          {{ participateMessage }}
        </p>

        <div class="flex justify-end gap-2">
          <button @click="showParticipatePopup = false" class="btn btn-secondary px-4 py-2">Annuler</button>
          <button @click="submitParticipation" :disabled="submittingParticipation" class="btn btn-primary px-4 py-2">
            {{ submittingParticipation ? 'Envoi...' : 'Envoyer' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>