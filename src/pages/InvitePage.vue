<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import activityService from '@/services/activityService'

const router = useRouter()
const activities = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    activities.value = await activityService.getForGuests()
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
    'EVENNEMENTs': 'bg-green-100 text-green-800',
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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">AssociationPro</span>
          </div>
          <button
            @click="goToLogin"
            class="btn btn-primary"
          >
            Se connecter
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Bienvenue sur notre
          <span class="text-primary-600">Plateforme Associative</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez nos activités, formations et événements. Rejoignez notre communauté et participez activement à la vie de l'association.
        </p>
        <button
          @click="goToLogin"
          class="btn btn-primary text-lg px-8 py-3"
        >
          Rejoindre l'association
        </button>
      </div>
    </section>

    <!-- Activities Section -->
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Nos Activités</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Découvrez les activités ouvertes au public. Connectez-vous pour participer et voter.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-gray-600">{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="activities.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-gray-600">Aucune activité disponible pour le moment</p>
        </div>

        <!-- Activities Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="activity in activities"
            :key="activity.id"
            class="card hover:shadow-lg transition-shadow duration-300"
          >
            <div class="flex items-start justify-between mb-4">
              <span :class="['badge', getTypeColor(activity.type)]">
                {{ activity.type }}
              </span>
              <span :class="['badge', getStatusColor(activity.statut)]">
                {{ activity.statut }}
              </span>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ activity.titre }}
            </h3>
            
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
              {{ activity.description }}
            </p>

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
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">
                  Proposition: {{ activity.statutProposition || 'N/A' }}
                </span>
                <button
                  @click="goToLogin"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 mt-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="text-xl font-bold">AssociationPro</span>
        </div>
        <p class="text-gray-400 mb-4">
          Plateforme de gestion associative
        </p>
        <p class="text-gray-500 text-sm">
          &copy; 2024 AssociationPro. Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>
