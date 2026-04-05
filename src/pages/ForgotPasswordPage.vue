<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from "@/services/authService.js";
import userService from "@/services/userService.js";

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1) // 1 = email, 2 = reset

const email = ref('')
const code = ref('')
const newPassword = ref('')

const loading = ref(false)
const error = ref(null)
const success = ref(false)

const emailError = ref('')
const passwordError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(email, (v) => {
  if (!v) emailError.value = 'Email requis'
  else if (!emailRegex.test(v)) emailError.value = 'Email invalide'
  else emailError.value = ''
})

watch(newPassword, (v) => {
  if (!v) passwordError.value = 'Mot de passe requis'
  else if (v.length < 6) passwordError.value = 'Minimum 6 caractères'
  else passwordError.value = ''
})

const isStep1Valid = computed(() => !emailError.value && email.value)
const isStep2Valid = computed(() => code.value && !passwordError.value)

async function sendCode() {
  if (!isStep1Valid.value) return

  loading.value = true
  error.value = null

  try {
    await userService.sendResetCode(email.value)
    step.value = 2
  } catch (err) {
    error.value = err?.response?.data?.message || 'Erreur envoi code'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  if (!isStep2Valid.value) return

  loading.value = true
  error.value = null

  try {
    await userService.resetPassword({
      email: email.value,
      code: code.value,
      newPassword: newPassword.value
    })

    success.value = true

    // 🔥 reset UI
    email.value = ''
    code.value = ''
    newPassword.value = ''

    // 🔥 redirect login
    setTimeout(() => {
      router.push('/login')
    }, 1200)

  } catch (err) {
    error.value = err?.response?.data?.message || 'Erreur reset'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">

      <h2 class="text-2xl font-bold text-center mb-6">
        Mot de passe oublié
      </h2>

      <!-- STEP 1 -->
      <div v-if="step === 1">

        <p class="text-sm text-gray-500 text-center mb-4">
          Entrez votre email pour recevoir un code
        </p>

        <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded text-sm">
          {{ error }}
        </div>

        <input
            v-model="email"
            placeholder="email@mail.com"
            class="w-full px-4 py-2 border rounded-lg"
        />

        <p v-if="emailError" class="text-red-500 text-xs">
          {{ emailError }}
        </p>

        <button
            @click="sendCode"
            :disabled="loading || !isStep1Valid"
            class="w-full bg-primary-600 text-white py-2 rounded-lg mt-4"
        >
          {{ loading ? 'Envoi...' : 'Envoyer le code' }}
        </button>

      </div>

      <!-- STEP 2 -->
      <div v-else>

        <p class="text-sm text-gray-500 text-center mb-4">
          Entrez le code reçu par email
        </p>

        <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded text-sm">
          {{ error }}
        </div>

        <div v-if="success" class="p-3 bg-green-50 text-green-600 rounded text-sm">
          Mot de passe modifié avec succès
        </div>

        <input
            v-model="code"
            placeholder="Code à 6 chiffres"
            class="w-full px-4 py-2 border rounded-lg mb-2"
        />

        <input
            v-model="newPassword"
            type="password"
            placeholder="Nouveau mot de passe"
            class="w-full px-4 py-2 border rounded-lg"
        />

        <p v-if="passwordError" class="text-red-500 text-xs">
          {{ passwordError }}
        </p>

        <button
            @click="resetPassword"
            :disabled="loading || !isStep2Valid"
            class="w-full bg-primary-600 text-white py-2 rounded-lg mt-4"
        >
          {{ loading ? 'Validation...' : 'Confirmer' }}
        </button>

      </div>

    </div>
  </div>
</template>