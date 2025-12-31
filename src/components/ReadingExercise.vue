<template>
  <div class="reading-exercise">
    <div v-if="loadingError" class="error-message">
      <div class="error-icon">⚠️</div>
      <h3>Impossible de charger l'exercice</h3>
      <p>{{ loadingError }}</p>
      <button @click="initExercise" class="btn-primary">🔄 Réessayer</button>
    </div>

    <div v-else-if="!exercise" class="loading-message">
      <div class="loading-icon">⏳</div>
      <p>Chargement de l'exercice...</p>
    </div>

    <template v-else>
      <div class="exercise-header">
        <h3>📖 Lecture Fluide</h3>
        <div class="score" v-if="phase === 'questions'">
          Score: {{ correctAnswers }}/{{ exercise.questions.length }}
        </div>
      </div>

      <!-- Phase 1: Instructions -->
      <div v-if="phase === 'instructions'" class="instructions-phase">
        <div class="instruction-card">
          <h3>📚 Prêt à lire ?</h3>
          <p>Tu vas lire un texte. Lis-le attentivement !</p>
          <p>Quand tu as fini de lire, clique sur le bouton "J'ai terminé".</p>
          <p>Ensuite, tu devras répondre à des questions sur le texte.</p>
          <button @click="startReading" class="btn-primary btn-large">
            🚀 Commencer la lecture
          </button>
        </div>
      </div>

      <!-- Phase 2: Lecture du texte -->
      <div v-if="phase === 'reading'" class="reading-phase">
        <div class="text-card">
          <h4>{{ exercise.title }}</h4>
          <div class="reading-text">
            <p v-for="(paragraph, index) in exercise.text" :key="index">
              {{ paragraph }}
            </p>
          </div>
          <div class="reading-actions">
            <div class="timer">
              ⏱️ {{ formattedTime }}
            </div>
            <button @click="finishReading" class="btn-primary">
              ✓ J'ai terminé de lire
            </button>
          </div>
        </div>
      </div>

      <!-- Phase 3: Questions de compréhension -->
      <div v-if="phase === 'questions'" class="questions-phase">
        <div v-if="!questionsComplete" class="question-card">
          <div class="question-number">
            Question {{ currentQuestionIndex + 1 }}/{{ exercise.questions.length }}
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

          <button 
            v-if="answered && feedbackClass === 'incorrect'" 
            @click="nextQuestion"
            class="btn-primary"
          >
            {{ currentQuestionIndex < exercise.questions.length - 1 ? 'Question suivante' : 'Voir les résultats' }}
          </button>
        </div>

        <!-- Phase 4: Résultats -->
        <div v-else class="results-card">
          <div class="completion-icon">🎉</div>
          <h2>Lecture terminée !</h2>
          
          <div class="reading-stats">
            <div class="stat-item">
              <div class="stat-label">⏱️ Temps de lecture</div>
              <div class="stat-value">{{ formattedReadingTime }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">📖 Vitesse</div>
              <div class="stat-value">{{ wordsPerMinute }} mots/min</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">✓ Compréhension</div>
              <div class="stat-value">{{ percentage }}%</div>
            </div>
          </div>

          <div class="final-score">
            <p>Bonnes réponses : {{ correctAnswers }}/{{ exercise.questions.length }}</p>
          </div>

          <div class="stars">
            <span v-for="star in stars" :key="star" class="star">⭐</span>
          </div>

          <div class="reading-feedback">
            <p v-if="wordsPerMinute >= expectedSpeed * 1.2">
              🚀 Excellente vitesse de lecture !
            </p>
            <p v-else-if="wordsPerMinute >= expectedSpeed">
              👍 Bonne vitesse de lecture !
            </p>
            <p v-else>
              💪 Continue de t'entraîner, tu vas progresser !
            </p>
          </div>

          <button @click="restart" class="btn-primary">🔄 Recommencer</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { progressStore } from '../utils/progressStore'

const props = defineProps({
  level: {
    type: String,
    required: true
  }
})

const exercise = ref(null)
const phase = ref('instructions') // 'instructions', 'reading', 'questions'
const readingStartTime = ref(0)
const readingEndTime = ref(0)
const elapsedTime = ref(0)
const timerInterval = ref(null)

const currentQuestionIndex = ref(0)
const selectedOption = ref('')
const answered = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const correctAnswers = ref(0)
const questionsComplete = ref(false)
const loadingError = ref(null)

const currentQuestion = computed(() => exercise.value?.questions[currentQuestionIndex.value] || { question: '', options: [], answer: '' })

const percentage = computed(() => {
  if (!exercise.value?.questions.length) return 0
  return Math.round((correctAnswers.value / exercise.value.questions.length) * 100)
})

const stars = computed(() => {
  if (percentage.value === 100) return 3
  if (percentage.value >= 70) return 2
  if (percentage.value >= 40) return 1
  return 0
})

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60)
  const seconds = elapsedTime.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const formattedReadingTime = computed(() => {
  if (!readingEndTime.value) return '0:00'
  const duration = Math.floor((readingEndTime.value - readingStartTime.value) / 1000)
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const wordsPerMinute = computed(() => {
  if (!exercise.value || !readingEndTime.value) return 0
  const duration = (readingEndTime.value - readingStartTime.value) / 1000 / 60 // en minutes
  if (duration === 0) return 0
  return Math.round(exercise.value.wordCount / duration)
})

// Vitesse attendue selon le niveau (mots par minute)
const expectedSpeed = computed(() => {
  const speeds = {
    cp: 30,
    ce1: 50,
    ce2: 80,
    cm1: 100,
    cm2: 120
  }
  return speeds[props.level] || 50
})

const loadExercise = async () => {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/objectif-einstein/'
    const url = `${baseUrl}data/reading-${props.level}.json`
    console.log('Chargement du fichier:', url)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log('Exercice chargé:', data)
    
    // Mélanger les options de chaque question
    data.questions.forEach(question => {
      if (question.options && Array.isArray(question.options)) {
        shuffleArray(question.options)
      }
    })
    
    return data
  } catch (error) {
    console.error('Erreur de chargement de l\'exercice:', error)
    return null
  }
}

async function initExercise() {
  try {
    loadingError.value = null
    const loadedExercise = await loadExercise()
    
    if (loadedExercise) {
      exercise.value = loadedExercise
      loadingError.value = null
    } else {
      loadingError.value = `Aucun exercice trouvé pour le niveau ${props.level}`
    }
  } catch (error) {
    loadingError.value = `Erreur de chargement : ${error.message}`
    console.error('Erreur initExercise:', error)
  }
}

function startReading() {
  phase.value = 'reading'
  readingStartTime.value = Date.now()
  elapsedTime.value = 0
  
  // Démarrer le chronomètre
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - readingStartTime.value) / 1000)
  }, 1000)
}

function finishReading() {
  readingEndTime.value = Date.now()
  
  // Arrêter le chronomètre
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  phase.value = 'questions'
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
  if (currentQuestionIndex.value < exercise.value.questions.length - 1) {
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
  questionsComplete.value = true
  
  const exerciseId = 'lecture-fluide'
  progressStore.recordExercise(
    props.level,
    exerciseId,
    correctAnswers.value,
    exercise.value.questions.length
  )
}

function restart() {
  phase.value = 'instructions'
  readingStartTime.value = 0
  readingEndTime.value = 0
  elapsedTime.value = 0
  currentQuestionIndex.value = 0
  selectedOption.value = ''
  answered.value = false
  feedback.value = ''
  feedbackClass.value = ''
  correctAnswers.value = 0
  questionsComplete.value = false
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
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

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.reading-exercise {
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

/* Instructions Phase */
.instruction-card {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
}

.instruction-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.instruction-card p {
  font-size: 1rem;
  margin: 0.5rem 0;
  color: #555;
}

.btn-large {
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  margin-top: 1rem;
}

/* Reading Phase */
.text-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
}

.text-card h4 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-align: center;
}

.reading-text {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  line-height: 1.8;
  font-size: 1.1rem;
  max-height: 400px;
  overflow-y: auto;
}

.reading-text p {
  margin-bottom: 1rem;
  text-align: justify;
}

.reading-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.timer {
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Questions Phase */
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
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
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

/* Results Phase */
.results-card {
  text-align: center;
  padding: 1rem;
}

.completion-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: bounce 0.6s;
}

.results-card h2 {
  color: #667eea;
  margin-bottom: 1rem;
}

.reading-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.stat-item {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 1rem;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
}

.final-score {
  margin: 1rem 0;
}

.final-score p {
  font-size: 1.1rem;
  color: #555;
  margin: 0.3rem 0;
}

.stars {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.reading-feedback {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 0.8rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 1rem;
  color: #555;
  font-weight: 500;
}

/* Common */
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
  .reading-exercise {
    padding: 0.5rem;
  }

  .exercise-header h3 {
    font-size: 1.1rem;
  }

  .reading-text {
    font-size: 1rem;
    line-height: 1.6;
  }

  .reading-stats {
    grid-template-columns: 1fr;
  }
}
</style>
