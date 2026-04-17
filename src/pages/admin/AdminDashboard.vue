<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'
import activityService from '@/services/activityService'
import voteService from '@/services/voteService'
import participationService from '@/services/participationService'
import contactService from '@/services/contactService'

const stats = ref({
  users: 0,
  activities: 0,
  votes: 0,
  participations: 0
})

const loading = ref(true)
const recentActivities = ref([])
const messages = ref([])
const selectedMessage = ref(null)

onMounted(async () => {
  try {
    const [users, activities, votes, participations, contacts] = await Promise.all([
      userService.getAll().catch(() => []),
      activityService.getAll().catch(() => []),
      voteService.getAll().catch(() => []),
      participationService.getAll().catch(() => []),
      contactService.getAllContacts().catch(() => [])
    ])

    console.log("CONTACTS RAW =>", contacts)

    stats.value = {
      users: users.length || 0,
      activities: activities.length || 0,
      votes: votes.length || 0,
      participations: participations.length || 0
    }

    recentActivities.value = activities.slice(0, 5)

    // 🔥 FIX IMPORTANT ICI
    const normalizedContacts =
        Array.isArray(contacts)
            ? contacts
            : (contacts?.data || [])

    messages.value = normalizedContacts.slice(0, 10)

    selectedMessage.value = messages.value.length > 0
        ? messages.value[0]
        : null

  } catch (e) {
    console.error("Dashboard error:", e)
  } finally {
    loading.value = false
  }
})

const selectMessage = (m) => {
  selectedMessage.value = m
}

const deleteMessage = async (id) => {
  try {
    await contactService.deleteContact(id)

    messages.value = messages.value.filter(m => m.id !== id)

    if (selectedMessage.value?.id === id) {
      selectedMessage.value = messages.value[0] || null
    }

  } catch (e) {
    console.error("Delete error:", e)
  }
}
</script>

<template>
  <div>

    <!-- HEADER -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <p class="text-gray-600 mt-1">Bienvenue dans votre espace d'administration</p>
    </div>

    <!-- STATS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      <div class="card">👥 {{ stats.users }} Utilisateurs</div>
      <div class="card">📅 {{ stats.activities }} Activités</div>
      <div class="card">🗳 {{ stats.votes }} Votes</div>
      <div class="card">👤 {{ stats.participations }} Participations</div>

    </div>

    <!-- ACTIVITIES -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold mb-4">Activités récentes</h2>

      <div v-if="loading" class="text-gray-500">Chargement...</div>

      <div v-else class="space-y-2">
        <div v-for="a in recentActivities" :key="a.id" class="p-2 bg-gray-50 rounded">
          {{ a.titre || 'Sans titre' }}
        </div>
      </div>
    </div>

    <!-- 💥 INBOX STYLE FACEBOOK -->
    <div class="card flex h-[520px] overflow-hidden">

      <!-- LEFT LIST -->
      <div class="w-1/3 border-r overflow-y-auto">

        <div
            v-for="m in messages"
            :key="m.id"
            @click="selectMessage(m)"
            class="p-3 cursor-pointer hover:bg-gray-100 transition"
            :class="selectedMessage?.id === m.id ? 'bg-gray-200' : ''"
        >

          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              {{ m.nom?.charAt(0) || '?' }}
            </div>

            <div class="font-semibold text-sm">
              {{ m.nom || 'Sans nom' }}
            </div>
          </div>

          <div class="text-xs text-gray-500 truncate mt-1">
            {{ m.objectif || '' }}
          </div>

          <div class="text-xs text-gray-400 truncate">
            {{ m.message || '' }}
          </div>

        </div>

      </div>

      <!-- RIGHT VIEW -->
      <div class="flex-1 p-6">

        <div v-if="!selectedMessage" class="text-gray-400">
          Aucun message sélectionné
        </div>

        <div v-else class="space-y-4">

          <div class="flex justify-between items-center">

            <div>
              <h2 class="text-xl font-bold">
                {{ selectedMessage.nom }}
              </h2>

              <p class="text-gray-500 text-sm">
                {{ selectedMessage.email }}
              </p>
            </div>

            <button
                @click="deleteMessage(selectedMessage.id)"
                class="bg-red-500 text-white px-3 py-1 rounded"
            >
              Supprimer
            </button>

          </div>

          <div class="bg-gray-50 p-4 rounded-lg border whitespace-pre-line">
            {{ selectedMessage.message }}
          </div>

        </div>

      </div>

    </div>

  </div>
</template>