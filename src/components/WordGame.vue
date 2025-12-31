<template>
  <div class="word-game">
    <div class="game-header">
      <h3>{{ title }}</h3>
      <div class="score">Score: {{ score }}</div>
    </div>

    <div v-if="!isComplete" class="game-content">
      <div class="word-card">
        <div class="word-prompt">
          <p class="instruction">{{ currentWord.prompt }}</p>
          <div class="scrambled-word">
            {{ scrambledLetters.join(' ') }}
          </div>
        </div>

        <div class="answer-zone">
          <div class="letter-slots">
            <div
              v-for="(letter, index) in answer"
              :key="index"
              class="letter-slot"
              :class="{ filled: letter }"
            >
              {{ letter || '_' }}
            </div>
          </div>
        </div>

        <div class="available-letters">
          <button
            v-for="(letter, index) in availableLetters"
            :key="index"
            class="letter-btn"
            :disabled="!letter"
            @click="selectLetter(index)"
          >
            {{ letter || '' }}
          </button>
        </div>

        <div class="game-actions">
          <button @click="clearAnswer" class="btn-secondary">
            🔄 Effacer
          </button>
          <button @click="checkWord" class="btn-primary" :disabled="!isAnswerComplete">
            ✓ Vérifier
          </button>
        </div>

        <div v-if="feedback" class="feedback" :class="feedbackClass">
          {{ feedback }}
        </div>
      </div>
    </div>

    <div v-else class="game-complete">
      <div class="completion-icon">🏆</div>
      <h2>Jeu terminé !</h2>
      <div class="final-score">
        <p>Mots trouvés : {{ correctWords }}/{{ totalWords }}</p>
        <p class="score-big">{{ score }} points</p>
      </div>
      <button @click="restart" class="btn-primary">Rejouer</button>
    </div>
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
  title: {
    type: String,
    default: 'Jeu des mots mélangés'
  }
})

const words = ref([])
const currentWordIndex = ref(0)
const answer = ref([])
const availableLetters = ref([])
const scrambledLetters = ref([])
const feedback = ref('')
const feedbackClass = ref('')
const score = ref(0)
const correctWords = ref(0)
const isComplete = ref(false)

const currentWord = computed(() => words.value[currentWordIndex.value] || { word: '', prompt: '' })
const totalWords = computed(() => words.value.length)
const isAnswerComplete = computed(() => answer.value.every(l => l !== null))

// Listes de mots par niveau
const wordsByLevel = {
  cp: [
    { word: 'CHAT', prompt: 'Animal qui miaule' },
    { word: 'MAISON', prompt: 'Endroit où on habite' },
    { word: 'SOLEIL', prompt: 'Brille dans le ciel' },
    { word: 'LUNE', prompt: 'Brille la nuit' },
    { word: 'FLEUR', prompt: 'Belle et parfumée' },
    { word: 'ARBRE', prompt: 'A des feuilles et des branches' },
    { word: 'OISEAU', prompt: 'Animal qui vole' },
    { word: 'ECOLE', prompt: 'On y apprend' }
  ],
  ce1: [
    { word: 'PAPILLON', prompt: 'Insecte avec de jolies ailes' },
    { word: 'CARTABLE', prompt: 'Pour ranger les cahiers' },
    { word: 'CHOCOLAT', prompt: 'Délicieux et sucré' },
    { word: 'ELEPHANT', prompt: 'Grand animal avec une trompe' },
    { word: 'JARDIN', prompt: 'Espace avec des plantes' },
    { word: 'BALLON', prompt: 'Pour jouer au foot' },
    { word: 'MUSIQUE', prompt: 'On l\'écoute avec les oreilles' },
    { word: 'HISTOIRE', prompt: 'Un conte ou un récit' }
  ],
  ce2: [
    { word: 'CROCODILE', prompt: 'Reptile des rivières' },
    { word: 'ORDINATEUR', prompt: 'Machine pour travailler' },
    { word: 'BIBLIOTHEQUE', prompt: 'Lieu rempli de livres' },
    { word: 'MONTAGNE', prompt: 'Très haute et enneigée' },
    { word: 'DINOSAURE', prompt: 'Animal préhistorique' },
    { word: 'TELEPHONE', prompt: 'Pour appeler quelqu\'un' },
    { word: 'AVENTURE', prompt: 'Voyage plein de surprises' },
    { word: 'CHATEAU', prompt: 'Demeure royale' }
  ],
  cm1: [
    { word: 'ASTRONOMIE', prompt: 'Science des étoiles' },
    { word: 'GEOGRAPHIE', prompt: 'Étude de la Terre' },
    { word: 'VOCABULARY', prompt: 'Ensemble de mots' },
    { word: 'REVOLUTION', prompt: 'Grand changement' },
    { word: 'MYSTERE', prompt: 'Quelque chose d\'inexpliqué' },
    { word: 'ENCYCLOPEDIE', prompt: 'Livre de connaissances' },
    { word: 'ARCHITECTURE', prompt: 'Art de construire' },
    { word: 'NAVIGATION', prompt: 'Art de voyager en mer' }
  ],
  cm2: [
    { word: 'EXTRAORDINAIRE', prompt: 'Hors du commun' },
    { word: 'RESPONSABILITE', prompt: 'Devoir de répondre de ses actes' },
    { word: 'CONNAISSANCE', prompt: 'Ce qu\'on sait' },
    { word: 'DEMOCRATIE', prompt: 'Pouvoir du peuple' },
    { word: 'ENVIRONNEMENT', prompt: 'Ce qui nous entoure' },
    { word: 'IMAGINATION', prompt: 'Capacité de créer' },
    { word: 'CONSTITUTION', prompt: 'Loi fondamentale' },
    { word: 'TECHNOLOGIE', prompt: 'Science appliquée' }
  ]
}

function initGame() {
  words.value = [...wordsByLevel[props.level] || wordsByLevel.cp]
  shuffleArray(words.value)
  loadWord()
}

function loadWord() {
  if (currentWordIndex.value >= words.value.length) {
    completeGame()
    return
  }

  const word = currentWord.value.word
  answer.value = new Array(word.length).fill(null)
  
  // Mélanger les lettres
  scrambledLetters.value = word.split('')
  availableLetters.value = [...scrambledLetters.value]
  shuffleArray(availableLetters.value)
  
  feedback.value = ''
  feedbackClass.value = ''
}

function selectLetter(index) {
  if (!availableLetters.value[index]) return
  
  const letter = availableLetters.value[index]
  const emptySlot = answer.value.findIndex(l => l === null)
  
  if (emptySlot !== -1) {
    answer.value[emptySlot] = letter
    availableLetters.value[index] = null
  }
}

function clearAnswer() {
  availableLetters.value = [...scrambledLetters.value]
  shuffleArray(availableLetters.value)
  answer.value = new Array(currentWord.value.word.length).fill(null)
  feedback.value = ''
}

function checkWord() {
  const userWord = answer.value.join('')
  const correctWord = currentWord.value.word
  
  if (userWord === correctWord) {
    correctWords.value++
    score.value += correctWord.length * 10
    feedback.value = '🎉 Bravo ! C\'est le bon mot !'
    feedbackClass.value = 'correct'
    
    setTimeout(() => {
      currentWordIndex.value++
      loadWord()
    }, 2000)
  } else {
    feedback.value = '❌ Ce n\'est pas le bon mot, essaie encore !'
    feedbackClass.value = 'incorrect'
    
    setTimeout(() => {
      clearAnswer()
    }, 1500)
  }
}

function completeGame() {
  isComplete.value = true
  
  // Enregistrer la progression
  progressStore.recordExercise(
    props.level,
    'word-game',
    correctWords.value,
    totalWords.value
  )
}

function restart() {
  currentWordIndex.value = 0
  score.value = 0
  correctWords.value = 0
  isComplete.value = false
  initGame()
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

onMounted(() => {
  initGame()
})
</script>

<style scoped>
.word-game {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: 2rem auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.game-header h3 {
  color: #667eea;
  margin: 0;
  font-size: 1.5rem;
}

.score {
  font-weight: bold;
  color: #667eea;
  font-size: 1.5rem;
}

.word-card {
  text-align: center;
}

.instruction {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.scrambled-word {
  font-size: 1.8rem;
  color: #999;
  letter-spacing: 0.5rem;
  margin: 1.5rem 0;
  font-family: 'Courier New', monospace;
}

.answer-zone {
  margin: 2rem 0;
}

.letter-slots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.letter-slot {
  width: 50px;
  height: 60px;
  border: 3px solid #667eea;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  background: white;
  font-family: 'Courier New', monospace;
}

.letter-slot.filled {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.available-letters {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 2rem 0;
}

.letter-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
}

.letter-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.letter-btn:disabled {
  opacity: 0;
  cursor: not-allowed;
}

.game-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea15;
}

.feedback {
  margin-top: 1.5rem;
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

.game-complete {
  text-align: center;
  padding: 2rem 0;
}

.completion-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.game-complete h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
}

.final-score p {
  font-size: 1.3rem;
  margin: 1rem 0;
  color: #333;
}

.score-big {
  font-size: 3rem !important;
  font-weight: bold;
  color: #667eea;
}
</style>
