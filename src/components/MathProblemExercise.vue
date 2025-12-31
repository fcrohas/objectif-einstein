<template>
  <div class="math-problem-exercise">
    <div v-if="loadingError" class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>Impossible de charger les exercices</h3>
      <p>{{ loadingError }}</p>
      <button @click="initExercise" class="btn-primary">🔄 Réessayer</button>
    </div>

    <div v-else-if="problems.length === 0" class="loading-message">
      <div class="loading-icon">⏳</div>
      <p>Chargement des problèmes...</p>
    </div>

    <template v-else>
      <div class="exercise-header">
        <h3>🧮 Problèmes</h3>
        <div class="score">
          Score: {{ correctAnswers }}/{{ problems.length }}
        </div>
      </div>

      <div v-if="!isComplete" class="exercise-content">
        <div class="problem-card">
          <div class="problem-number">
            Problème {{ currentProblemIndex + 1 }}/{{ problems.length }}
          </div>
          
          <div class="problem-text">
            {{ currentProblem.text }}
          </div>

          <div class="problem-question">
            ❓ {{ currentProblem.question }}
          </div>

          <div class="answer-input">
            <input
              v-model="userAnswer"
              type="number"
              step="0.01"
              :disabled="answered"
              @keyup.enter="checkAnswer"
              placeholder="Ta réponse"
              ref="answerInput"
            />
            <span v-if="currentProblem.unit" class="unit">{{ currentProblem.unit }}</span>
          </div>

          <div v-if="feedback" class="feedback" :class="feedbackClass">
            {{ feedback }}
          </div>

          <div v-if="answered && currentProblem.explanation" class="explanation">
            💡 {{ currentProblem.explanation }}
          </div>

          <button 
            v-if="!answered" 
            @click="checkAnswer"
            class="btn-primary"
          >
            Vérifier
          </button>
          
          <button 
            v-else-if="feedbackClass === 'incorrect'" 
            @click="nextProblem"
            class="btn-primary"
          >
            {{ currentProblemIndex < problems.length - 1 ? 'Problème suivant' : 'Terminer' }}
          </button>
        </div>
      </div>

      <div v-else class="exercise-complete">
        <div class="completion-icon">🎉</div>
        <h2>Exercice terminé !</h2>
        <div class="final-score">
          <p>Score final : {{ correctAnswers }}/{{ problems.length }}</p>
          <p class="percentage">{{ percentage }}%</p>
        </div>
        <div class="stars">
          <span v-for="star in stars" :key="star" class="star">⭐</span>
        </div>
        <button @click="restart" class="btn-primary">Recommencer</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { progressStore } from '../utils/progressStore'

const props = defineProps({
  level: {
    type: String,
    required: true
  }
})

const problems = ref([])
const currentProblemIndex = ref(0)
const userAnswer = ref('')
const answered = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const correctAnswers = ref(0)
const isComplete = ref(false)
const answerInput = ref(null)
const loadingError = ref(null)

const currentProblem = computed(() => problems.value[currentProblemIndex.value] || { text: '', question: '', answer: 0 })

const percentage = computed(() => {
  return Math.round((correctAnswers.value / problems.value.length) * 100)
})

const stars = computed(() => {
  if (percentage.value === 100) return 3
  if (percentage.value >= 70) return 2
  if (percentage.value >= 40) return 1
  return 0
})

const loadProblems = async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/objectif-einstein/'
    const url = `${baseUrl}data/math-problems-${props.level}.json`
    console.log('Chargement du fichier:', url)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Problèmes chargés:', data.length)
    return data
  } catch (error) {
    console.error('Erreur de chargement des problèmes:', error)
    return []
  }
}

async function initExercise() {
  try {
    loadingError.value = null
    const loadedProblems = await loadProblems()
    
    if (loadedProblems.length > 0) {
      problems.value = [...loadedProblems]
      shuffleArray(problems.value)
      loadingError.value = null
      await nextTick()
      answerInput.value?.focus()
    } else {
      loadingError.value = `Aucun problème trouvé pour ${props.level}`
    }
  } catch (error) {
    loadingError.value = `Erreur de chargement : ${error.message}`
    console.error('Erreur initExercise:', error)
  }
}

function checkAnswer() {
  if (userAnswer.value === '') return
  
  answered.value = true
  const userNum = parseFloat(userAnswer.value)
  const correctNum = parseFloat(currentProblem.value.answer)
  
  // Tolérance pour les décimales
  const correct = Math.abs(userNum - correctNum) < 0.01
  
  if (correct) {
    correctAnswers.value++
    feedback.value = `✓ Bravo ! C'est la bonne réponse ! 🎉`
    feedbackClass.value = 'correct'
    // Passage automatique après 1.5 secondes
    setTimeout(() => {
      if (answered.value) {
        nextProblem()
      }
    }, 1500)
  } else {
    feedback.value = `✗ La bonne réponse était : ${currentProblem.value.answer} ${currentProblem.value.unit || ''}`
    feedbackClass.value = 'incorrect'
  }
}

function nextProblem() {
  if (currentProblemIndex.value < problems.value.length - 1) {
    currentProblemIndex.value++
    userAnswer.value = ''
    answered.value = false
    feedback.value = ''
    feedbackClass.value = ''
    nextTick(() => {
      answerInput.value?.focus()
    })
  } else {
    completeExercise()
  }
}

function completeExercise() {
  isComplete.value = true
  
  const exerciseId = 'problemes'
  progressStore.recordExercise(
    props.level,
    exerciseId,
    correctAnswers.value,
    problems.value.length
  )
}

function restart() {
  currentProblemIndex.value = 0
  userAnswer.value = ''
  answered.value = false
  feedback.value = ''
  feedbackClass.value = ''
  correctAnswers.value = 0
  isComplete.value = false
  initExercise()
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

onMounted(() => {
  initExercise()
})
</script>

<style scoped>
.math-problem-exercise {
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0.5rem auto;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.exercise-header h3 {
  color: #667eea;
  margin: 0;
  font-size: 1.3rem;
}

.score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.problem-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
}

.problem-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.problem-text {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  border-left: 4px solid #667eea;
}

.problem-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #e8eaf6;
  border-radius: 8px;
}

.answer-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.answer-input input {
  flex: 1;
  padding: 0.8rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.answer-input input:focus {
  outline: none;
  border-color: #667eea;
}

.answer-input input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.unit {
  font-size: 1.1rem;
  font-weight: 500;
  color: #555;
}

.feedback {
  padding: 0.6rem;
  border-radius: 8px;
  margin: 0.5rem 0;
  font-weight: 500;
  text-align: center;
}

.feedback.correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.feedback.incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

.explanation {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 0.8rem;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
  border-left: 3px solid #667eea;
}

.exercise-complete {
  text-align: center;
  padding: 1rem;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: bounce 0.6s;
}

.exercise-complete h2 {
  color: #667eea;
  margin-bottom: 1rem;
}

.final-score p {
  font-size: 1.1rem;
  color: #555;
  margin: 0.3rem 0;
}

.percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stars {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: 500;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.error-message,
.loading-message {
  text-align: center;
  padding: 2rem;
}

.error-icon,
.loading-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message h3 {
  color: #dc3545;
  margin: 0.5rem 0;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@media (max-width: 768px) {
  .math-problem-exercise {
    padding: 0.5rem;
  }

  .problem-text {
    font-size: 1rem;
  }
}
</style>
