<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import activityService from '@/services/activityService'
import participationService from '@/services/participationService'

const router = useRouter()

const activities = ref([])
const loading = ref(true)
const error = ref(null)

// Popup participation
const showParticipatePopup = ref(false)
const participateEmail = ref('')
const participateFirstName = ref('')
const participateLastName = ref('')
const participateActivity = ref(null)
const participateMessage = ref('')
const participateMessageType = ref('')
const submittingParticipation = ref(false)

// Charger activités (UNIQUEMENT ACTIVES)
onMounted(async () => {
  try {
    const data = await activityService.getForGuests()

    activities.value = data
        .filter(act => act.statut === 'VALIDEE')
        .map(act => ({ ...act, participated: false }))

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
    FORMATION: 'bg-blue-100 text-blue-700',
    EVENEMENT: 'bg-green-100 text-green-700',
    REUNION: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

// ouvrir popup
function openParticipate(activity) {
  participateActivity.value = activity
  participateEmail.value = ''
  participateFirstName.value = ''
  participateLastName.value = ''
  participateMessage.value = ''
  participateMessageType.value = ''
  showParticipatePopup.value = true
}

// submit participation
async function submitParticipation() {
  if (!participateEmail.value || !participateFirstName.value || !participateLastName.value) {
    participateMessage.value = 'Veuillez remplir tous les champs'
    participateMessageType.value = 'error'
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

    participateMessage.value = 'Participation enregistrée avec succès ✅'
    participateMessageType.value = 'success'

    setTimeout(() => {
      showParticipatePopup.value = false
    }, 1500)

  } catch (err) {
    participateMessage.value =
        err.response?.data?.message || 'Erreur lors de la participation'
    participateMessageType.value = 'error'

  } finally {
    submittingParticipation.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">

    <!-- HEADER -->
    <header class="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <img src="@/assets/logo.png" class="h-10" />

        <button
            @click="goToLogin"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Se connecter
        </button>
      </div>
    </header>

    <!-- HERO -->
    <section class="text-center py-14">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-3">
        Activités disponibles
      </h1>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Découvrez les activités ouvertes aux visiteurs et rejoignez-les facilement.
      </p>
    </section>

    <!-- CONTENT -->
    <section class="max-w-7xl mx-auto px-6 pb-20">

      <!-- loading -->
      <div v-if="loading" class="flex justify-center py-10">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <!-- error -->
      <div v-else-if="error" class="text-center text-red-600">
        {{ error }}
      </div>

      <!-- empty -->
      <div v-else-if="activities.length === 0" class="text-center py-16">
        <div class="text-5xl mb-3">📭</div>
        <h2 class="text-xl font-semibold text-gray-700">
          Aucune activité active
        </h2>
        <p class="text-gray-500 mt-2">
          Revenez plus tard pour découvrir de nouvelles activités
        </p>
      </div>

      <!-- grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <article
            v-for="activity in activities"
            :key="activity.id"
            class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden group"
        >

          <!-- top bar -->
          <div class="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

          <div class="p-5">

            <!-- type -->
            <div class="flex justify-between mb-3">
              <span :class="['px-3 py-1 text-xs font-semibold rounded-full', getTypeColor(activity.type)]">
                {{ activity.type }}
              </span>
            </div>

            <!-- title -->
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
              {{ activity.titre }}
            </h3>

            <!-- description -->
            <p class="text-gray-600 text-sm mt-2 line-clamp-3">
              {{ activity.description }}
            </p>

            <!-- footer -->
            <div class="flex justify-between items-center mt-5 pt-4 border-t">

              <span class="text-green-600 text-sm font-semibold">
                ● Actif
              </span>

              <button
                  @click="openParticipate(activity)"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
              >
                Participer
              </button>

            </div>

          </div>
        </article>

      </div>

    </section>

    <!-- POPUP -->
    <div v-if="showParticipatePopup"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div class="bg-white rounded-xl p-6 w-96">

        <h3 class="text-lg font-bold mb-4">
          Participer à "{{ participateActivity.titre }}"
        </h3>

        <input v-model="participateFirstName" placeholder="Prénom"
               class="w-full border rounded px-3 py-2 mb-2">

        <input v-model="participateLastName" placeholder="Nom"
               class="w-full border rounded px-3 py-2 mb-2">

        <input v-model="participateEmail" placeholder="Email"
               class="w-full border rounded px-3 py-2 mb-3">

        <p v-if="participateMessage"
           class="text-sm mb-2"
           :class="participateMessageType === 'error' ? 'text-red-600' : 'text-green-600'">
          {{ participateMessage }}
        </p>

        <div class="flex justify-end gap-2">
          <button @click="showParticipatePopup = false"
                  class="px-4 py-2 bg-gray-200 rounded">
            Annuler
          </button>

          <button @click="submitParticipation"
                  :disabled="submittingParticipation"
                  class="px-4 py-2 bg-blue-600 text-white rounded">
            {{ submittingParticipation ? 'Envoi...' : 'Envoyer' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>