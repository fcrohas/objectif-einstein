<template>
  <div class="home container">
    <div class="hero">
      <div class="profile-header">
        <h1>Bonjour {{ profileName }} ! 🚀</h1>
        <button @click="changeProfile" class="change-profile-btn">
          Changer de profil
        </button>
      </div>
      <p class="subtitle">Ton voyage d'apprentissage</p>
      <ProgressSummary />
    </div>

    <div class="levels-grid">
      <div 
        v-for="level in accessibleLevels" 
        :key="level.id"
        class="level-card"
        @click="goToLevel(level.id)"
      >
        <div class="level-icon">{{ level.icon }}</div>
        <h2>{{ level.name }}</h2>
        <p>{{ level.description }}</p>
        <div class="level-subjects">
          <span v-for="subject in level.subjects" :key="subject" class="subject-tag">
            {{ subject }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProgressSummary from '../components/ProgressSummary.vue'
import { profileStore } from '../utils/profileStore'

const router = useRouter()
const activeProfile = ref(null)

const levels = [
  {
    id: 'cp',
    name: 'CP',
    icon: '🌱',
    description: 'Cours Préparatoire - Les fondamentaux',
    subjects: ['Lecture', 'Écriture', 'Nombres']
  },
  {
    id: 'ce1',
    name: 'CE1',
    icon: '🌿',
    description: 'Cours Élémentaire 1 - On grandit !',
    subjects: ['Français', 'Maths', 'Découverte']
  },
  {
    id: 'ce2',
    name: 'CE2',
    icon: '🌳',
    description: 'Cours Élémentaire 2 - On progresse',
    subjects: ['Français', 'Maths', 'Sciences']
  },
  {
    id: 'cm1',
    name: 'CM1',
    icon: '🏔️',
    description: 'Cours Moyen 1 - On s\'affirme',
    subjects: ['Français', 'Maths', 'Histoire', 'Géo']
  },
  {
    id: 'cm2',
    name: 'CM2',
    icon: '🎯',
    description: 'Cours Moyen 2 - Cap sur le collège !',
    subjects: ['Français', 'Maths', 'Histoire', 'Sciences']
  }
]

const profileName = computed(() => {
  return activeProfile.value?.name || 'Élève'
})

const accessibleLevels = computed(() => {
  if (!activeProfile.value) return levels
  
  const accessible = profileStore.getAccessibleLevels(activeProfile.value.currentLevel)
  return levels.filter(level => accessible.includes(level.id))
})

const goToLevel = (levelId) => {
  router.push(`/niveau/${levelId}`)
}

const changeProfile = () => {
  router.push('/profil')
}

onMounted(() => {
  activeProfile.value = profileStore.getActiveProfile()
})
</script>

<style scoped>
.home {
  min-height: calc(100vh - 200px);
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.change-profile-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.change-profile-btn:hover {
  background: #667eea;
  color: white;
}

.hero h1 {
  color: #667eea;
  margin: 0;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.level-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.level-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.level-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  text-align: center;
}

.level-card h2 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.level-card p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.level-subjects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.subject-tag {
  background-color: #667eea20;
  color: #667eea;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
