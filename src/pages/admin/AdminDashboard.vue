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
const deleting = ref(false)

onMounted(async () => {
  try {
    const [users, activities, votes, participations, contacts] = await Promise.all([
      userService.getAll().catch(() => []),
      activityService.getAll().catch(() => []),
      voteService.getAll().catch(() => []),
      participationService.getAll().catch(() => []),
      contactService.getAllContacts().catch(() => [])
    ])

    stats.value = {
      users: users.length || 0,
      activities: activities.length || 0,
      votes: votes.length || 0,
      participations: participations.length || 0
    }

    recentActivities.value = activities.slice(0, 5)

    const normalizedContacts = Array.isArray(contacts)
        ? contacts
        : (contacts?.data || [])

    messages.value = normalizedContacts.slice(0, 10)
    selectedMessage.value = messages.value.length > 0 ? messages.value[0] : null

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
  if (!confirm('Supprimer ce message ?')) return
  deleting.value = true
  try {
    await contactService.deleteContact(id)
    messages.value = messages.value.filter(m => m.id !== id)
    selectedMessage.value = messages.value[0] || null
  } catch (e) {
    console.error("Delete error:", e)
  } finally {
    deleting.value = false
  }
}

// ✅ Ouvrir le client mail avec le destinataire + sujet pré-rempli
const replyByEmail = (message) => {
  const subject = encodeURIComponent(`Réponse : ${message.objectif || 'Votre message'}`)
  const body = encodeURIComponent(`Bonjour ${message.nom},\n\n`)
  window.open(`mailto:${message.email}?subject=${subject}&body=${body}`, '_blank')
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

    <!-- INBOX -->
    <div class="card flex h-[520px] overflow-hidden">

      <!-- LEFT LIST -->
      <div class="w-1/3 border-r overflow-y-auto">

        <div class="px-3 py-2 border-b">
          <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Messages ({{ messages.length }})
          </h3>
        </div>

        <div
            v-for="m in messages"
            :key="m.id"
            @click="selectMessage(m)"
            class="p-3 cursor-pointer hover:bg-gray-50 transition border-b last:border-0"
            :class="selectedMessage?.id === m.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'"
        >
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {{ m.nom?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-sm text-gray-800 truncate">
                {{ m.nom || 'Sans nom' }}
              </div>
              <div class="text-xs text-gray-400 truncate">
                {{ m.email || '' }}
              </div>
            </div>
          </div>

          <div class="text-xs text-gray-500 truncate mt-1 pl-11">
            {{ m.objectif || m.message || '' }}
          </div>
        </div>

        <div v-if="messages.length === 0" class="p-6 text-center text-gray-400 text-sm">
          Aucun message
        </div>

      </div>

      <!-- RIGHT VIEW -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <div v-if="!selectedMessage" class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <div class="text-4xl mb-2">✉️</div>
            <p class="text-sm">Sélectionnez un message</p>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col overflow-hidden">

          <!-- MESSAGE HEADER -->
          <div class="flex justify-between items-start px-6 py-4 border-b bg-white">

            <div class="flex items-center gap-3">
              <div class="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                {{ selectedMessage.nom?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div>
                <h2 class="text-base font-bold text-gray-900">
                  {{ selectedMessage.nom }}
                </h2>
                <p class="text-sm text-gray-500">{{ selectedMessage.email }}</p>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="flex items-center gap-2">

              <!-- ✅ RÉPONDRE PAR EMAIL -->
              <button
                  @click="replyByEmail(selectedMessage)"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
              >
                <span>↩</span>
                <span>Répondre</span>
              </button>

              <!-- ✅ SUPPRIMER (amélioré) -->
              <button
                  @click="deleteMessage(selectedMessage.id)"
                  :disabled="deleting"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition disabled:opacity-50"
              >
                <span>🗑</span>
                <span>{{ deleting ? '...' : 'Supprimer' }}</span>
              </button>

            </div>

          </div>

          <!-- OBJET -->
          <div v-if="selectedMessage.objectif" class="px-6 py-2 bg-gray-50 border-b">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">Objet : </span>
            <span class="text-sm text-gray-700">{{ selectedMessage.objectif }}</span>
          </div>

          <!-- BODY -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div class="bg-gray-50 rounded-xl border p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {{ selectedMessage.message }}
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>