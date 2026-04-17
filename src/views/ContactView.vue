<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import contactService from "@/services/contactService.js";

const router = useRouter()

const goBack = () => {
  router.back()
}

const compteAppli = ref(null)
const loading = ref(true)
const formSubmitted = ref(false)

/* FORM */
const form = ref({
  nom: '',
  email: '',
  objectif: '',
  message: ''
})

const errors = ref({})

onMounted(async () => {
  try {
    compteAppli.value = await userService.getCompteAppli()
  } finally {
    loading.value = false
  }
})

const submitForm = async () => {
  errors.value = {}

  if (!form.value.nom) errors.value.nom = "Champ obligatoire"
  if (!form.value.email) errors.value.email = "Champ obligatoire"
  if (!form.value.objectif) errors.value.objectif = "Champ obligatoire"
  if (!form.value.message) errors.value.message = "Champ obligatoire"

  if (Object.keys(errors.value).length > 0) return

  try {
    await contactService.sendContactForm(form.value)

    formSubmitted.value = true

    form.value = {
      nom: '',
      email: '',
      objectif: '',
      message: ''
    }

    setTimeout(() => {
      formSubmitted.value = false
    }, 5000)

  } catch (e) {
    console.error(e)
    errors.value.submit = "Erreur lors de l'envoi du message"
  }
}

</script>

<template>
  <div class="bg-background min-h-screen">

    <!-- HEADER -->
    <header class="border-b border-border">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
            @click="goBack"
            class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span class="text-sm font-medium">Retour</span>
        </button>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-3">Contactez-Nous</h1>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
          Nous sommes à votre écoute. N&apos;hésitez pas à nous contacter pour toute question ou collaboration.
        </p>
      </div>
    </section>

    <!-- CONTENT GRID -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div class="grid lg:grid-cols-3 gap-8">

        <!-- LEFT: INFO & FORM -->
        <div class="lg:col-span-2 space-y-8">

          <!-- CONTACT INFO -->
          <div v-if="!loading && compteAppli" class="card-lg p-8 space-y-6">
            <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
              <span>📋</span> Informations de Contact
            </h2>

            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-lg">👤</span>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Responsable</p>
                  <p class="text-foreground font-semibold">{{ compteAppli.nom || 'Non disponible' }}</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-lg">📱</span>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Téléphone</p>
                  <a :href="`tel:${compteAppli.tel}`" class="text-foreground font-semibold hover:text-primary transition-colors">
                    {{ compteAppli.tel || 'Non disponible' }}
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span class="text-lg">📧</span>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Email</p>
                  <a :href="`mailto:${compteAppli.email}`" class="text-foreground font-semibold hover:text-primary transition-colors">
                    {{ compteAppli.email || 'Non disponible' }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- FORM -->
          <div class="card-lg p-8 space-y-6">
            <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
              <span>✉️</span> Formulaire de Contact
            </h2>

            <!-- SUCCESS MESSAGE -->
            <div v-if="formSubmitted" class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
              <span class="text-lg">✅</span>
              <div>
                <p class="font-semibold">Message envoyé avec succès!</p>
                <p class="text-sm opacity-90 mt-1">Merci de nous avoir contactés. Nous vous répondrons bientôt.</p>
              </div>
            </div>

            <!-- FORM -->
            <form @submit.prevent="submitForm" class="space-y-4">

              <!-- NOM -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Nom complet</label>
                <input 
                  v-model="form.nom"
                  type="text"
                  placeholder="Votre nom"
                  class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  :class="errors.nom ? 'border-red-500 focus:ring-red-200' : ''"
                />
                <p v-if="errors.nom" class="text-red-600 text-xs mt-1.5">{{ errors.nom }}</p>
              </div>

              <!-- EMAIL -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Adresse Email</label>
                <input 
                  v-model="form.email"
                  type="email"
                  placeholder="vous@exemple.com"
                  class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  :class="errors.email ? 'border-red-500 focus:ring-red-200' : ''"
                />
                <p v-if="errors.email" class="text-red-600 text-xs mt-1.5">{{ errors.email }}</p>
              </div>

              <!-- OBJECTIF -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Sujet</label>
                <input 
                  v-model="form.objectif"
                  type="text"
                  placeholder="Qu&apos;est-ce qui vous amène ?"
                  class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  :class="errors.objectif ? 'border-red-500 focus:ring-red-200' : ''"
                />
                <p v-if="errors.objectif" class="text-red-600 text-xs mt-1.5">{{ errors.objectif }}</p>
              </div>

              <!-- MESSAGE -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea 
                  v-model="form.message"
                  placeholder="Votre message en détail..."
                  rows="5"
                  class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  :class="errors.message ? 'border-red-500 focus:ring-red-200' : ''"
                ></textarea>
                <p v-if="errors.message" class="text-red-600 text-xs mt-1.5">{{ errors.message }}</p>
              </div>

              <!-- SUBMIT -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  Envoi en cours...
                </span>
                <span v-else>Envoyer le Message</span>
              </button>

            </form>
          </div>

        </div>

        <!-- RIGHT: SIDEBAR -->
        <div class="space-y-6">

          <!-- RESPONSE TIME -->
          <div class="card-lg p-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">⏱️</span>
              <h3 class="font-bold text-foreground">Temps de réponse</h3>
            </div>
            <p class="text-muted-foreground text-sm">
              Nous nous efforçons de répondre à tous les messages dans les 24-48 heures.
            </p>
          </div>

          <!-- AVAILABILITY -->
          <div class="card-lg p-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">📞</span>
              <h3 class="font-bold text-foreground">Disponibilité</h3>
            </div>
            <div class="space-y-2 text-sm text-muted-foreground">
              <p>Lundi - Vendredi: 08:00 - 17:00</p>
              <p>Samedi: 09:00 - 13:00</p>
              <p>Dimanche: Fermé</p>
            </div>
          </div>

          <!-- QUICK LINKS -->
          <div class="card-lg p-6">
            <h3 class="font-bold text-foreground mb-4 flex items-center gap-2">
              <span>🔗</span> Liens Utiles
            </h3>
            <div class="space-y-2">
              <router-link to="/" class="text-primary hover:text-primary/80 text-sm font-medium transition-colors block">
                → Accueil
              </router-link>
              <router-link to="/about" class="text-primary hover:text-primary/80 text-sm font-medium transition-colors block">
                → À Propos
              </router-link>
              <router-link to="/login" class="text-primary hover:text-primary/80 text-sm font-medium transition-colors block">
                → Se Connecter
              </router-link>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>
