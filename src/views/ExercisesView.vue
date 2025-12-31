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
      <!-- Pour CP et CE1 : thèmes phonétiques avec timeline -->
      <div v-if="['cp', 'ce1'].includes(level)">
        <!-- Mode Timeline : progression par étapes -->
        <div v-if="!allThemesCompleted">
          <h3>🎯 Parcours d'apprentissage</h3>
          <p class="timeline-instruction">
            Complète les leçons dans l'ordre pour progresser !
          </p>
          
          <div class="timeline">
            <div 
              v-for="(theme, index) in frenchThemes" 
              :key="theme.id"
              class="timeline-step"
              :class="getThemeStatus(theme.id)"
            >
              <div class="timeline-connector" v-if="index < frenchThemes.length - 1"></div>
              <div class="timeline-icon" @click="selectTheme(theme.id)">
                <span class="timeline-number">{{ index + 1 }}</span>
                <span class="timeline-emoji">{{ theme.icon }}</span>
                <span v-if="isThemeCompleted(theme.id)" class="check-mark">✓</span>
                <span v-else-if="!isThemeUnlocked(theme.id)" class="lock-icon">🔒</span>
              </div>
              <div class="timeline-label">{{ theme.label }}</div>
            </div>
          </div>

          <div v-if="currentTheme" class="exercise-container">
            <SpellingExercise 
              :key="currentTheme"
              :level="level"
              :theme="currentTheme"
              :title="`Leçon ${getCurrentThemeIndex() + 1} : ${getThemeLabel(currentTheme)}`"
              :show-next-button="canGoToNextTheme"
              @exercise-complete="onExerciseComplete"
              @next-exercise="goToNextTheme"
            />
          </div>
          <div v-else class="no-theme-selected">
            <p>👆 Clique sur une leçon pour commencer !</p>
          </div>
        </div>

        <!-- Mode Libre : tous les thèmes débloqués -->
        <div v-else>
          <div class="completion-banner">
            <h3>🎉 Bravo ! Toutes les leçons sont terminées !</h3>
            <p>Tu peux maintenant choisir n'importe quelle leçon pour t'entraîner.</p>
          </div>

          <h3>📖 Choisis une leçon d'orthographe</h3>
          <div class="theme-grid">
            <button 
              v-for="(theme, index) in frenchThemes" 
              :key="theme.id"
              @click="selectTheme(theme.id)"
              class="theme-card"
              :class="{ active: currentTheme === theme.id }"
            >
              <span class="theme-card-number">{{ index + 1 }}</span>
              <span class="theme-card-icon">{{ theme.icon }}</span>
              <span class="theme-card-label">{{ theme.label }}</span>
              <span class="theme-card-badge">✓</span>
            </button>
          </div>

          <div v-if="currentTheme" class="exercise-container">
            <SpellingExercise 
              :level="level"
              :theme="currentTheme"
              :title="`Orthographe : ${getThemeLabel(currentTheme)}`"
              @exercise-complete="onExerciseComplete"
            />
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MathExercise from '../components/MathExercise.vue'
import SpellingExercise from '../components/SpellingExercise.vue'
import { progressStore } from '../utils/progressStore'

const route = useRoute()
const level = computed(() => route.params.level)
const subject = computed(() => route.params.subject)

const activeTab = ref('addition')
const currentTheme = ref(null)
const completedThemes = ref([])

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

const allThemesCompleted = computed(() => {
  return frenchThemes.value.every(theme => isThemeCompleted(theme.id))
})

const canGoToNextTheme = computed(() => {
  const currentIndex = getCurrentThemeIndex()
  return currentIndex >= 0 && currentIndex < frenchThemes.value.length - 1
})

function isThemeCompleted(themeId) {
  const progress = progressStore.getProgress()
  const exerciseId = `spelling-${themeId}`
  const exercise = progress.exercises[level.value]?.[exerciseId]
  return exercise && exercise.score === exercise.maxScore
}

function isThemeUnlocked(themeId) {
  const themeIndex = frenchThemes.value.findIndex(t => t.id === themeId)
  
  // Le premier thème est toujours débloqué
  if (themeIndex === 0) return true
  
  // Un thème est débloqué si le précédent est complété
  const previousTheme = frenchThemes.value[themeIndex - 1]
  return isThemeCompleted(previousTheme.id)
}

function getThemeStatus(themeId) {
  if (isThemeCompleted(themeId)) return 'completed'
  if (isThemeUnlocked(themeId)) return 'unlocked'
  return 'locked'
}

function selectTheme(themeId) {
  if (allThemesCompleted.value || isThemeUnlocked(themeId)) {
    currentTheme.value = themeId
  }
}

function getCurrentThemeIndex() {
  return frenchThemes.value.findIndex(t => t.id === currentTheme.value)
}

function onExerciseComplete() {
  // Rafraîchir les données de progression
  const progress = progressStore.getProgress()
}

function goToNextTheme() {
  const currentIndex = getCurrentThemeIndex()
  const nextIndex = currentIndex + 1
  
  if (nextIndex < frenchThemes.value.length) {
    const nextTheme = frenchThemes.value[nextIndex]
    currentTheme.value = nextTheme.id
    
    // Scroller vers le haut pour voir la nouvelle leçon
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function loadProgress() {
  const progress = progressStore.getProgress()
  completedThemes.value = []
  
  frenchThemes.value.forEach(theme => {
    if (isThemeCompleted(theme.id)) {
      completedThemes.value.push(theme.id)
    }
  })
  
  // Définir le thème actif : le premier non complété ou le premier si tous sont complétés
  if (!allThemesCompleted.value) {
    const firstIncomplete = frenchThemes.value.find(t => !isThemeCompleted(t.id))
    currentTheme.value = firstIncomplete?.id || frenchThemes.value[0].id
  }
}

onMounted(() => {
  if (subject.value === 'french' && ['cp', 'ce1'].includes(level.value)) {
    loadProgress()
  }
})
</script>

<style scoped>

.timeline-instruction {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.timeline {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  margin: 3rem auto;
  max-width: 900px;
  position: relative;
  padding: 2rem 1rem;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.timeline-connector {
  position: absolute;
  top: 35px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  z-index: 0;
}

.timeline-step.completed .timeline-connector {
  background: linear-gradient(90deg, #28a745 0%, #28a745 100%);
}

.timeline-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  border: 3px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-step.unlocked .timeline-icon {
  border-color: #667eea;
  cursor: pointer;
}

.timeline-step.unlocked .timeline-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.timeline-step.completed .timeline-icon {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.timeline-step.locked .timeline-icon {
  border-color: #ccc;
  opacity: 0.6;
  cursor: not-allowed;
}

.timeline-number {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  border: 2px solid white;
}

.timeline-step.completed .timeline-number {
  background: #28a745;
}

.timeline-emoji {
  font-size: 1.8rem;
  margin-bottom: 0;
}

.check-mark {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #28a745;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 2px solid white;
  font-weight: bold;
}

.lock-icon {
  position: absolute;
  bottom: -5px;
  right: -5px;
  font-size: 1.2rem;
}

.timeline-label {
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #333;
  font-size: 0.75rem;
  max-width: 90px;
  line-height: 1.2;
}

.timeline-step.locked .timeline-label {
  color: #999;
}

.no-theme-selected {
  text-align: center;
  padding: 1rem;
  color: #667eea;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.completion-banner {
  background: linear-gradient(135deg, #28a74515 0%, #20c99715 100%);
  border: 3px solid #28a745;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 3rem;
  animation: celebrationPulse 2s ease-in-out infinite;
}

.completion-banner h3 {
  color: #28a745;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.completion-banner p {
  color: #155724;
  font-size: 1.2rem;
  margin: 0;
}

@keyframes celebrationPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.theme-card {
  background: white;
  border: 3px solid #28a745;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(40, 167, 69, 0.2);
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.theme-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.theme-card.active .theme-card-label,
.theme-card.active .theme-card-number {
  color: white;
}

.theme-card-number {
  position: absolute;
  top: -12px;
  left: -12px;
  background: #28a745;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 3px solid white;
}

.theme-card-icon {
  font-size: 3rem;
}

.theme-card-label {
  font-weight: 600;
  color: #333;
  text-align: center;
  font-size: 0.95rem;
}

.theme-card-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #28a745;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  border: 3px solid white;
  font-weight: bold;
}

@media (max-width: 768px) {
  .timeline {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .timeline-connector {
    display: none;
  }
  
  .timeline-step {
    width: 100%;
  }
}

.exercises-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.5rem;
}

.back-link {
  margin-bottom: 0.5rem;
}

.back-button {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.back-button:hover {
  color: #764ba2;
}

.subject-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 0.75rem;
  border-radius: 8px;
}

.subject-icon {
  font-size: 1.5rem;
}

.subject-header h2 {
  color: #667eea;
  margin: 0;
  font-size: 1.3rem;
}

.exercises-section h3 {
  text-align: center;
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.exercise-tabs, .theme-tabs {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn, .theme-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.9rem;
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
