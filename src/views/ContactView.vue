<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const membres = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/membres')
    membres.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-20 py-10">

    <!-- HEADER ACTION -->
    <div class="flex justify-between items-center">

      <router-link
          to="/"
          class="text-sm text-gray-600 hover:text-primary-600 transition"
      >
        ← Retour à l’accueil
      </router-link>

    </div>

    <!-- HERO -->
    <section class="text-center space-y-6">

      <img
          src="@/assets/logo.png"
          class="w-48 h-48 mx-auto object-contain drop-shadow-md hover:scale-105 transition duration-300"
      />

      <h1 class="text-5xl font-bold text-gray-900">
        Qui sommes-nous ?
      </h1>

      <p class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
        Une association médicale engagée dans la formation, la collaboration et l’innovation,
        au service des professionnels de santé et de l’amélioration continue des soins.
      </p>

    </section>

    <!-- INTRO -->
    <section class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
      <p class="text-gray-700 leading-relaxed text-lg">
        L’Association Médicale Ben Guerdane rassemble des professionnels de santé autour
        d’une vision commune : promouvoir l’excellence médicale, encourager la formation continue
        et renforcer la qualité des soins.
      </p>
    </section>

    <!-- ACTIVITES -->
    <section class="space-y-6">

      <h2 class="text-3xl font-semibold text-center text-gray-900">
        Nos activités
      </h2>

      <div class="grid md:grid-cols-3 gap-6">

        <div class="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition text-center">
          <p class="font-semibold text-gray-900">Formations</p>
          <p class="text-sm text-gray-500 mt-2">Ateliers pratiques et formations continues</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition text-center">
          <p class="font-semibold text-gray-900">Conférences</p>
          <p class="text-sm text-gray-500 mt-2">Événements scientifiques et échanges</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition text-center">
          <p class="font-semibold text-gray-900">Collaborations</p>
          <p class="text-sm text-gray-500 mt-2">Travail entre professionnels de santé</p>
        </div>

      </div>
    </section>

    <!-- EQUIPE -->
    <section class="space-y-10">

      <h2 class="text-3xl font-semibold text-center text-gray-900">
        Notre équipe
      </h2>

      <div v-if="loading" class="text-center text-gray-500">
        Chargement des membres...
      </div>

      <div
          v-else
          class="grid sm:grid-cols-2 md:grid-cols-3 gap-8"
      >

        <div
            v-for="m in membres"
            :key="m.id"
            class="bg-white p-6 rounded-2xl shadow-sm border text-center hover:shadow-lg hover:-translate-y-1 transition duration-300"
        >

          <img
              :src="m.imageUrl || 'https://via.placeholder.com/150'"
              class="w-28 h-28 rounded-full mx-auto mb-4 object-cover border"
          />

          <h3 class="font-semibold text-gray-900 text-lg">
            {{ m.nom }} {{ m.prenom }}
          </h3>

          <p class="text-sm text-gray-500 mt-1">
            {{ m.role }}
          </p>

        </div>

      </div>

    </section>

    <!-- VALEURS -->
    <section class="bg-white p-10 rounded-2xl shadow-sm border text-center">

      <h2 class="text-3xl font-semibold mb-4">
        Nos valeurs
      </h2>

      <p class="text-gray-600 leading-relaxed">
        Excellence • Éthique • Innovation • Collaboration • Engagement au service du patient
      </p>

    </section>

  </div>
</template>