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

    alert("Message envoyé avec succès ✅")

    form.value = {
      nom: '',
      email: '',
      objectif: '',
      message: ''
    }

  } catch (e) {
    console.error(e)
    alert("Erreur lors de l'envoi ❌")
  }
}

</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4 space-y-10">

    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <button
          @click="goBack"
          class="text-sm text-gray-600 hover:text-blue-600 transition"
      >
        ← Retour
      </button>
    </div>

    <!-- TITLE -->
    <h1 class="text-4xl font-bold text-center text-gray-900">
      Contactez-Nous
    </h1>

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

    <!-- LOADING -->
    <div v-else class="text-center text-gray-500">
      Chargement des informations...
    </div>

    <!-- FORM -->
    <div class="bg-white border rounded-xl p-6 shadow-sm space-y-4">

      <h2 class="text-xl font-semibold">
              <span>✉️</span> Formulaire de Contact
      </h2>

      <!-- NOM -->
      <div>
        <input v-model="form.nom"
               type="text"
               placeholder="Votre nom"
               class="w-full border p-3 rounded" />
        <p v-if="errors.nom" class="text-red-500 text-sm">{{ errors.nom }}</p>
      </div>

      <!-- EMAIL -->
      <div>
        <input v-model="form.email"
               type="email"
               placeholder="E-mail"
               class="w-full border p-3 rounded" />
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
      </div>

      <!-- OBJECTIF -->
      <div>
        <input v-model="form.objectif"
               type="text"
               placeholder="Objectif"
               class="w-full border p-3 rounded" />
        <p v-if="errors.objectif" class="text-red-500 text-sm">{{ errors.objectif }}</p>
      </div>

      <!-- MESSAGE -->
      <div>
        <textarea v-model="form.message"
                  placeholder="Message"
                  class="w-full border p-3 rounded h-32"></textarea>
        <p v-if="errors.message" class="text-red-500 text-sm">{{ errors.message }}</p>
      </div>

      <!-- SUBMIT -->
      <button @click="submitForm"
              class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
        Envoyer
      </button>

    </div>

  </div>
</template>