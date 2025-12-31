<template>
  <div class="grammar-exercise">
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
        <h3>📝 Grammaire - {{ levelName }}</h3>
        <div class="score">
          Score: {{ correctAnswers }}/{{ questions.length }}
        </div>
      </div>

      <div v-if="!isComplete" class="exercise-content">
        <div class="question-card">
          <div class="question-number">
            Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}
          </div>
          
          <div class="question-category" v-if="currentQuestion.category">
            {{ currentQuestion.category }}
          </div>

          <div class="question-text">
            {{ currentQuestion.question }}
          </div>

          <div class="question-example" v-if="currentQuestion.example">
            <em>{{ currentQuestion.example }}</em>
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

          <div v-if="answered && currentQuestion.explanation" class="explanation">
            💡 {{ currentQuestion.explanation }}
          </div>

          <button 
            v-if="answered && feedbackClass === 'incorrect'" 
            @click="nextQuestion"
            class="btn-primary"
          >
            {{ currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer' }}
          </button>
        </div>
      </div>

      <div v-else class="exercise-complete">
        <div class="completion-icon">🎉</div>
        <h2>Exercice terminé !</h2>
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

const levelName = computed(() => {
  const names = { cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM1', cm2: 'CM2' }
  return names[props.level] || props.level.toUpperCase()
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || { question: '', options: [], answer: '' })
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
    const url = `${baseUrl}data/grammar-${props.level}.json`
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
      // Mélanger l'ordre des questions
      shuffleArray(questions.value)
      // Mélanger les options de chaque question
      questions.value.forEach(question => {
        if (question.options && Array.isArray(question.options)) {
          shuffleArray(question.options)
        }
      })
      loadingError.value = null
    } else {
      loadingError.value = `Aucune question trouvée pour ${props.level}`
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
    // Passage automatique après 1.5 secondes (un peu plus pour lire l'explication)
    setTimeout(() => {
      if (answered.value) {
        nextQuestion()
      }
    }, 1500)
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
  
  const exerciseId = 'grammaire'
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
.grammar-exercise {
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

.exercise-content {
  padding: 0.5rem 0;
}

.question-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
}

.question-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.question-category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #333;
  font-weight: 500;
  line-height: 1.5;
}

.question-example {
  background: #fff8e1;
  padding: 0.6rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border-left: 3px solid #ffc107;
  font-size: 1rem;
  color: #555;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.option-btn {
  padding: 0.8rem;
  font-size: 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.option-btn:not(:disabled):hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-btn.correct-option {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
  font-weight: 500;
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
  font-size: 1.5rem;
}

.final-score {
  margin: 1rem 0;
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

.completion-actions {
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
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

.btn-primary:hover,
.btn-secondary:hover {
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
  .grammar-exercise {
    padding: 0.5rem;
  }

  .exercise-header h3 {
    font-size: 1.1rem;
  }

  .question-text {
    font-size: 1rem;
  }
}
</style>
