<script setup>
import { ref, onMounted } from 'vue'
import participationService from '@/services/participationService'
import activityService from '@/services/activityService'

const participations = ref([])
const activities = ref([])
const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const [participationsData, activitiesData] = await Promise.all([
      participationService.getAll(),
      activityService.getAll()
    ])
    participations.value = participationsData
    activities.value = activitiesData
  } catch (err) {
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

function getActivityTitle(activityId) {
  const activity = activities.value.find(a => a.id === activityId)
  return activity?.titre || 'Activité inconnue'
}

function getActivityType(activityId) {
  const activity = activities.value.find(a => a.id === activityId)
  return activity?.type || 'N/A'
}

function getTypeColor(type) {
  const colors = {
    'FORMATION': 'badge-blue',
    'EVENEMENT': 'badge-green',
    'REUNION': 'badge-yellow'
  }
  return colors[type] || 'badge-gray'
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mes participations</h1>
      <p class="text-gray-600 mt-1">Consultez les participations aux activités</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Participations Table -->
    <div v-else class="card p-0 overflow-hidden">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Email</th>
              <th>Activité</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="participation in participations" :key="participation.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-medium">
                      {{ participation.nomParticipant?.charAt(0) || 'P' }}
                    </span>
                  </div>
                  <span class="font-medium">{{ participation.nomParticipant }}</span>
                </div>
              </td>
              <td>{{ participation.emailParticipant }}</td>
              <td>
                <span class="font-medium text-gray-900">
                  {{ getActivityTitle(participation.activiteId) }}
                </span>
              </td>
              <td>
                <span :class="['badge', getTypeColor(getActivityType(participation.activiteId))]">
                  {{ getActivityType(participation.activiteId) }}
                </span>
              </td>
            </tr>
            <tr v-if="participations.length === 0">
              <td colspan="4" class="text-center py-8 text-gray-500">
                Aucune participation trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
