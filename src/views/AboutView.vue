<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'

const membres = ref([])
const loading = ref(true)

const BASE_URL = import.meta.env.VITE_API_URL
const getImageUrl = (p) => (p ? BASE_URL + p : null)

onMounted(async () => {
  try {
    membres.value = await userService.getBureauMembers()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="bg-background min-h-screen">

    <!-- HEADER -->
    <header class="border-b border-border">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
            @click="goBack"
            class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <span>←</span>
          <span class="text-sm font-medium">Retour</span>
        </button>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center space-y-6">
        <div class="inline-flex items-center justify-center">
          <div class="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-4xl">🏥</span>
          </div>
        </div>

        <div class="space-y-3">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Association Médicale de Ben Guerdane
          </h1>

          <p class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une association professionnelle engagée dans la formation continue, la collaboration scientifique et l&apos;innovation au service de la communauté médicale et de la santé publique.
          </p>
        </div>

        <!-- CTA -->
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all">
            Nous Rejoindre
          </button>
          <button @click="$router.push('/contact')" class="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all">
            Nous Contacter
          </button>
        </div>
      </div>
    </section>

    <!-- MISSION SECTION -->
    <section class="bg-muted/30 py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card-lg p-8">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-xl font-bold text-foreground mb-3">Notre Mission</h3>
            <p class="text-muted-foreground leading-relaxed">
              Promouvoir l&apos;excellence médicale et la formation continue pour améliorer la qualité des soins et l&apos;avancement professionnel de nos membres.
            </p>
          </div>

          <div class="card-lg p-8">
            <div class="text-4xl mb-4">👁️</div>
            <h3 class="text-xl font-bold text-foreground mb-3">Notre Vision</h3>
            <p class="text-muted-foreground leading-relaxed">
              Être le leader régional en matière de collaboration médicale et d&apos;innovation au service de la communauté.
            </p>
          </div>

          <div class="card-lg p-8">
            <div class="text-4xl mb-4">💪</div>
            <h3 class="text-xl font-bold text-foreground mb-3">Nos Valeurs</h3>
            <p class="text-muted-foreground leading-relaxed">
              Excellence, intégrité, collaboration, innovation et engagement envers l&apos;amélioration continue de la santé.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TEAM SECTION -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-3">Bureau Exécutif</h2>
        <p class="text-muted-foreground text-lg">Les dirigeants qui pilotent notre association</p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-muted-foreground">⏳ Chargement des membres...</div>
      </div>

      <!-- MEMBERS GRID -->
      <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="m in membres" :key="m.id" class="group card-lg overflow-hidden hover:-translate-y-1">
          
          <!-- IMAGE -->
          <div class="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
            <img 
              v-if="m.imageUrl"
              :src="getImageUrl(m.imageUrl)"
              :alt="`${m.prenom} ${m.nom}`"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <span class="text-white text-4xl font-bold">
                {{ m.nom?.[0]?.toUpperCase() || '?' }}{{ m.prenom?.[0]?.toUpperCase() || '?' }}
              </span>
            </div>
          </div>

          <!-- INFO -->
          <div class="p-6">
            <h3 class="text-lg font-bold text-foreground">
              {{ m.prenom }} {{ m.nom }}
            </h3>

            <p class="text-primary font-semibold text-sm mt-1">
              {{ m.grade || 'Médecin' }}
            </p>

            <p class="text-muted-foreground text-sm mt-3">
              Spécialiste engagée dans l&apos;excellence et l&apos;innovation médicale.
            </p>

            <div class="mt-4 pt-4 border-t border-border">
              <span class="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                Bureau Exécutif
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section class="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 py-20 border-y border-border">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-4xl font-bold text-primary mb-2">{{ membres.length }}+</p>
            <p class="text-muted-foreground">Membres du Bureau</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-accent mb-2">15+</p>
            <p class="text-muted-foreground">Années d&apos;expérience</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-secondary mb-2">500+</p>
            <p class="text-muted-foreground">Professionnels</p>
          </div>
          <div>
            <p class="text-4xl font-bold text-foreground mb-2">100%</p>
            <p class="text-muted-foreground">Dédié à l&apos;excellence</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
