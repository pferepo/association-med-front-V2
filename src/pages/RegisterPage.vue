<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

const router = useRouter()

const nom = ref('')
const prenom = ref('')
const email = ref('')
const password = ref('')
const role = ref('INVITE')
const genre = ref('MALE')

const showPassword = ref(false)
const loading = ref(false)
const error = ref(null)

const nomError = ref('')
const prenomError = ref('')
const emailError = ref('')
const passwordError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(nom, v => {
  nomError.value = !v ? 'Nom requis' : ''
})

watch(prenom, v => {
  prenomError.value = !v ? 'Prénom requis' : ''
})

watch(email, v => {
  const val = v.trim()
  if (!val) emailError.value = 'Email requis'
  else if (!emailRegex.test(val)) emailError.value = 'Email invalide'
  else emailError.value = ''
})

watch(password, v => {
  if (!v) passwordError.value = 'Mot de passe requis'
  else if (v.length < 6) passwordError.value = 'Minimum 6 caractères'
  else passwordError.value = ''
})

const isFormValid = computed(() => {
  return (
      !nomError.value &&
      !prenomError.value &&
      !emailError.value &&
      !passwordError.value &&
      nom.value &&
      prenom.value &&
      email.value &&
      password.value
  )
})

async function handleRegister() {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = null

  try {
    await authService.register({
      nom: nom.value,
      prenom: prenom.value,
      email: email.value.trim(),
      password: password.value,   // 🔥 IMPORTANT FIX
      genre: genre.value,         // 🔥 AJOUTÉ
      role: role.value,
      active: false
    })

    router.push('/login')

  } catch (err) {
    error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">

    <!-- LEFT -->
    <div class="hidden md:flex w-1/3 bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center items-center p-10">
      <img src="@/assets/logo.png" class="h-16 mb-6" />

      <h1 class="text-3xl font-bold text-center">
        Association Médicale<br />
        <span class="text-white/80 text-xl">Ben Gardane</span>
      </h1>
    </div>

    <!-- RIGHT -->
    <div class="flex-1 flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">

        <h2 class="text-2xl font-bold text-center mb-6">
          Créer un compte
        </h2>

        <form @submit.prevent="handleRegister" class="space-y-4">

          <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded text-sm">
            {{ error }}
          </div>

          <input v-model="nom" placeholder="Nom" class="w-full px-4 py-2 border rounded-lg" />
          <p v-if="nomError" class="text-red-500 text-xs">{{ nomError }}</p>

          <input v-model="prenom" placeholder="Prénom" class="w-full px-4 py-2 border rounded-lg" />
          <p v-if="prenomError" class="text-red-500 text-xs">{{ prenomError }}</p>

          <input v-model="email" placeholder="Email" class="w-full px-4 py-2 border rounded-lg" />
          <p v-if="emailError" class="text-red-500 text-xs">{{ emailError }}</p>

          <!-- PASSWORD -->
          <div class="relative">
            <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mot de passe"
                class="w-full px-4 py-2 border rounded-lg pr-10"
            />

            <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2 text-gray-500"
            >
              👁
            </button>
          </div>

          <p v-if="passwordError" class="text-red-500 text-xs">{{ passwordError }}</p>

          <!-- GENRE -->
          <div class="border rounded-lg p-3 space-y-2">
            <p class="text-sm font-medium text-gray-600">Genre</p>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="MALE" v-model="genre" />
              <span>Homme</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="FEMALE" v-model="genre" />
              <span>Femme</span>
            </label>
          </div>

          <!-- ROLE -->
          <div class="border rounded-lg p-3 space-y-2">
            <p class="text-sm font-medium text-gray-600">Type de compte</p>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="INVITE" v-model="role" />
              <span>Invité</span>
            </label>
            <p
                v-if="role === 'INVITE'"
                class="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded mt-2"
            >
              📩 Vous serez informé par email de nos formations et événements.
            </p>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="MEMBRE" v-model="role" />
              <span>Membre</span>
            </label>
          </div>

          <!-- BUTTON -->
          <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            <span v-if="loading">Création...</span>
            <span v-else>Créer le compte</span>
          </button>

        </form>

      </div>
    </div>

  </div>
</template>