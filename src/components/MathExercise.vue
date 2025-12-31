<template>
  <div class="math-exercise">
    <div class="exercise-header">
      <h3>{{ title }}</h3>
      <div class="score">
        Score: {{ correctAnswers }}/{{ questions.length }}
      </div>
    </div>

    <div v-if="!isComplete" class="exercise-content">
      <div class="question-card">
        <div class="question-number">
          Question {{ currentQuestion + 1 }}/{{ questions.length }}
        </div>
        
        <div class="question">
          {{ questions[currentQuestion].question }}
        </div>

        <div class="answer-input">
          <input
            v-model="userAnswer"
            type="number"
            :disabled="answered"
            @keyup.enter="checkAnswer"
            placeholder="Votre réponse"
            ref="answerInput"
          />
        </div>

        <div v-if="feedback" class="feedback" :class="feedbackClass">
          {{ feedback }}
        </div>

        <button 
          v-if="!answered" 
          @click="checkAnswer"
          class="btn-primary"
        >
          Vérifier
        </button>
        
        <button 
          v-else 
          @click="nextQuestion"
          class="btn-primary"
        >
          {{ currentQuestion < questions.length - 1 ? 'Question suivante' : 'Terminer' }}
        </button>
      </div>
    </div>

    <div v-else class="exercise-complete">
      <div class="completion-icon">🎉</div>
      <h2>Exercice terminé !</h2>
      <div class="final-score">
        <p>Score final : {{ correctAnswers }}/{{ questions.length }}</p>
        <p class="percentage">{{ percentage }}%</p>
      </div>
      <div class="stars">
        <span v-for="star in stars" :key="star" class="star">⭐</span>
      </div>
      <button @click="restart" class="btn-primary">Recommencer</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { progressStore } from '../utils/progressStore'

const props = defineProps({
  level: {
    type: String,
    required: true
  },
  exerciseType: {
    type: String,
    default: 'addition'
  },
  title: {
    type: String,
    default: 'Exercice de mathématiques'
  }
})

const questions = ref([])
const currentQuestion = ref(0)
const userAnswer = ref('')
const answered = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const correctAnswers = ref(0)
const isComplete = ref(false)
const answerInput = ref(null)

const percentage = computed(() => {
  return Math.round((correctAnswers.value / questions.value.length) * 100)
})

const stars = computed(() => {
  if (percentage.value === 100) return 3
  if (percentage.value >= 70) return 2
  if (percentage.value >= 40) return 1
  return 0
})

// Générer des questions selon le niveau et le type
function generateQuestions() {
  const count = 10
  const generated = []
  
  const config = getConfigForLevel(props.level, props.exerciseType)
  
  for (let i = 0; i < count; i++) {
    generated.push(generateQuestion(config))
  }
  
  questions.value = generated
}

function getConfigForLevel(level, type) {
  const configs = {
    cp: {
      addition: { max: 10, min: 0 },
      soustraction: { max: 10, min: 0 }
    },
    ce1: {
      addition: { max: 50, min: 0 },
      soustraction: { max: 50, min: 0 },
      multiplication: { max: 5, min: 1 }
    },
    ce2: {
      addition: { max: 100, min: 0 },
      soustraction: { max: 100, min: 0 },
      multiplication: { max: 10, min: 1 }
    },
    cm1: {
      addition: { max: 1000, min: 0 },
      soustraction: { max: 1000, min: 0 },
      multiplication: { max: 12, min: 1 },
      division: { max: 100, min: 10 }
    },
    cm2: {
      addition: { max: 10000, min: 0 },
      soustraction: { max: 10000, min: 0 },
      multiplication: { max: 15, min: 1 },
      division: { max: 144, min: 10 }
    }
  }
  
  return configs[level]?.[type] || configs.cp.addition
}

function generateQuestion(config) {
  const a = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
  const b = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min
  
  let question, answer
  
  switch (props.exerciseType) {
    case 'addition':
      question = `${a} + ${b} = ?`
      answer = a + b
      break
    case 'soustraction':
      // S'assurer que le résultat est positif
      const larger = Math.max(a, b)
      const smaller = Math.min(a, b)
      question = `${larger} - ${smaller} = ?`
      answer = larger - smaller
      break
    case 'multiplication':
      question = `${a} × ${b} = ?`
      answer = a * b
      break
    case 'division':
      // S'assurer d'une division exacte
      const divisor = Math.floor(Math.random() * 9) + 2
      const quotient = Math.floor(Math.random() * 10) + 1
      const dividend = divisor * quotient
      question = `${dividend} ÷ ${divisor} = ?`
      answer = quotient
      break
    default:
      question = `${a} + ${b} = ?`
      answer = a + b
  }
  
  return { question, answer }
}

function checkAnswer() {
  if (userAnswer.value === '') return
  
  answered.value = true
  const correct = parseInt(userAnswer.value) === questions.value[currentQuestion.value].answer
  
  if (correct) {
    correctAnswers.value++
    feedback.value = '✓ Bravo ! C\'est correct ! 🎉'
    feedbackClass.value = 'correct'
  } else {
    feedback.value = `✗ Pas tout à fait... La bonne réponse était ${questions.value[currentQuestion.value].answer}`
    feedbackClass.value = 'incorrect'
  }
}

function nextQuestion() {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
    userAnswer.value = ''
    answered.value = false
    feedback.value = ''
    feedbackClass.value = ''
    
    // Focus sur l'input
    setTimeout(() => {
      answerInput.value?.focus()
    }, 100)
  } else {
    completeExercise()
  }
}

function completeExercise() {
  isComplete.value = true
  
  // Enregistrer la progression
  const exerciseId = `math-${props.exerciseType}`
  progressStore.recordExercise(
    props.level,
    exerciseId,
    correctAnswers.value,
    questions.value.length
  )
}

function restart() {
  currentQuestion.value = 0
  userAnswer.value = ''
  answered.value = false
  feedback.value = ''
  feedbackClass.value = ''
  correctAnswers.value = 0
  isComplete.value = false
  generateQuestions()
}

onMounted(() => {
  generateQuestions()
  setTimeout(() => {
    answerInput.value?.focus()
  }, 100)
})

watch(currentQuestion, () => {
  setTimeout(() => {
    answerInput.value?.focus()
  }, 100)
})
</script>

<style scoped>
.math-exercise {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.exercise-header h3 {
  color: #667eea;
  margin: 0;
  font-size: 1.5rem;
}

.score {
  font-weight: bold;
  color: #667eea;
  font-size: 1.2rem;
}

.question-card {
  text-align: center;
}

.question-number {
  color: #999;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.question {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 2rem 0;
  font-family: 'Courier New', monospace;
}

.answer-input {
  margin: 2rem 0;
}

.answer-input input {
  width: 200px;
  font-size: 2rem;
  padding: 1rem;
  text-align: center;
  border: 3px solid #667eea;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
}

.answer-input input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.answer-input input:disabled {
  background-color: #f5f5f5;
}

.feedback {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1.1rem;
}

.feedback.correct {
  background-color: #d4edda;
  color: #155724;
}

.feedback.incorrect {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.exercise-complete {
  text-align: center;
  padding: 2rem 0;
}

.completion-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.exercise-complete h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
}

.final-score {
  margin: 2rem 0;
}

.final-score p {
  font-size: 1.3rem;
  margin: 0.5rem 0;
  color: #333;
}

.percentage {
  font-size: 3rem !important;
  font-weight: bold;
  color: #667eea;
}

.stars {
  font-size: 3rem;
  margin: 2rem 0;
}

.star {
  margin: 0 0.25rem;
  animation: starPop 0.5s ease-out;
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
