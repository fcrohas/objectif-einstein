<template>
  <div class="exercises-view">
    <div class="back-link">
      <router-link :to="`/niveau/${level}/matières`" class="back-button">
        ← Retour aux matières
      </router-link>
    </div>

    <div class="subject-header">
      <span class="subject-icon">{{ subjectData.icon }}</span>
      <h2>{{ subjectData.name }} - {{ levelName }}</h2>
    </div>

    <div v-if="subject === 'math'" class="exercises-section">
      <div class="exercise-tabs">
        <button 
          v-for="tab in mathTabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <div class="exercise-container">
        <MathExercise 
          v-if="activeTab === 'addition'"
          :level="level"
          exercise-type="addition"
          title="Additions"
        />
        
        <MathExercise 
          v-if="activeTab === 'soustraction'"
          :level="level"
          exercise-type="soustraction"
          title="Soustractions"
        />

        <MathExercise 
          v-if="activeTab === 'multiplication'"
          :level="level"
          exercise-type="multiplication"
          title="Multiplications"
        />

        <MathExercise 
          v-if="activeTab === 'division'"
          :level="level"
          exercise-type="division"
          title="Divisions"
        />
      </div>
    </div>

    <div v-else-if="subject === 'french'" class="exercises-section">
      <!-- Pour CP et CE1 : thèmes phonétiques -->
      <div v-if="['cp', 'ce1'].includes(level)">
        <h3>📖 Choisis un thème d'orthographe</h3>
        <div class="theme-tabs">
          <button 
            v-for="theme in frenchThemes" 
            :key="theme.id"
            @click="activeTheme = theme.id"
            class="theme-btn"
            :class="{ active: activeTheme === theme.id }"
          >
            {{ theme.icon }} {{ theme.label }}
          </button>
        </div>

        <div class="exercise-container">
          <SpellingExercise 
            :level="level"
            :theme="activeTheme"
            :title="`Orthographe : ${getThemeLabel(activeTheme)}`"
          />
        </div>
      </div>

      <!-- Pour CE2, CM1, CM2 : orthographe générale -->
      <div v-else class="exercise-container">
        <SpellingExercise 
          :level="level"
          title="Exercice d'orthographe"
        />
      </div>
    </div>

    <div class="progress-link">
      <router-link to="/progression" class="btn-progress">
        📊 Voir ma progression
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import MathExercise from '../components/MathExercise.vue'
import SpellingExercise from '../components/SpellingExercise.vue'

const route = useRoute()
const level = computed(() => route.params.level)
const subject = computed(() => route.params.subject)

const activeTab = ref('addition')
const activeTheme = ref('on')

const levelName = computed(() => {
  const names = { cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM1', cm2: 'CM2' }
  return names[level.value] || level.value.toUpperCase()
})

const subjectData = computed(() => {
  const subjects = {
    math: { name: 'Mathématiques', icon: '🔢' },
    french: { name: 'Français', icon: '✏️' }
  }
  return subjects[subject.value] || subjects.math
})

const mathTabs = computed(() => {
  const tabs = [
    { id: 'addition', label: 'Additions', icon: '➕' },
    { id: 'soustraction', label: 'Soustractions', icon: '➖' }
  ]
  
  if (['ce1', 'ce2', 'cm1', 'cm2'].includes(level.value)) {
    tabs.push({ id: 'multiplication', label: 'Multiplications', icon: '✖️' })
  }
  
  if (['cm1', 'cm2'].includes(level.value)) {
    tabs.push({ id: 'division', label: 'Divisions', icon: '➗' })
  }
  
  return tabs
})

const frenchThemes = computed(() => {
  const baseThemes = [
    { id: 'on', label: 'Les mots en "on"', icon: '🔵' },
    { id: 'ou', label: 'Les mots en "ou"', icon: '🟠' },
    { id: 'an', label: 'Les mots en "an/en"', icon: '🟢' },
    { id: 'in', label: 'Les mots en "in/ain"', icon: '🟡' },
    { id: 'oi', label: 'Les mots en "oi"', icon: '🔴' },
    { id: 'ch', label: 'Les mots en "ch"', icon: '🟣' }
  ]
  
  if (level.value === 'ce1') {
    baseThemes.push({ id: 'tion', label: 'Les mots en "tion"', icon: '🟤' })
  }
  
  return baseThemes
})

function getThemeLabel(themeId) {
  const theme = frenchThemes.value.find(t => t.id === themeId)
  return theme ? theme.label : ''
}
</script>

<style scoped>
.exercises-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.back-link {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.back-button:hover {
  color: #764ba2;
}

.subject-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 2rem;
  border-radius: 12px;
}

.subject-icon {
  font-size: 3rem;
}

.subject-header h2 {
  color: #667eea;
  margin: 0;
  font-size: 2rem;
}

.exercises-section h3 {
  text-align: center;
  color: #667eea;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.exercise-tabs, .theme-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn, .theme-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
}

.tab-btn:hover, .theme-btn:hover {
  background: #667eea15;
}

.tab-btn.active, .theme-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.exercise-container {
  min-height: 400px;
}

.progress-link {
  text-align: center;
  margin-top: 3rem;
}

.btn-progress {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-progress:hover {
  background: #667eea;
  color: white;
}
</style>
