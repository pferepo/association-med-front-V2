<script setup>
import { ref, onMounted } from 'vue'
import historiqueService from '@/services/historiqueService'
import userService from '@/services/userService'
import activityService from '@/services/activityService'
import voteService from '@/services/voteService'

const historiques = ref([])
const loading = ref(true)
const error = ref(false)

// caches (évite appels multiples)
const usersCache = {}
const activitesCache = {}
const votesCache = {}

// =====================
// SAFE FETCH USER
// =====================
async function getUser(id) {
  if (!id) return 'Système'
  if (usersCache[id]) return usersCache[id]

  try {
    const u = await userService.getById(id)
    const fullName = `${u.prenom} ${u.nom}`
    usersCache[id] = fullName
    return fullName
  } catch {
    return 'Utilisateur inconnu'
  }
}

// =====================
// SAFE FETCH ACTIVITE
// =====================
async function getActivite(id) {
  if (!id) return ''
  if (activitesCache[id]) return activitesCache[id]

  try {
    const a = await activityService.getById(id)
    activitesCache[id] = a.titre
    return a.titre
  } catch {
    return 'Activité'
  }
}

// =====================
// SAFE FETCH VOTE
// =====================
async function getVote(id) {
  if (!id) return ''
  if (votesCache[id]) return votesCache[id]

  try {
    const v = await voteService.getById(id)
    votesCache[id] = v.description
    return v.description
  } catch {
    return 'Vote'
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
// ENRICH DATA SAFE
// =====================
async function enrich(data) {
  try {
    const enriched = await Promise.all(
        data.map(async (h) => {
          let entityLabel = h.entityName

          if (h.entityName === 'ACTIVITE') {
            entityLabel = await getActivite(h.entityId)
          } else if (h.entityName === 'VOTE') {
            entityLabel = await getVote(h.entityId)
          }

          const userName = await getUser(h.idUser)

          return {
            ...h,
            userName,
            entityLabel
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

    <!-- TITLE -->
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
    <div v-else class="space-y-3">

      <div
          v-for="h in historiques"
          :key="h.id"
          class="p-4 border rounded-lg bg-white hover:shadow-md transition"
      >

        <div class="flex justify-between">

          <!-- LEFT -->
          <div class="space-y-1">

            <!-- ACTION BADGE -->
            <span
                class="text-xs px-2 py-1 rounded font-medium"
                :class="getBadge(h.action)"
            >
              {{ h.action }}
            </span>

            <!-- USER -->
            <div class="text-sm text-gray-700">
              👤 {{ h.userName }}
            </div>

            <!-- ENTITY -->
            <div class="text-sm text-gray-700">
              📌 {{ h.entityName }} :
              <span class="font-semibold text-gray-900">
                {{ h.entityLabel }}
              </span>
            </div>

            <!-- DESCRIPTION -->
            <div class="text-sm text-gray-500">
              {{ h.description }}
            </div>

          </div>

          <!-- RIGHT -->
          <div class="text-xs text-gray-400 whitespace-nowrap">
            {{ new Date(h.dateAction).toLocaleString('fr-FR') }}
          </div>

        </div>

      </div>
    </div>

  </div>
</template>