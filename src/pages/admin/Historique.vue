<script setup>
import { ref, onMounted } from 'vue'
import historiqueService from '@/services/historiqueService'
import userService from '@/services/userService'
import activityService from '@/services/activityService'
import voteService from '@/services/voteService'

const historiques = ref([])
const loading = ref(true)
const error = ref(false)

// =====================
// CACHE
// =====================
const usersCache = {}
const activitesCache = {}
const votesCache = {}

// =====================
// FETCH USER
// =====================
async function getUser(id) {
  if (!id) return null
  if (usersCache[id]) return usersCache[id]

  try {
    const u = await userService.getById(id)
    usersCache[id] = u
    return u
  } catch {
    return null
  }
}

// =====================
// FETCH ACTIVITE
// =====================
async function getActivite(id) {
  if (!id) return null
  if (activitesCache[id]) return activitesCache[id]

  try {
    const a = await activityService.getById(id)
    activitesCache[id] = a
    return a
  } catch {
    return null
  }
}

// =====================
// FETCH VOTE
// =====================
async function getVote(id) {
  if (!id) return null
  if (votesCache[id]) return votesCache[id]

  try {
    const v = await voteService.getById(id)
    votesCache[id] = v
    return v
  } catch {
    return null
  }
}

// =====================
// BADGE STYLE
// =====================
function getBadge(action) {
  if (!action) return 'bg-gray-100 text-gray-700'

  if (action.includes('VOTE')) return 'bg-blue-100 text-blue-700'
  if (action.includes('ACTIVITE')) return 'bg-green-100 text-green-700'
  if (action.includes('DELETE')) return 'bg-red-100 text-red-700'
  if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-700'

  return 'bg-gray-100 text-gray-700'
}

// =====================
// ENRICH DATA
// =====================
async function enrich(data) {
  try {
    const enriched = await Promise.all(
        data.map(async (h) => {
          const user = await getUser(h.idUser)

          let activite = null
          let vote = null

          if (h.entityName === 'ACTIVITE') {
            activite = await getActivite(h.entityId)
          } else if (h.entityName === 'VOTE') {
            vote = await getVote(h.entityId)
          }

          return {
            ...h,
            user,
            activite,
            vote
          }
        })
    )

    historiques.value = enriched
  } catch (e) {
    console.error(e)
    error.value = true
  }
}

// =====================
// FETCH MAIN
// =====================
async function fetchHistorique() {
  loading.value = true
  error.value = false

  try {
    const data = await historiqueService.getAll()

    if (!data || data.length === 0) {
      historiques.value = []
      return
    }

    await enrich(data)

  } catch (err) {
    console.error('Erreur historique:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistorique)
</script>

<template>
  <div class="p-6">

    <!-- HEADER -->
    <h1 class="text-2xl font-bold mb-6">
      Historique des actions
    </h1>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="text-red-600 font-medium">
      Erreur lors du chargement de l'historique
    </div>

    <!-- EMPTY -->
    <div v-else-if="historiques.length === 0" class="text-gray-500">
      Aucun historique disponible
    </div>

    <!-- LIST -->
    <div v-else class="space-y-4">

      <div
          v-for="h in historiques"
          :key="h.id"
          class="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
      >
        <div class="flex justify-between gap-4">

          <!-- LEFT -->
          <div class="space-y-3 flex-1">

            <!-- BADGE -->
            <span
                class="text-xs px-2 py-1 rounded font-medium"
                :class="getBadge(h.action)"
            >
              {{ h.action }}
            </span>

            <!-- USER -->
            <div class="text-sm text-gray-700">
              👤
              <span v-if="h.user">
                {{ h.user.prenom }} {{ h.user.nom }}
              </span>
              <span v-else>
                Système
              </span>
            </div>

            <!-- ACTIVITE -->
            <div v-if="h.activite" class="bg-green-50 p-3 rounded border">
              <div class="font-semibold text-green-800 mb-1">
                📌 Activité
              </div>

              <div class="text-sm space-y-1">
                <div><b>Titre:</b> {{ h.activite.titre }}</div>
                <div><b>Description:</b> {{ h.activite.description }}</div>
                <div><b>Type:</b> {{ h.activite.type }}</div>
                <div><b>Statut:</b> {{ h.activite.statut }}</div>
                <div><b>Proposition:</b> {{ h.activite.statutProposition }}</div>

                <div v-if="h.activite.membre?.length">
                  <b>Membres:</b>
                  <span
                      v-for="(m,i) in h.activite.membre"
                      :key="i"
                  >
                    {{ m }}<span v-if="i < h.activite.membre.length - 1">, </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- VOTE -->
            <div v-if="h.vote" class="bg-blue-50 p-3 rounded border">
              <div class="font-semibold text-blue-800 mb-1">
                🗳️ Vote
              </div>

              <div class="text-sm space-y-1">
                <div><b>Description:</b> {{ h.vote.description }}</div>
                <div><b>Statut:</b> {{ h.vote.statut }}</div>
                <div>
                  <b>Date:</b>
                  {{ new Date(h.vote.dateCreation).toLocaleString('fr-FR') }}
                </div>
              </div>
            </div>

            <!-- DESCRIPTION -->
            <div class="whitespace-pre-line text-sm text-gray-700">
              {{ h.description }}
            </div>

          </div>

          <!-- DATE -->
          <div class="text-xs text-gray-400 whitespace-nowrap">
            {{ new Date(h.dateAction).toLocaleString('fr-FR') }}
          </div>

        </div>
      </div>

    </div>

  </div>
</template>