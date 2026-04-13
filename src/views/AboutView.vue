<script setup>
import { ref, onMounted } from 'vue'
import userService from '@/services/userService'

const membres = ref([])
const loading = ref(true)

const BASE_URL = import.meta.env.VITE_API_URL
const getImageUrl = (p) => (p ? BASE_URL + p : null)

onMounted(async () => {
  try {
    membres.value = await userService.getBureauMembers()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-20 py-10 px-4">


    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <button
          @click="goBack"
          class="text-sm text-gray-600 hover:text-blue-600 transition"
      >
        ← Retour
      </button>
    </div>

    <!-- HERO -->
    <section class="text-center space-y-6">

      <img src="@/assets/logo.png"
           class="w-40 h-40 mx-auto object-contain drop-shadow-md"/>

      <h1 class="text-4xl md:text-5xl font-bold text-gray-900">
        Qui sommes-nous ?
      </h1>

      <p class="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
        Une association médicale engagée dans la formation, la collaboration
        et l’innovation, au service des professionnels de santé.
      </p>

    </section>

    <!-- INTRO -->
    <section class="bg-white p-8 rounded-2xl shadow-sm border text-center">
      <p class="text-gray-700 leading-relaxed text-lg">
        L’Association Médicale Ben Guerdane rassemble des professionnels de santé
        autour d’une vision commune : promouvoir l’excellence médicale,
        encourager la formation continue et améliorer la qualité des soins.
      </p>
    </section>

    <!-- ACTIVITES -->
    <section class="space-y-6">
      <h2 class="text-3xl font-semibold text-center text-gray-900">
        Nos activités
      </h2>

      <div class="grid md:grid-cols-3 gap-6">

        <div class="card">
          <p class="title">Formations</p>
          <p class="desc">Ateliers pratiques et formations continues</p>
        </div>

        <div class="card">
          <p class="title">Conférences</p>
          <p class="desc">Événements scientifiques et échanges</p>
        </div>

        <div class="card">
          <p class="title">Collaborations</p>
          <p class="desc">Travail entre professionnels de santé</p>
        </div>

      </div>
    </section>

    <!-- EQUIPE -->
    <section class="space-y-10">

      <h2 class="text-3xl font-semibold text-center text-gray-900">
        Bureau Exécutif
      </h2>

      <div v-if="loading" class="text-center text-gray-500">
        Chargement des membres...
      </div>

      <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

        <div v-for="m in membres"
             :key="m.id"
             class="user-card">

          <!-- IMAGE -->
          <img v-if="m.imageUrl"
               :src="getImageUrl(m.imageUrl)"
               class="avatar"/>

          <div v-else class="avatar fallback">
            {{ m.nom?.[0] }}{{ m.prenom?.[0] }}
          </div>

          <!-- INFOS -->
          <h3 class="name">
            {{ m.prenom }} {{ m.nom }}
          </h3>

          <p class="grade">
            {{ m.grade || 'Médecin' }}
          </p>

          <span class="role-badge">
          Bureau exécutif
        </span>

        </div>

      </div>

    </section>

    <!-- VALEURS -->
    <section class="bg-white p-8 rounded-2xl shadow-sm border text-center">

      <h2 class="text-3xl font-semibold mb-4">
        Nos valeurs
      </h2>

      <p class="text-gray-600 leading-relaxed">
        Excellence • Éthique • Innovation • Collaboration • Engagement
      </p>

    </section>

  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
  transition: 0.3s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.title {
  font-weight: 600;
  color: #111;
}
.desc {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

/* USER CARD */
.user-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #eee;
  text-align: center;
  transition: 0.3s;
}
.user-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.08);
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin: auto;
  border: 3px solid #f1f1f1;
}

.fallback {
  display:flex;
  align-items:center;
  justify-content:center;
  background:#ddd;
  font-weight:bold;
  font-size:20px;
}

.name {
  margin-top: 15px;
  font-weight: 600;
  color: #111;
}

.grade {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.role-badge {
  display: inline-block;
  margin-top: 10px;
  background: #2563eb;
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
}
</style>