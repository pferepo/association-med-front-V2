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
  <div class="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">

      <!-- BACK BUTTON -->
      <button
          @click="goHome"
          class="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>←</span>
        <span class="text-sm font-medium">Retour à l&apos;accueil</span>
      </button>

      <!-- CARD -->
      <div class="card-lg p-8 space-y-6">

        <!-- HEADER -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg mx-auto flex items-center justify-center shadow-md">
            <span class="text-xl">🏥</span>
          </div>
          <h1 class="text-3xl font-bold text-foreground">Connexion</h1>
          <p class="text-muted-foreground text-sm">Accédez à votre espace professionnel</p>
        </div>

        <!-- ERROR ALERT -->
        <div
            v-if="error"
            class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3"
        >
          <span>⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- FORM -->
        <form @submit.prevent="handleLogin" class="space-y-4">

          <!-- EMAIL INPUT -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
                v-model="email"
                type="email"
                placeholder="vous@exemple.com"
                class="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                :class="emailError ? 'border-red-500 focus:ring-red-200' : ''"
            />
            <p v-if="emailError" class="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <span>•</span> {{ emailError }}
            </p>
          </div>

          <!-- PASSWORD INPUT -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-foreground">Mot de passe</label>
              <button
                  type="button"
                  @click="$router.push('/forgot-password')"
                  class="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Oublié ?
              </button>
            </div>

            <div class="relative">
              <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Minimum 6 caractères"
                  class="w-full px-4 py-3 pr-10 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  :class="passwordError ? 'border-red-500 focus:ring-red-200' : ''"
              />

              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>

            <p v-if="passwordError" class="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <span>•</span> {{ passwordError }}
            </p>
          </div>

          <!-- SUBMIT BUTTON -->
          <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </button>

        </form>

        <!-- DIVIDER -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-border"></div>
          <span class="text-xs text-muted-foreground">OU</span>
          <div class="flex-1 h-px bg-border"></div>
        </div>

        <!-- REGISTER LINK -->
        <p class="text-center text-sm text-muted-foreground">
          Pas encore de compte ?
          <button
              @click="$router.push('/register')"
              class="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            S&apos;enregistrer
          </button>
        </p>

      </div>

      <!-- FOOTER -->
      <p class="text-center text-xs text-muted-foreground mt-6">
        Association Médicale de Ben Guerdane © 2024
      </p>

    </div>
  </div>
</template>
