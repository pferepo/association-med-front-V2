<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const loading = ref(false)
const error = ref(null)

const emailError = ref('')
const passwordError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(email, (value) => {
  const v = value.trim()
  if (!v) emailError.value = 'Email requis'
  else if (!emailRegex.test(v)) emailError.value = 'Email invalide'
  else emailError.value = ''
})

watch(password, (value) => {
  if (!value) passwordError.value = 'Mot de passe requis'
  else if (value.length < 6) passwordError.value = 'Minimum 6 caractères'
  else passwordError.value = ''
})

const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && email.value && password.value
})

async function handleLogin() {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = null

  try {
    const user = await authStore.login(email.value.trim(), password.value)

    const role = user?.role

    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'MEMBRE_BUREAU_EXECUTIF') router.push('/membre')
    else router.push('/invite')

  } catch (err) {
    const msg = err?.response?.data?.message

    switch (true) {
      case !msg:
        error.value = 'Erreur de connexion, veuillez réessayer'
        break
      case msg.toLowerCase().includes('bad credentials'):
        error.value = 'Email ou mot de passe incorrect'
        break
      case msg.toLowerCase().includes('disabled'):
        error.value = 'Compte désactivé, contactez l’administrateur'
        break
      case msg.toLowerCase().includes('locked'):
        error.value = 'Compte temporairement bloqué'
        break
      default:
        error.value = msg
    }
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">

    <div class="w-full max-w-md">

      <!-- HEADER -->
      <div class="flex items-center justify-between mb-6">

        <!-- RETOUR ACCUEIL -->
        <button
            @click="goHome"
            class="text-sm text-gray-600 hover:text-primary-600 transition"
        >
          ← Accueil
        </button>

        <!-- LOGO -->
        <img src="@/assets/logo.png" alt="Logo" class="h-14 object-contain" />

        <div class="w-16"></div>

      </div>

      <!-- CARD -->
      <div class="bg-white shadow-xl rounded-2xl p-6">

        <h2 class="text-2xl font-bold text-center mb-6">
          Connexion
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-5">

          <!-- ERROR -->
          <div
              v-if="error"
              class="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm"
          >
            {{ error }}
          </div>

          <!-- EMAIL -->
          <div>
            <label class="text-sm font-medium">Email</label>
            <input
                v-model="email"
                type="email"
                placeholder="email@mail.com"
                class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring outline-none"
                :class="emailError ? 'border-red-500' : email ? 'border-green-500' : ''"
            />
            <p v-if="emailError" class="text-red-500 text-xs mt-1">
              {{ emailError }}
            </p>
          </div>

          <!-- PASSWORD -->
          <div>
            <label class="text-sm font-medium">Mot de passe</label>

            <div class="relative">
              <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full mt-1 px-4 py-2 border rounded-lg pr-10 focus:ring outline-none"
                  :class="passwordError ? 'border-red-500' : password ? 'border-green-500' : ''"
              />

              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-2 text-gray-400"
              >
                👁
              </button>
            </div>

            <p v-if="passwordError" class="text-red-500 text-xs mt-1">
              {{ passwordError }}
            </p>

            <div class="text-right mt-1">
              <button
                  type="button"
                  @click="$router.push('/forgot-password')"
                  class="text-xs text-primary-600 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <!-- BUTTON -->
          <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <span v-if="loading">Connexion...</span>
            <span v-else>Se connecter</span>
          </button>

        </form>
      </div>

      <!-- REGISTER -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Pas de compte ?
        <button
            @click="$router.push('/register')"
            class="text-primary-600 font-medium hover:underline"
        >
          Créer un compte
        </button>
      </p>

    </div>
  </div>
</template>