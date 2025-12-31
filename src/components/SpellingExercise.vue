<template>
  <div class="spelling-exercise">
    <div class="exercise-header">
      <h3>{{ title }}</h3>
      <div class="score">
        Score: {{ correctAnswers }}/{{ words.length }}
      </div>
    </div>

    <div v-if="!isComplete" class="exercise-content">
      <div class="word-card">
        <div class="question-number">
          Mot {{ currentWordIndex + 1 }}/{{ words.length }}
        </div>
        
        <!-- Image du mot -->
        <div class="word-image">
          {{ currentWord.image }}
        </div>

        <!-- Définition -->
        <div class="word-definition">
          <strong>Définition :</strong>
          <p>{{ currentWord.definition }}</p>
        </div>

        <!-- Son du mot (prononciation) -->
        <div class="word-pronunciation">
          🔊 {{ currentWord.pronunciation }}
        </div>

        <!-- Pour les petits niveaux (CP, CE1) : choix multiple -->
        <div v-if="isMultipleChoice" class="multiple-choice">
          <p class="instruction">Clique sur la bonne orthographe :</p>
          <div class="choice-buttons">
            <button
              v-for="(option, index) in currentWord.options"
              :key="index"
              @click="selectOption(option)"
              :disabled="answered"
              :class="getOptionClass(option)"
              class="choice-btn"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Pour les grands niveaux (CE2, CM1, CM2) : écriture libre -->
        <div v-else class="free-input">
          <p class="instruction">Écris le mot correctement :</p>
          <input
            v-model="userAnswer"
            type="text"
            :disabled="answered"
            @keyup.enter="checkAnswer"
            placeholder="Tape le mot ici..."
            ref="answerInput"
            class="spelling-input"
          />
        </div>

        <div v-if="feedback" class="feedback" :class="feedbackClass">
          {{ feedback }}
        </div>

        <button 
          v-if="!answered && !isMultipleChoice" 
          @click="checkAnswer"
          class="btn-primary"
          :disabled="!userAnswer"
        >
          Vérifier
        </button>
        
        <button 
          v-if="answered" 
          @click="nextWord"
          class="btn-primary"
        >
          {{ currentWordIndex < words.length - 1 ? 'Mot suivant' : 'Terminer' }}
        </button>
      </div>
    </div>

    <div v-else class="exercise-complete">
      <div class="completion-icon">🎉</div>
      <h2>Exercice terminé !</h2>
      <div class="final-score">
        <p>Mots corrects : {{ correctAnswers }}/{{ words.length }}</p>
        <p class="percentage">{{ percentage }}%</p>
      </div>
      <div class="stars">
        <span v-for="star in stars" :key="star" class="star">⭐</span>
      </div>
      
      <div class="completion-actions">
        <button @click="restart" class="btn-secondary">🔄 Recommencer</button>
        <button 
          v-if="showNextButton && percentage === 100" 
          @click="goToNext"
          class="btn-primary btn-next"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { progressStore } from '../utils/progressStore'

// Function to load words data from JSON files
const loadWordsData = async (level, theme = null) => {
  try {
    if (['cp', 'ce1'].includes(level) && theme) {
      // Load JSON file for CP or CE1 with theme
      const response = await fetch(`/objectif-einstein/data/french-${level}.json`)
      const data = await response.json()
      return data[theme] || []
    } else if (['ce2', 'cm1', 'cm2'].includes(level)) {
      // Load JSON file for CE2, CM1, CM2 (returns whole array)
      const response = await fetch(`/objectif-einstein/data/french-${level}.json`)
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Erreur de chargement des données:', error)
    return []
  }
}

const props = defineProps({
  level: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: 'Exercice d\'orthographe'
  },
  showNextButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['exercise-complete', 'next-exercise'])

const words = ref([])
const currentWordIndex = ref(0)
const userAnswer = ref('')
const selectedOption = ref('')
const answered = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const correctAnswers = ref(0)
const isComplete = ref(false)
const answerInput = ref(null)

const currentWord = computed(() => words.value[currentWordIndex.value] || { word: '', definition: '', image: '📝' })
const isMultipleChoice = computed(() => ['cp', 'ce1'].includes(props.level))
const percentage = computed(() => Math.round((correctAnswers.value / words.value.length) * 100))

const stars = computed(() => {
  if (percentage.value === 100) return 3
  if (percentage.value >= 70) return 2
  if (percentage.value >= 40) return 1
  return 0
})

async function initExercise() {
  // Load words from JSON files
  const loadedWords = await loadWordsData(props.level, props.theme)
  
  if (loadedWords.length > 0) {
    words.value = [...loadedWords]
    shuffleArray(words.value)
    
    // Shuffle options for multiple choice as well
    if (isMultipleChoice.value) {
      words.value.forEach(word => {
        if (word.options) {
          shuffleArray(word.options)
        }
      })
    }
  } else {
    console.warn('Aucun mot chargé pour', props.level, props.theme)
  }
}

function selectOption(option) {
  if (answered.value) return
  
  selectedOption.value = option
  answered.value = true
  
  if (option === currentWord.value.word) {
    correctAnswers.value++
    feedback.value = `✓ Bravo ! "${option}" est la bonne orthographe ! 🎉`
    feedbackClass.value = 'correct'
  } else {
    feedback.value = `✗ Pas tout à fait... La bonne orthographe est "${currentWord.value.word}".`
    feedbackClass.value = 'incorrect'
  }
}

function checkAnswer() {
  if (!userAnswer.value) return
  
  answered.value = true
  const userWord = userAnswer.value.trim().toUpperCase()
  const correctWord = currentWord.value.word
  
  if (userWord === correctWord) {
    correctAnswers.value++
    feedback.value = `✓ Excellent ! "${correctWord}" est parfaitement écrit ! 🎉`
    feedbackClass.value = 'correct'
  } else {
    feedback.value = `✗ Ce n'est pas tout à fait ça... Le mot s'écrit "${correctWord}".`
    feedbackClass.value = 'incorrect'
  }
}

function nextWord() {
  if (currentWordIndex.value < words.value.length - 1) {
    currentWordIndex.value++
    userAnswer.value = ''
    selectedOption.value = ''
    answered.value = false
    feedback.value = ''
    feedbackClass.value = ''
    
    if (!isMultipleChoice.value) {
      setTimeout(() => answerInput.value?.focus(), 100)
    }
  } else {
    completeExercise()
  }
}

function completeExercise() {
  isComplete.value = true
  
  const exerciseId = props.theme ? `spelling-${props.theme}` : 'spelling'
  progressStore.recordExercise(
    props.level,
    exerciseId,
    correctAnswers.value,
    words.value.length
  )
  
  // Emit completion event
  emit('exercise-complete')
}

function restart() {
  currentWordIndex.value = 0
  userAnswer.value = ''
  selectedOption.value = ''
  answered.value = false
  feedback.value = ''
  feedbackClass.value = ''
  correctAnswers.value = 0
  isComplete.value = false
  initExercise()
}

function goToNext() {
  emit('next-exercise')
}

function getOptionClass(option) {
  if (!answered.value) return ''
  if (option === currentWord.value.word) return 'correct-option'
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
  if (!isMultipleChoice.value) {
    setTimeout(() => answerInput.value?.focus(), 100)
  }
})

watch(currentWordIndex, () => {
  if (!isMultipleChoice.value) {
    setTimeout(() => answerInput.value?.focus(), 100)
  }
})
</script>

<style scoped>
.spelling-exercise {
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

.word-card {
  text-align: center;
}

.question-number {
  color: #999;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.word-image {
  font-size: 3.5rem;
  margin: 0.5rem 0;
  animation: fadeIn 0.5s;
}

.word-definition {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 0.5rem;
  border-radius: 8px;
  margin: 0.5rem 0;
  text-align: left;
}

.word-definition strong {
  color: #667eea;
  font-size: 0.95rem;
}

.word-definition p {
  margin: 0.25rem 0 0 0;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.4;
}

.word-pronunciation {
  color: #667eea;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  margin: 0.5rem 0;
  font-style: italic;
}

.instruction {
  font-size: 1rem;
  color: #333;
  margin: 0.5rem 0;
  font-weight: 500;
}

.multiple-choice {
  margin: 0.5rem 0;
}

.choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
}

.choice-btn {
  padding: 0.75rem 1.25rem;
  font-size: 1.1rem;
  font-weight: bold;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05rem;
}

.choice-btn:hover:not(:disabled) {
  background: #667eea15;
  transform: translateX(5px);
}

.choice-btn:disabled {
  cursor: not-allowed;
}

.choice-btn.correct-option {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.choice-btn.incorrect-option {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.choice-btn.disabled-option {
  opacity: 0.5;
}

.free-input {
  margin: 0.5rem 0;
}

.spelling-input {
  width: 100%;
  max-width: 400px;
  font-size: 1.3rem;
  padding: 0.6rem;
  text-align: center;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05rem;
  font-weight: bold;
  text-transform: uppercase;
}

.spelling-input:focus {
  outline: none;
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.spelling-input:disabled {
  background-color: #f5f5f5;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: 600;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #667eea15;
}

.btn-next {
  animation: pulseNext 2s ease-in-out infinite;
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.4);
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.btn-next:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 24px rgba(40, 167, 69, 0.5);
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

@keyframes pulseNext {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
