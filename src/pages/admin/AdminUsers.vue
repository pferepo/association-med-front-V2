<script setup>
import { ref, onMounted, computed } from 'vue'
import userService from '@/services/userService'

const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const deleting = ref(null)

const filter = ref('ALL')

const newUser = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  genre: 'MALE',
  role: 'MEMBRE',
  active: false
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
    await userService.create({
      ...newUser.value,
      active: false
    })

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

async function toggleActive(user) {
  try {
    await userService.update(user.id)
    await fetchUsers()
  } catch (err) {
    console.error('ERROR FULL:', err)
    console.error('ERROR RESPONSE:', err.response)
    alert('Erreur lors de l’activation')
  }
}

function resetForm() {
  newUser.value = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    genre: 'MALE',
    role: 'MEMBRE',
    active: false
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

const filteredUsers = computed(() => {
  if (filter.value === 'ACTIVE') return users.value.filter(u => u.active)
  if (filter.value === 'INACTIVE') return users.value.filter(u => !u.active)
  return users.value
})

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
        Nouvel utilisateur
      </button>
    </div>

    <div class="flex gap-2 mb-4">
      <button @click="filter = 'ALL'" class="btn btn-sm">Tous</button>
      <button @click="filter = 'ACTIVE'" class="btn btn-sm btn-success">Actifs</button>
      <button @click="filter = 'INACTIVE'" class="btn btn-sm btn-danger">Inactifs</button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="card p-0 overflow-hidden">
      <div class="table-container">
        <table class="data-table w-full">
          <thead>
          <tr>
            <th>Nom complet</th>
            <th>Email</th>
            <th>Genre</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th class="text-right pr-4">Actions</th>
          </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-700 font-medium">{{ user.prenom?.charAt(0) }}{{ user.nom?.charAt(0) }}</span>
                </div>
                <span class="font-medium">ID {{ user.id }} - {{ user.prenom }} {{ user.nom }}</span>
              </div>
            </td>

            <td>{{ user.email }}</td>
            <td>{{ user.genre }}</td>

            <td>
              <span :class="['badge', getRoleColor(user.role)]">{{ user.role }}</span>
            </td>

            <td>
              <span :class="user.active ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                {{ user.active ? 'Actif' : 'Inactif' }}
              </span>
            </td>

            <td class="flex gap-2 justify-end pr-4">
              <button @click="toggleActive(user)" class="btn btn-sm flex-1">
                {{ user.active ? 'Désactiver' : 'Activer' }}
              </button>
              <button @click="deleteUser(user.id)" :disabled="deleting === user.id" class="btn btn-danger text-sm py-1.5 px-3 flex-1">
                <span v-if="deleting === user.id">...</span>
                <span v-else>Supprimer</span>
              </button>
            </td>
          </tr>

          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="text-center py-8 text-gray-500">Aucun utilisateur trouvé</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50" @click.self="showModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">Créer un utilisateur</h2>
          <button @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>

          <input v-model="newUser.prenom" placeholder="Prénom" class="form-input" required />
          <input v-model="newUser.nom" placeholder="Nom" class="form-input" required />
          <input v-model="newUser.email" type="email" placeholder="Email" class="form-input" required />
          <input v-model="newUser.password" type="password" placeholder="Mot de passe" class="form-input" required />

          <select v-model="newUser.genre" class="form-input">
            <option value="MALE">Homme</option>
            <option value="FEMALE">Femme</option>
          </select>

          <select v-model="newUser.role" class="form-input">
            <option value="ADMIN">Admin</option>
            <option value="MEMBRE">Membre</option>
            <option value="INVITE">Invité</option>
          </select>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showModal = false" class="btn btn-secondary flex-1">Annuler</button>
            <button type="submit" class="btn btn-primary flex-1">{{ creating ? '...' : 'Créer' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>