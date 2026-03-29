<script setup>
import { ref, onMounted } from 'vue'
import historiqueService from '@/services/historiqueService'

const historiques = ref([])
const loading = ref(true)

async function fetchHistorique() {
  loading.value = true
  try {
    historiques.value = await historiqueService.getAll()
  } catch (err) {
    console.error('Erreur récupération historique:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchHistorique)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Historique des actions</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <table v-else class="w-full border border-gray-200 rounded-lg">
      <thead class="bg-gray-100">
      <tr>
        <th class="p-2 border-b">Date</th>
        <th class="p-2 border-b">Utilisateur</th>
        <th class="p-2 border-b">Action</th>
        <th class="p-2 border-b">Entité</th>
        <th class="p-2 border-b">Description</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="h in historiques" :key="h.id" class="hover:bg-gray-50">
        <td class="p-2 border-b">{{ new Date(h.dateAction).toLocaleString('fr-FR') }}</td>
        <td class="p-2 border-b">{{ h.idUser }}</td>
        <td class="p-2 border-b">{{ h.action }}</td>
        <td class="p-2 border-b">{{ h.entityName }} #{{ h.entityId }}</td>
        <td class="p-2 border-b">{{ h.description }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>