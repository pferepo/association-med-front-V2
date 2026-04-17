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
  <div class="min-h-screen bg-background">

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        <!-- LOGO -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
            <span class="text-lg font-bold text-white">🏥</span>
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-bold text-foreground">AMB</p>
            <p class="text-xs text-muted-foreground leading-none">Médicale</p>
          </div>
        </div>

        <!-- NAV -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
          <router-link to="/about" class="text-muted-foreground hover:text-primary transition-colors">
            Qui sommes-nous ?
          </router-link>
          <router-link to="/contact" class="text-muted-foreground hover:text-primary transition-colors">
            Contactez-nous
          </router-link>
        </nav>

        <!-- LOGIN BTN -->
        <button
            @click="goToLogin"
            class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Se connecter
        </button>

      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-24 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="space-y-6 max-w-3xl mx-auto">
          <div class="inline-flex items-center justify-center">
            <div class="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <span class="text-5xl">🏥</span>
            </div>
          </div>

          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Rejoignez Nos Activités
          </h1>

          <p class="text-xl text-muted-foreground leading-relaxed">
            Découvrez les événements, formations et réunions de l&apos;Association Médicale de Ben Guerdane. Participez facilement sans compte.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a href="#activities" class="px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all">
              Voir les Activités
            </a>
            <router-link to="/about" class="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all">
              En Savoir Plus
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section class="bg-muted/30 py-12 border-y border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <p class="text-4xl font-bold text-primary mb-2">500+</p>
            <p class="text-muted-foreground">Professionnels Actifs</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-accent mb-2">50+</p>
            <p class="text-muted-foreground">Activités par An</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-secondary mb-2">15+</p>
            <p class="text-muted-foreground">Années d&apos;Expérience</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ACTIVITIES SECTION -->
    <section id="activities" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">Activités Disponibles</h2>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez nos formations, événements et réunions professionnelles
        </p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-muted-foreground flex flex-col items-center gap-3">
          <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          <span>Chargement des activités...</span>
        </div>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="p-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center">
        {{ error }}
      </div>

      <!-- EMPTY -->
      <div v-else-if="activities.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-2xl font-bold text-foreground mb-2">Aucune Activité Active</h3>
        <p class="text-muted-foreground">Revenez bientôt pour découvrir nos prochaines activités</p>
      </div>

      <!-- GRID -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
            v-for="activity in activities"
            :key="activity.id"
            class="group card-lg overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
        >

          <!-- COLOR BAR -->
          <div 
            class="h-1 bg-gradient-to-r"
            :class="{
              'from-blue-500 to-blue-600': activity.type === 'FORMATION',
              'from-green-500 to-emerald-600': activity.type === 'EVENEMENT',
              'from-purple-500 to-pink-600': activity.type === 'REUNION',
              'from-primary to-accent': !activity.type
            }"
          ></div>

          <div class="p-6 space-y-4">

            <!-- TYPE BADGE -->
            <div class="flex items-center justify-between">
              <span 
                class="text-xs font-bold px-3 py-1.5 rounded-full"
                :class="{
                  'bg-blue-100 text-blue-700': activity.type === 'FORMATION',
                  'bg-green-100 text-green-700': activity.type === 'EVENEMENT',
                  'bg-purple-100 text-purple-700': activity.type === 'REUNION',
                  'bg-primary/10 text-primary': !activity.type
                }"
              >
                {{ activity.type || 'AUTRE' }}
              </span>
              <span class="text-sm font-semibold text-green-600 flex items-center gap-1">
                <span class="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Actif
              </span>
            </div>

            <!-- TITLE -->
            <h3 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {{ activity.titre }}
            </h3>

            <!-- DESCRIPTION -->
            <p class="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {{ activity.description }}
            </p>

            <!-- FOOTER -->
            <div class="pt-4 border-t border-border flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                <span v-if="activity.participated" class="text-green-600 font-semibold">✓ Participant</span>
                <span v-else>Cliquez pour participer</span>
              </span>
              <button
                  @click="openParticipate(activity)"
                  :disabled="activity.participated"
                  class="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                  :class="activity.participated 
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-primary text-primary-foreground hover:shadow-md'"
              >
                {{ activity.participated ? 'Participé' : 'Participer' }}
              </button>
            </div>

          </div>
        </article>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20 border-y border-border">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground">
          Rejoignez Notre Communauté
        </h2>
        <p class="text-muted-foreground text-lg">
          Vous avez besoin d&apos;un compte? Créez-en un et accédez à plus de fonctionnalités.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/login" class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all">
            Se Connecter
          </router-link>
          <router-link to="/register" class="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all">
            S&apos;Enregistrer
          </router-link>
        </div>
      </div>
    </section>

    <!-- PARTICIPATION POPUP -->
    <div v-if="showParticipatePopup" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md space-y-6 p-8 animate-in">

        <div>
          <h3 class="text-2xl font-bold text-foreground">
            Participer à une Activité
          </h3>
          <p class="text-muted-foreground text-sm mt-1">
            "{{ participateActivity?.titre }}"
          </p>
        </div>

        <!-- FORM -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Prénom</label>
            <input 
              v-model="participateFirstName" 
              type="text"
              placeholder="Votre prénom"
              class="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nom</label>
            <input 
              v-model="participateLastName" 
              type="text"
              placeholder="Votre nom"
              class="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email</label>
            <input 
              v-model="participateEmail" 
              type="email"
              placeholder="votre@email.com"
              class="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <!-- MESSAGE -->
        <div 
          v-if="participateMessage"
          class="p-4 rounded-lg flex items-start gap-3"
          :class="participateMessageType === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'"
        >
          <span class="text-lg">{{ participateMessageType === 'error' ? '⚠️' : '✅' }}</span>
          <span class="text-sm">{{ participateMessage }}</span>
        </div>

        <!-- BUTTONS -->
        <div class="flex gap-3 pt-4">
          <button 
            @click="showParticipatePopup = false"
            class="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="submitParticipation"
            :disabled="submittingParticipation"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span v-if="submittingParticipation" class="flex items-center justify-center gap-2">
              <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Envoi...
            </span>
            <span v-else>Participer</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
