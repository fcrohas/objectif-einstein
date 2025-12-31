<template>
  <div class="progress-dashboard">
    <div class="dashboard-header">
      <h2>📊 Ton tableau de bord</h2>
      <button @click="refreshProgress" class="btn-refresh">🔄 Actualiser</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-value">{{ stats.totalExercises }}</div>
        <div class="stat-label">Exercices faits</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">{{ stats.perfectScores }}</div>
        <div class="stat-label">Sans faute</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">{{ stats.achievements }}</div>
        <div class="stat-label">Succès débloqués</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">{{ currentLevelName }}</div>
        <div class="stat-label">Niveau actuel</div>
      </div>
    </div>

    <div class="levels-progress">
      <h3>Progression par niveau</h3>
      <div class="level-bars">
        <div 
          v-for="(level, key) in progress.levels" 
          :key="key"
          class="level-bar-container"
        >
          <div class="level-bar-header">
            <span class="level-name">{{ getLevelName(key) }}</span>
            <span class="level-stats">{{ level.completed }}/{{ level.total || 0 }} - {{ level.score || 0 }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getProgressWidth(level) }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="progress.achievements.length > 0" class="achievements-section">
      <h3>🏆 Tes succès</h3>
      <div class="achievements-grid">
        <div 
          v-for="achievement in progress.achievements" 
          :key="achievement.id"
          class="achievement-card"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-title">{{ achievement.title }}</div>
          <div class="achievement-date">{{ formatDate(achievement.date) }}</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="resetProgress" class="btn-danger">
        🗑️ Réinitialiser la progression
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { progressStore } from '../utils/progressStore'

const progress = ref(progressStore.getProgress())
const stats = ref(progressStore.getStats())

const currentLevelName = computed(() => {
  return getLevelName(progress.value.currentLevel)
})

function getLevelName(key) {
  const names = {
    cp: 'CP',
    ce1: 'CE1',
    ce2: 'CE2',
    cm1: 'CM1',
    cm2: 'CM2'
  }
  return names[key] || key.toUpperCase()
}

function getProgressWidth(level) {
  if (!level.total) return '0%'
  const percentage = (level.completed / level.total) * 100
  return `${Math.min(percentage, 100)}%`
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

function refreshProgress() {
  progress.value = progressStore.getProgress()
  stats.value = progressStore.getStats()
}

function resetProgress() {
  if (confirm('Es-tu sûr(e) de vouloir réinitialiser toute ta progression ? Cette action est irréversible.')) {
    progressStore.reset()
    refreshProgress()
  }
}

onMounted(() => {
  refreshProgress()
})
</script>

<style scoped>
.progress-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  color: #667eea;
  margin: 0;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #667eea;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #f0f0f0;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0.5rem 0;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.levels-progress {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.levels-progress h3 {
  color: #667eea;
  margin-bottom: 1.5rem;
}

.level-bars {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.level-bar-container {
  width: 100%;
}

.level-bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.level-name {
  color: #333;
}

.level-stats {
  color: #667eea;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
  border-radius: 15px;
}

.achievements-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.achievements-section h3 {
  color: #667eea;
  margin-bottom: 1.5rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.achievement-card {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.achievement-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.achievement-title {
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.achievement-date {
  font-size: 0.85rem;
  color: #666;
}

.actions {
  text-align: center;
  margin-top: 3rem;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #dc3545;
  color: #dc3545;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc3545;
  color: white;
}
</style>
