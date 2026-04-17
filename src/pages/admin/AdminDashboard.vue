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
  <div class="space-y-8">

    <!-- HEADER -->
    <div>
      <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Tableau de Bord Admin
      </h1>
      <p class="text-muted-foreground mt-2">Vue d&apos;ensemble complète de votre association</p>
    </div>

    <!-- STATS GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div class="stat-card group">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">👥</span>
          <span class="text-xs font-semibold text-primary/60 group-hover:text-primary transition-colors">+{{ stats.users > 0 ? '+' : '' }}0%</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Utilisateurs</p>
        <p class="text-3xl font-bold text-foreground">{{ stats.users }}</p>
      </div>

      <div class="stat-card group">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">📅</span>
          <span class="text-xs font-semibold text-accent/60 group-hover:text-accent transition-colors">Actifs</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Activités</p>
        <p class="text-3xl font-bold text-foreground">{{ stats.activities }}</p>
      </div>

      <div class="stat-card group">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">🗳️</span>
          <span class="text-xs font-semibold text-secondary/60 group-hover:text-secondary transition-colors">En cours</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Votes</p>
        <p class="text-3xl font-bold text-foreground">{{ stats.votes }}</p>
      </div>

      <div class="stat-card group">
        <div class="flex items-center justify-between mb-4">
          <span class="text-3xl">✅</span>
          <span class="text-xs font-semibold text-green-600/60 group-hover:text-green-600 transition-colors">{{ stats.participations }} actives</span>
        </div>
        <p class="text-muted-foreground text-sm mb-1">Participations</p>
        <p class="text-3xl font-bold text-foreground">{{ stats.participations }}</p>
      </div>
    </div>

    <!-- CONTENT GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ACTIVITIES SECTION -->
      <div class="lg:col-span-2 card-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-foreground">Activités Récentes</h2>
            <p class="text-sm text-muted-foreground mt-1">Dernières mises à jour</p>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-muted-foreground">⏳ Chargement...</div>
        </div>

        <div v-else-if="recentActivities.length === 0" class="py-12 text-center">
          <p class="text-muted-foreground">Aucune activité trouvée</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="a in recentActivities" :key="a.id" class="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-foreground truncate">{{ a.titre || 'Sans titre' }}</p>
                <p class="text-sm text-muted-foreground mt-1 line-clamp-2">{{ a.description || 'Pas de description' }}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary whitespace-nowrap">{{ a.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STATS BOX -->
      <div class="card-lg p-6">
        <h2 class="text-xl font-bold text-foreground mb-6">Résumé</h2>
        <div class="space-y-4">
          <div class="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p class="text-xs text-muted-foreground mb-1">Total</p>
            <p class="text-2xl font-bold text-primary">{{ stats.users + stats.activities + stats.votes + stats.participations }}</p>
          </div>
          <div class="p-3 bg-accent/5 rounded-lg border border-accent/20">
            <p class="text-xs text-muted-foreground mb-1">Taux d&apos;engagement</p>
            <p class="text-2xl font-bold text-accent">{{ stats.participations > 0 ? Math.round((stats.participations / stats.activities) * 100) : 0 }}%</p>
          </div>
          <div class="p-3 bg-secondary/5 rounded-lg border border-secondary/20">
            <p class="text-xs text-muted-foreground mb-1">Statut</p>
            <p class="text-sm font-semibold text-secondary flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Opérationnel
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- INBOX SECTION -->
    <div class="card-lg p-6 overflow-hidden flex flex-col lg:flex-row h-[600px]">
      <!-- MESSAGES LIST -->
      <div class="w-full lg:w-1/3 border-r border-border overflow-y-auto pb-4 lg:pb-0">
        <h2 class="font-bold text-foreground mb-4 sticky top-0 bg-card p-4 -mx-6 -mt-6 mb-2">Messages ({{ messages.length }})</h2>
        <div class="px-4">
          <div
              v-if="messages.length === 0"
              class="text-center py-8 text-muted-foreground text-sm"
          >
            Aucun message
          </div>

          <div
              v-for="m in messages"
              :key="m.id"
              @click="selectMessage(m)"
              class="p-3 mb-2 rounded-lg cursor-pointer transition-all border"
              :class="selectedMessage?.id === m.id 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-muted/30 border-transparent hover:bg-muted/60'"
          >
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                {{ m.nom?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <p class="font-semibold text-sm truncate text-foreground">{{ m.nom || 'Sans nom' }}</p>
            </div>
            <p class="text-xs text-muted-foreground truncate">{{ m.email || '' }}</p>
          </div>
        </div>
      </div>

      <!-- MESSAGE DETAIL -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div v-if="!selectedMessage" class="h-full flex items-center justify-center">
          <p class="text-muted-foreground">Sélectionnez un message pour voir les détails</p>
        </div>

        <div v-else class="space-y-6">
          <div>
            <h3 class="text-2xl font-bold text-foreground">{{ selectedMessage.nom }}</h3>
            <p class="text-muted-foreground">{{ selectedMessage.email }}</p>
            <p class="text-xs text-muted-foreground/70 mt-2">{{ selectedMessage.objectif }}</p>
          </div>

          <div class="bg-muted/30 p-4 rounded-lg border border-border">
            <p class="text-sm text-foreground whitespace-pre-wrap break-words">
              {{ selectedMessage.message || 'Pas de message' }}
            </p>
          </div>

          <div class="flex gap-3">
            <button
                @click="deleteMessage(selectedMessage.id)"
                class="px-4 py-2 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded-lg font-medium text-sm transition-colors"
            >
              Supprimer
            </button>
            <button class="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg font-medium text-sm transition-colors">
              Répondre
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
