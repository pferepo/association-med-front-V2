<script setup>
import { ref, onMounted, computed } from 'vue'
import userService from '@/services/userService'

const BASE_URL = import.meta.env.VITE_API_URL
const getImageUrl = (p) => (p ? BASE_URL + p : null)

/* STATE */
const users = ref([])
const loading = ref(true)

const showModal = ref(false)
const isEditMode = ref(false)

const saving = ref(false)
const deleting = ref(null)

const searchQuery = ref('')
const filter = ref('ALL')

const selectedFile = ref(null)

/* GRADES */
const gradesList = [
  'Étudiant en médecine','Interne','Résident','Médecin généraliste',
  'Médecin spécialiste','Médecin consultant','Chef de clinique',
  'Assistant hospitalo-universitaire (AHU)','Maître assistant',
  'Maître de conférences agrégé (MCA)','Professeur agrégé',
  'Professeur universitaire','Chef de service','Directeur médical','Autre'
]

/* FORM */
const form = ref({
  id: null,
  nom: '',
  prenom: '',
  email: '',
  password: '',
  confirmPassword: '',
  tel: '',
  cin: '',
  grade: '',
  genre: 'MALE',
  role: 'MEMBRE_INVITE',
  active: false,
  imageUrl: null
})

const errors = ref({})
const submitted = ref(false)

/* IMAGE PREVIEW */
const previewImage = computed(() => {
  if (selectedFile.value) return URL.createObjectURL(selectedFile.value)
  if (isEditMode.value && form.value.imageUrl) return getImageUrl(form.value.imageUrl)
  return null
})

/* VALIDATION */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^(2|5|9)\d{7}$/

function validate() {
  const e = {}

  if (!form.value.nom?.trim()) e.nom = "Nom obligatoire"
  if (!form.value.prenom?.trim()) e.prenom = "Prénom obligatoire"

  if (!emailRegex.test(form.value.email))
    e.email = "Email invalide"

  if (!isEditMode.value) {
    if (!form.value.password || form.value.password.length < 6)
      e.password = "Minimum 6 caractères"

    if (form.value.password !== form.value.confirmPassword)
      e.confirmPassword = "Les mots de passe ne correspondent pas"
  }

  if (form.value.tel && !phoneRegex.test(form.value.tel))
    e.tel = "Numéro invalide"

  if (!form.value.grade)
    e.grade = "Grade obligatoire"

  if (!form.value.cin)
    e.cin = "CIN obligatoire"

  if (!form.value.role)
    e.role = "Rôle obligatoire"

  if (!form.value.genre)
    e.genre = "Genre obligatoire"

  errors.value = e
  return Object.keys(e).length === 0
}

/* FETCH */
async function fetchUsers() {
  loading.value = true
  users.value = await userService.getAll()
  loading.value = false
}

/* OPEN */
function openCreate() {
  isEditMode.value = false
  resetForm()
  showModal.value = true
}

function openEdit(u) {
  isEditMode.value = true
  form.value = { ...u, password: '', confirmPassword: '' }
  errors.value = {}
  submitted.value = false
  selectedFile.value = null
  showModal.value = true
}

/* SAVE */
async function saveUser() {
  submitted.value = true
  if (!validate()) return

  saving.value = true
  try {
    if (isEditMode.value) {
      await userService.updateUser(form.value.id, form.value)

      if (selectedFile.value) {
        await userService.uploadImage(form.value.id, selectedFile.value)
      }
    } else {
      const created = await userService.create(form.value)

      if (selectedFile.value) {
        await userService.uploadImage(created.id, selectedFile.value)
      }
    }

    showModal.value = false
    await fetchUsers()
  } finally {
    saving.value = false
  }
}

/* ACTIONS */
async function deleteUser(id) {
  if (!confirm('Confirmer suppression ?')) return
  deleting.value = id
  await userService.delete(id)
  await fetchUsers()
  deleting.value = null
}

async function toggleActive(u) {
  await userService.updateActivation(u.id)
  await fetchUsers()
}

/* RESET */
function resetForm() {
  form.value = {
    id: null,
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    tel: '',
    cin: '',
    grade: '',
    genre: 'MALE',
    role: 'MEMBRE_INVITE',
    active: false,
    imageUrl: null
  }
  errors.value = {}
  submitted.value = false
  selectedFile.value = null
}

/* FILTER */
const filteredUsers = computed(() => {
  let r = users.value

  if (filter.value === 'ACTIVE') r = r.filter(u => u.active)
  if (filter.value === 'INACTIVE') r = r.filter(u => !u.active)

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(u =>
        u.nom?.toLowerCase().includes(q) ||
        u.prenom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    )
  }

  return r
})

onMounted(fetchUsers)
</script>

<template>
  <div class="p-6 space-y-6">

    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Gestion des utilisateurs</h1>
      <button @click="openCreate" class="btn-primary">+ Ajouter</button>
    </div>

    <div class="flex gap-3">
      <input v-model="searchQuery" class="input" placeholder="Rechercher..." />
      <select v-model="filter" class="input small">
        <option value="ALL">Tous</option>
        <option value="ACTIVE">Actifs</option>
        <option value="INACTIVE">Inactifs</option>
      </select>
    </div>

    <!-- TABLE -->
    <div class="bg-white shadow rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-xs uppercase">
        <tr>
          <th class="p-4 text-left">Utilisateur</th>
          <th class="p-4">Email</th>
          <th class="p-4">Téléphone</th>
          <th class="p-4">Grade</th>
          <th class="p-4">Statut</th>
          <th class="p-4 text-right">Actions</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="u in filteredUsers" :key="u.id" class="border-t">

          <td class="p-4 flex items-center gap-3">
            <img v-if="u.imageUrl" :src="getImageUrl(u.imageUrl)" class="w-10 h-10 rounded-full"/>
            <div v-else class="avatar">{{ u.nom?.[0] }}{{ u.prenom?.[0] }}</div>

            <div>
              <div class="font-medium">{{ u.prenom }} {{ u.nom }}</div>
              <div class="text-xs text-gray-500">{{ u.role }} - {{ u.genre }}</div>
            </div>
          </td>

          <td class="p-4">{{ u.email }}</td>
          <td class="p-4">{{ u.tel || '-' }}</td>
          <td class="p-4">{{ u.grade }}</td>

          <td class="p-4">
            <span :class="u.active ? 'badge-green' : 'badge-red'">
              {{ u.active ? 'Actif' : 'Inactif' }}
            </span>
          </td>

          <td class="p-4 text-right space-x-2">
            <button @click="openEdit(u)" class="btn">Modifier</button>
            <button @click="toggleActive(u)" class="btn-primary">
              {{ u.active ? 'Désactiver' : 'Activer' }}
            </button>
            <button @click="deleteUser(u.id)" class="btn-danger">Supprimer</button>
          </td>

        </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal">
      <div class="modal-box space-y-3">

        <h2 class="title">
          {{ isEditMode ? 'Modifier utilisateur' : 'Créer utilisateur' }}
        </h2>

        <!-- IMAGE -->
        <div class="flex justify-center">
          <div class="relative">
            <img v-if="previewImage" :src="previewImage" class="w-20 h-20 rounded-full"/>
            <div v-else class="avatar-large">{{ form.nom?.[0] }}</div>

            <input type="file" id="fileInput" class="hidden"
                   @change="e => selectedFile = e.target.files[0]" />
            <label for="fileInput" class="edit-btn">📷</label>
          </div>
        </div>

        <input v-model="form.nom" class="input" placeholder="Nom"/>
        <input v-model="form.prenom" class="input" placeholder="Prénom"/>
        <input v-model="form.email" class="input" placeholder="Email"/>

        <template v-if="!isEditMode">
          <input type="password" v-model="form.password" class="input" placeholder="Mot de passe"/>
          <input type="password" v-model="form.confirmPassword" class="input" placeholder="Confirmer"/>
        </template>

        <input v-model="form.tel" class="input" placeholder="Téléphone"/>
        <input v-model="form.cin" class="input" placeholder="cin"/>

        <select v-model="form.grade" class="input">
          <option disabled value="">Grade</option>
          <option v-for="g in gradesList" :key="g">{{ g }}</option>
        </select>

        <!-- ROLE -->
        <select v-model="form.role" class="input">
          <option value="ADMIN">Administrateur</option>
          <option value="MEMBRE_INVITE">Membre invité</option>
          <option value="MEMBRE_BUREAU_EXECUTIF">Bureau exécutif</option>
        </select>

        <!-- GENRE -->
        <select v-model="form.genre" class="input">
          <option value="MALE">Homme</option>
          <option value="FEMALE">Femme</option>
        </select>

        <div class="flex gap-2 pt-3">
          <button @click="showModal=false" class="btn">Annuler</button>
          <button @click="saveUser" class="btn-primary">Valider</button>
        </div>

      </div>
    </div>

  </div>
</template>

<style>
.input { width:100%; border:1px solid #ddd; padding:8px; border-radius:8px; }
.small { width:120px; }

.avatar, .avatar-large {
  border-radius:50%;
  background:#ddd;
  display:flex;
  align-items:center;
  justify-content:center;
}
.avatar { width:40px; height:40px; }
.avatar-large { width:80px; height:80px; }

.edit-btn {
  position:absolute;
  bottom:0;
  right:0;
  background:#2563eb;
  color:white;
  border-radius:50%;
  padding:4px;
}

.badge-green { color:green; }
.badge-red { color:red; }

.modal {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.5);
  display:flex; justify-content:center; align-items:center;
}

.modal-box {
  background:white;
  padding:20px;
  border-radius:12px;
  width:420px;
}

.btn { background:#ccc; padding:6px 10px; border-radius:6px; }
.btn-primary { background:#2563eb; color:white; padding:6px 10px; border-radius:6px; }
.btn-danger { background:red; color:white; padding:6px 10px; border-radius:6px; }
</style>