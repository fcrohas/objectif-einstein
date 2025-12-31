<template>
  <div class="progress-summary">
    <div class="summary-card">
      <div class="summary-icon">📚</div>
      <div class="summary-content">
        <div class="summary-stat">{{ stats.totalExercises }} exercices faits</div>
        <div class="summary-detail">{{ stats.perfectScores }} sans faute 🌟</div>
      </div>
    </div>
    
    <div v-if="stats.achievements > 0" class="summary-card">
      <div class="summary-icon">🏆</div>
      <div class="summary-content">
        <div class="summary-stat">{{ stats.achievements }} succès</div>
        <div class="summary-detail">Continue comme ça !</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { progressStore } from '../utils/progressStore'

const stats = ref(progressStore.getStats())

onMounted(() => {
  stats.value = progressStore.getStats()
})
</script>

<style scoped>
.progress-summary {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.summary-icon {
  font-size: 2.5rem;
}

.summary-content {
  text-align: left;
}

.summary-stat {
  font-size: 1.1rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.summary-detail {
  font-size: 0.9rem;
  color: #666;
}
</style>
