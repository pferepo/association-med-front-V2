<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'

const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const deleting = ref(null)

const newUser = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  genre: 'MALE',
  role: 'MEMBRE'
})
const creating = ref(false)
const error = ref(null)

async function fetchUsers() {
  loading.value = true
  try {
    users.value = await userService.getAll()
  } catch (err) {
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

async function createUser() {
  creating.value = true
  error.value = null
  try {
    await userService.create(newUser.value)
    showModal.value = false
    resetForm()
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la création'
  } finally {
    creating.value = false
  }
}

async function deleteUser(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
  
  deleting.value = id
  try {
    await userService.delete(id)
    await fetchUsers()
  } catch (err) {
    alert('Erreur lors de la suppression')
  } finally {
    deleting.value = null
  }
}

function resetForm() {
  newUser.value = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    genre: 'MALE',
    role: 'MEMBRE'
  }
  error.value = null
}

function openModal() {
  resetForm()
  showModal.value = true
}

function getRoleColor(role) {
  const colors = {
    'ADMIN': 'badge-red',
    'MEMBRE': 'badge-blue',
    'INVITE': 'badge-gray'
  }
  return colors[role] || 'badge-gray'
}

onMounted(fetchUsers)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p class="text-gray-600 mt-1">Gérez les comptes utilisateurs de l'association</p>
      </div>
      <button @click="openModal" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Nouvel utilisateur
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Users Table -->
    <div v-else class="card p-0 overflow-hidden">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Genre</th>
              <th>Rôle</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-medium">
                      {{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}
                    </span>
                  </div>
                  <span class="font-medium">{{ user.prenom }} {{ user.nom }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.genre }}</td>
              <td>
                <span :class="['badge', getRoleColor(user.role)]">
                  {{ user.role }}
                </span>
              </td>
              <td class="text-right">
                <button
                  @click="deleteUser(user.id)"
                  :disabled="deleting === user.id"
                  class="btn btn-danger text-sm py-1.5 px-3"
                >
                  <span v-if="deleting === user.id">Suppression...</span>
                  <span v-else>Supprimer</span>
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-500">
                Aucun utilisateur trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Créer un utilisateur</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {{ error }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Prénom</label>
              <input v-model="newUser.prenom" type="text" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Nom</label>
              <input v-model="newUser.nom" type="text" class="form-input" required />
            </div>
          </div>

          <div>
            <label class="form-label">Email</label>
            <input v-model="newUser.email" type="email" class="form-input" required />
          </div>

          <div>
            <label class="form-label">Mot de passe</label>
            <input v-model="newUser.password" type="password" class="form-input" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Genre</label>
              <select v-model="newUser.genre" class="form-input">
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
              </select>
            </div>
            <div>
              <label class="form-label">Rôle</label>
              <select v-model="newUser.role" class="form-input">
                <option value="ADMIN">Admin</option>
                <option value="MEMBRE">Membre</option>
                <option value="INVITE">Invité</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" :disabled="creating" class="btn btn-primary flex-1">
              {{ creating ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
