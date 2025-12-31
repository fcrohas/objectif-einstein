<template>
  <div class="qcm-exercise">
    <div v-if="loadingError" class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>Impossible de charger les exercices</h3>
      <p>{{ loadingError }}</p>
      <button @click="initExercise" class="btn-primary">🔄 Réessayer</button>
    </div>

    <div v-else-if="questions.length === 0" class="loading-message">
      <div class="loading-icon">⏳</div>
      <p>Chargement des questions...</p>
    </div>

    <template v-else>
      <div class="exercise-header">
        <h3>{{ title }}</h3>
        <div class="score">
          Score: {{ correctAnswers }}/{{ questions.length }}
        </div>
      </div>

      <div v-if="!isComplete" class="exercise-content">
        <div class="question-card">
          <div class="question-number">
            Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}
          </div>
          
          <div class="question-image">
            {{ currentQuestion.image }}
          </div>

          <div class="question-text">
            {{ currentQuestion.question }}
          </div>

          <div class="options">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              @click="selectOption(option)"
              :disabled="answered"
              :class="getOptionClass(option)"
              class="option-btn"
            >
              {{ option }}
            </button>
          </div>

          <div v-if="feedback" class="feedback" :class="feedbackClass">
            {{ feedback }}
          </div>
        </div>
      </div>

      <div v-else class="exercise-complete">
        <div class="completion-icon">🎉</div>
        <h2>Quiz terminé !</h2>
        <div class="final-score">
          <p>Bonnes réponses : {{ correctAnswers }}/{{ questions.length }}</p>
          <p class="percentage">{{ percentage }}%</p>
        </div>
        <div class="stars">
          <span v-for="star in stars" :key="star" class="star">⭐</span>
        </div>
        
        <div class="completion-actions">
          <button @click="restart" class="btn-secondary">🔄 Recommencer</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { progressStore } from '../utils/progressStore'

const props = defineProps({
  level: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true // 'history' or 'geography'
  },
  title: {
    type: String,
    default: 'Quiz'
  }
})

const questions = ref([])
const currentQuestionIndex = ref(0)
const selectedOption = ref('')
const answered = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const correctAnswers = ref(0)
const isComplete = ref(false)
const loadingError = ref(null)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || { question: '', options: [], answer: '', image: '❓' })
const percentage = computed(() => Math.round((correctAnswers.value / questions.value.length) * 100))

const stars = computed(() => {
  if (percentage.value === 100) return 3
  if (percentage.value >= 70) return 2
  if (percentage.value >= 40) return 1
  return 0
})

const loadQuestions = async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/objectif-einstein/'
    const url = `${baseUrl}data/${props.subject}-${props.level}.json`
    console.log('Chargement du fichier:', url)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Questions chargées:', data.length)
    return data
  } catch (error) {
    console.error('Erreur de chargement des questions:', error)
    return []
  }
}

async function initExercise() {
  try {
    loadingError.value = null
    const loadedQuestions = await loadQuestions()
    
    if (loadedQuestions.length > 0) {
      questions.value = [...loadedQuestions]
      shuffleArray(questions.value)
      loadingError.value = null
    } else {
      loadingError.value = `Aucune question trouvée pour ${props.level} ${props.subject}`
    }
  } catch (error) {
    loadingError.value = `Erreur de chargement : ${error.message}`
    console.error('Erreur initExercise:', error)
  }
}

function selectOption(option) {
  if (answered.value) return
  
  selectedOption.value = option
  answered.value = true
  
  if (option === currentQuestion.value.answer) {
    correctAnswers.value++
    feedback.value = `✓ Bravo ! C'est la bonne réponse ! 🎉`
    feedbackClass.value = 'correct'
    // Passage automatique après 1 seconde
    setTimeout(() => {
      if (answered.value) {
        nextQuestion()
      }
    }, 1000)
  } else {
    feedback.value = `✗ La bonne réponse était : ${currentQuestion.value.answer}`
    feedbackClass.value = 'incorrect'
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    selectedOption.value = ''
    answered.value = false
    feedback.value = ''
    feedbackClass.value = ''
  } else {
    completeExercise()
  }
}

function completeExercise() {
  isComplete.value = true
  
  const exerciseId = `${props.subject}`
  progressStore.recordExercise(
    props.level,
    exerciseId,
    correctAnswers.value,
    questions.value.length
  )
}

function restart() {
  currentQuestionIndex.value = 0
  selectedOption.value = ''
  answered.value = false
  feedback.value = ''
  feedbackClass.value = ''
  correctAnswers.value = 0
  isComplete.value = false
  initExercise()
}

function getOptionClass(option) {
  if (!answered.value) return ''
  if (option === currentQuestion.value.answer) return 'correct-option'
  if (option === selectedOption.value) return 'incorrect-option'
  return 'disabled-option'
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
.qcm-exercise {
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 700px;
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
  font-size: 1.1rem;
}

.score {
  font-weight: bold;
  color: #667eea;
  font-size: 1rem;
}

.question-card {
  text-align: center;
}

.question-number {
  color: #999;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.question-image {
  font-size: 3.5rem;
  margin: 0.5rem 0;
}

.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 8px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.option-btn {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  text-align: left;
}

.option-btn:hover:not(:disabled) {
  background: #667eea15;
  transform: translateX(5px);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-btn.correct-option {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.option-btn.incorrect-option {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.option-btn.disabled-option {
  opacity: 0.5;
}

.feedback {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
}

.feedback.correct {
  background-color: #d4edda;
  color: #155724;
}

.feedback.incorrect {
  background-color: #f8d7da;
  color: #721c24;
}

.exercise-complete {
  text-align: center;
  padding: 0.5rem 0;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.exercise-complete h2 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.final-score p {
  font-size: 1.1rem;
  margin: 0.25rem 0;
  color: #333;
}

.percentage {
  font-size: 2rem !important;
  font-weight: bold;
  color: #667eea;
}

.stars {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.star {
  margin: 0 0.25rem;
  animation: starPop 0.5s ease-out;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea15;
}

.error-message, .loading-message {
  text-align: center;
  padding: 2rem;
}

.error-icon, .loading-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-message h3 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-message p {
  color: #666;
  margin-bottom: 1.5rem;
}

.loading-message p {
  color: #667eea;
  font-size: 1.2rem;
}

@keyframes starPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
