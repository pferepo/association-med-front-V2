<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

const router = useRouter()

const nom = ref('')
const prenom = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const tel = ref('')
const grade = ref('')

const role = ref('MEMBRE_INVITE')
const genre = ref('MALE')

const showPassword = ref(false)
const loading = ref(false)
const error = ref(null)

const nomError = ref('')
const prenomError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const telError = ref('')
const gradeError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* =======================
   PHONE TUNISIA VALIDATION
======================= */
function validateTunisiaPhone(value) {
  const v = value.replace(/\s/g, '')
  return /^(\+216)?[2-9]\d{7}$/.test(v) || /^[2-9]\d{7}$/.test(v)
}

/* =======================
   WATCHERS
======================= */
watch(nom, v => nomError.value = !v ? 'Nom requis' : '')
watch(prenom, v => prenomError.value = !v ? 'Prénom requis' : '')

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

watch(confirmPassword, v => {
  if (!v) confirmPasswordError.value = 'Confirmation requise'
  else if (v !== password.value) confirmPasswordError.value = 'Les mots de passe ne correspondent pas'
  else confirmPasswordError.value = ''
})

watch(tel, v => {
  if (!v) telError.value = 'Téléphone requis'
  else if (!validateTunisiaPhone(v)) telError.value = 'Numéro invalide (+216)'
  else telError.value = ''
})

watch(grade, v => {
  gradeError.value = !v ? 'Grade requis' : ''
})

/* =======================
   FORM VALID
======================= */
const isFormValid = computed(() => {
  return (
      !nomError.value &&
      !prenomError.value &&
      !emailError.value &&
      !passwordError.value &&
      !confirmPasswordError.value &&
      !telError.value &&
      !gradeError.value &&
      nom.value &&
      prenom.value &&
      email.value &&
      password.value &&
      confirmPassword.value &&
      tel.value &&
      grade.value
  )
})

/* =======================
   REGISTER
======================= */
async function handleRegister() {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = null

  try {
    await authService.register({
      nom: nom.value,
      prenom: prenom.value,
      email: email.value.trim(),
      password: password.value,
      genre: genre.value,
      role: role.value,
      tel: tel.value,
      grade: grade.value,
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

function goHome() {
  router.push('/')
}

/* =======================
   GRADES LIST
======================= */
const gradesList = [
  'Étudiant en médecine',
  'Externe',
  'Interne',
  'Résident',
  'Médecin généraliste',
  'Médecin spécialiste',
  'Assistant hospitalo-universitaire',
  'Maître assistant',
  'Maître de conférence',
  'Professeur hospitalo-universitaire',
  'Chef de service',
  'Pharmacien',
  'Dentiste',
  'Infirmier(e)',
  'Technicien de santé',
  'Sage-femme',
  'Autre'
]
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">

    <div class="w-full max-w-md">

      <!-- HEADER -->
      <div class="flex items-center justify-between mb-6">

        <button
            @click="goHome"
            class="text-sm text-gray-600 hover:text-blue-600 transition"
        >
          ← Accueil
        </button>

        <img src="@/assets/logo.png" class="h-14 object-contain" />

        <div class="w-16"></div>

      </div>

      <!-- CARD -->
      <div class="bg-white shadow-xl rounded-2xl p-6">

        <h2 class="text-2xl font-bold text-center mb-6">
          Créer un compte
        </h2>

        <form @submit.prevent="handleRegister" class="space-y-4">

          <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded text-sm">
            {{ error }}
          </div>

          <!-- NOM -->
          <div>
            <input v-model="nom" placeholder="Nom"
                   class="w-full px-4 py-2 border rounded-lg focus:ring outline-none" />
            <p v-if="nomError" class="text-red-500 text-xs">{{ nomError }}</p>
          </div>

          <!-- PRENOM -->
          <div>
            <input v-model="prenom" placeholder="Prénom"
                   class="w-full px-4 py-2 border rounded-lg focus:ring outline-none" />
            <p v-if="prenomError" class="text-red-500 text-xs">{{ prenomError }}</p>
          </div>

          <!-- EMAIL -->
          <div>
            <input v-model="email" placeholder="Email"
                   class="w-full px-4 py-2 border rounded-lg focus:ring outline-none" />
            <p v-if="emailError" class="text-red-500 text-xs">{{ emailError }}</p>
          </div>

          <!-- TEL -->
          <div>
            <input v-model="tel" placeholder="Téléphone (+216...)"
                   class="w-full px-4 py-2 border rounded-lg focus:ring outline-none" />
            <p v-if="telError" class="text-red-500 text-xs">{{ telError }}</p>
          </div>

          <!-- GRADE -->
          <div>
            <select v-model="grade"
                    class="w-full px-4 py-2 border rounded-lg focus:ring outline-none">
              <option disabled value="">Choisir un grade</option>
              <option v-for="g in gradesList" :key="g" :value="g">
                {{ g }}
              </option>
            </select>
            <p v-if="gradeError" class="text-red-500 text-xs">{{ gradeError }}</p>
          </div>

          <!-- PASSWORD -->
          <div>
            <div class="relative">
              <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mot de passe"
                  class="w-full px-4 py-2 border rounded-lg pr-10 focus:ring outline-none"
              />

              <button type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3 top-2 text-gray-500">
                👁
              </button>
            </div>
            <p v-if="passwordError" class="text-red-500 text-xs mt-1">
              {{ passwordError }}
            </p>
          </div>

          <!-- CONFIRM PASSWORD -->
          <div>
            <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirmer mot de passe"
                class="w-full px-4 py-2 border rounded-lg focus:ring outline-none"
            />
            <p v-if="confirmPasswordError" class="text-red-500 text-xs">
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- GENRE -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Genre</label>

            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input type="radio" value="MALE" v-model="genre" />
                Homme
              </label>

              <label class="flex items-center gap-2">
                <input type="radio" value="FEMALE" v-model="genre" />
                Femme
              </label>
            </div>
          </div>

          <!-- ROLE -->
          <div class="space-y-2">

            <label class="flex items-center gap-2">
              <input type="radio" value="MEMBRE_INVITE" v-model="role" />
              Membre Invité
            </label>

            <p v-if="role === 'MEMBRE_INVITE'"
               class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Vous serez informé par email de nos activités.
            </p>

            <label class="flex items-center gap-2">
              <input type="radio" value="MEMBRE_BUREAU_EXECUTIF" v-model="role" />
              Membre Bureau Executif
            </label>

          </div>

          <!-- BUTTON -->
          <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <span v-if="loading">Création...</span>
            <span v-else>Créer le compte</span>
          </button>

        </form>

      </div>
    </div>
  </div>
</template>