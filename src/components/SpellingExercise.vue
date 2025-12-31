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
  title: {
    type: String,
    default: 'Exercice d\'orthographe'
  }
})

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

// Base de données de mots par niveau
const wordDatabase = {
  cp: [
    { 
      word: 'CHAT', 
      image: '🐱', 
      definition: 'Petit animal domestique qui miaule et ronronne',
      pronunciation: '/cha/',
      options: ['CHAT', 'CHA', 'SHAT']
    },
    { 
      word: 'MAISON', 
      image: '🏠', 
      definition: 'Endroit où on habite avec sa famille',
      pronunciation: '/mè-zon/',
      options: ['MAISON', 'MEZON', 'MAZON']
    },
    { 
      word: 'SOLEIL', 
      image: '☀️', 
      definition: 'Étoile qui brille dans le ciel et nous donne de la lumière',
      pronunciation: '/so-lèy/',
      options: ['SOLEIL', 'SOLEL', 'SOLEY']
    },
    { 
      word: 'ÉCOLE', 
      image: '🏫', 
      definition: 'Lieu où les enfants vont pour apprendre',
      pronunciation: '/é-kol/',
      options: ['ÉCOLE', 'ECOLE', 'EKOL']
    },
    { 
      word: 'FLEUR', 
      image: '🌸', 
      definition: 'Plante colorée et parfumée qui pousse dans les jardins',
      pronunciation: '/fleur/',
      options: ['FLEUR', 'FLEURE', 'FLUR']
    },
    { 
      word: 'PAIN', 
      image: '🍞', 
      definition: 'Aliment fait avec de la farine qu\'on mange tous les jours',
      pronunciation: '/pin/',
      options: ['PAIN', 'PIN', 'PEIN']
    },
    { 
      word: 'LUNE', 
      image: '🌙', 
      definition: 'Astre qui brille dans le ciel la nuit',
      pronunciation: '/lune/',
      options: ['LUNE', 'LHUNE', 'LUNNE']
    },
    { 
      word: 'ARBRE', 
      image: '🌳', 
      definition: 'Grande plante avec un tronc, des branches et des feuilles',
      pronunciation: '/arbre/',
      options: ['ARBRE', 'ABRE', 'ARBE']
    }
  ],
  ce1: [
    { 
      word: 'PAPILLON', 
      image: '🦋', 
      definition: 'Insecte avec de belles ailes colorées qui vole de fleur en fleur',
      pronunciation: '/pa-pi-yon/',
      options: ['PAPILLON', 'PAPION', 'PAPIYON']
    },
    { 
      word: 'BALLON', 
      image: '⚽', 
      definition: 'Objet rond qui sert à jouer au football ou au basket',
      pronunciation: '/ba-lon/',
      options: ['BALLON', 'BALON', 'BALONS']
    },
    { 
      word: 'CHOCOLAT', 
      image: '🍫', 
      definition: 'Friandise sucrée et délicieuse faite avec du cacao',
      pronunciation: '/cho-ko-la/',
      options: ['CHOCOLAT', 'CHOCLA', 'CHOCcola']
    },
    { 
      word: 'CHÂTEAU', 
      image: '🏰', 
      definition: 'Grande et belle maison où vivaient les rois et les reines',
      pronunciation: '/châ-tô/',
      options: ['CHÂTEAU', 'CHATO', 'CHATEAU']
    },
    { 
      word: 'OISEAU', 
      image: '🐦', 
      definition: 'Animal avec des plumes et des ailes qui peut voler',
      pronunciation: '/wa-zô/',
      options: ['OISEAU', 'WAZO', 'OIZO']
    },
    { 
      word: 'JARDIN', 
      image: '🌻', 
      definition: 'Terrain avec des fleurs, des plantes et de l\'herbe',
      pronunciation: '/jar-din/',
      options: ['JARDIN', 'JARDAN', 'JARDAIN']
    },
    { 
      word: 'VOYAGE', 
      image: '✈️', 
      definition: 'Déplacement pour aller visiter un autre endroit',
      pronunciation: '/vwa-ya-je/',
      options: ['VOYAGE', 'VOIAGE', 'VOYAJE']
    },
    { 
      word: 'MONTAGNE', 
      image: '⛰️', 
      definition: 'Très grande élévation de terrain, souvent avec de la neige au sommet',
      pronunciation: '/mon-ta-gne/',
      options: ['MONTAGNE', 'MONTAIGNE', 'MONTAGN']
    }
  ],
  ce2: [
    { 
      word: 'ÉLÉPHANT', 
      image: '🐘', 
      definition: 'Très grand animal gris avec une longue trompe',
      pronunciation: '/é-lé-fan/'
    },
    { 
      word: 'ORDINATEUR', 
      image: '💻', 
      definition: 'Machine électronique pour travailler, jouer et chercher des informations',
      pronunciation: '/or-di-na-teur/'
    },
    { 
      word: 'BIBLIOTHÈQUE', 
      image: '📚', 
      definition: 'Lieu où on peut emprunter et lire des livres',
      pronunciation: '/bi-bli-o-tèk/'
    },
    { 
      word: 'DINOSAURE', 
      image: '🦕', 
      definition: 'Animal préhistorique géant qui vivait il y a très longtemps',
      pronunciation: '/di-no-zor/'
    },
    { 
      word: 'TÉLÉPHONE', 
      image: '📱', 
      definition: 'Appareil pour parler avec quelqu\'un qui est loin',
      pronunciation: '/té-lé-fon/'
    },
    { 
      word: 'KANGOUROU', 
      image: '🦘', 
      definition: 'Animal d\'Australie qui saute et porte son bébé dans une poche',
      pronunciation: '/kan-gou-rou/'
    },
    { 
      word: 'CHAMPIGNON', 
      image: '🍄', 
      definition: 'Plante avec un chapeau qu\'on peut manger (si elle n\'est pas toxique)',
      pronunciation: '/chan-pi-gnon/'
    },
    { 
      word: 'ACCIDENT', 
      image: '⚠️', 
      definition: 'Événement malheureux qui arrive sans qu\'on le veuille',
      pronunciation: '/ak-si-dan/'
    }
  ],
  cm1: [
    { 
      word: 'EXTRAORDINAIRE', 
      image: '✨', 
      definition: 'Quelque chose d\'exceptionnel, de remarquable, qui sort de l\'ordinaire',
      pronunciation: '/èks-tra-or-di-nèr/'
    },
    { 
      word: 'ARCHITECTURE', 
      image: '🏛️', 
      definition: 'Art de concevoir et de construire des bâtiments',
      pronunciation: '/ar-chi-tek-tur/'
    },
    { 
      word: 'MYSTÉRIEUX', 
      image: '🔮', 
      definition: 'Qui est difficile à comprendre ou à expliquer',
      pronunciation: '/mis-té-ri-eu/'
    },
    { 
      word: 'ENCYCLOPÉDIE', 
      image: '📖', 
      definition: 'Grand livre qui contient beaucoup de connaissances sur différents sujets',
      pronunciation: '/an-si-klo-pé-di/'
    },
    { 
      word: 'AGRICULTURE', 
      image: '🚜', 
      definition: 'Culture de la terre pour produire des plantes et élever des animaux',
      pronunciation: '/a-gri-kul-tur/'
    },
    { 
      word: 'AQUARIUM', 
      image: '🐠', 
      definition: 'Réservoir transparent rempli d\'eau où vivent des poissons',
      pronunciation: '/a-kwa-ri-om/'
    },
    { 
      word: 'PHARMACIE', 
      image: '💊', 
      definition: 'Magasin où on achète des médicaments',
      pronunciation: '/far-ma-si/'
    },
    { 
      word: 'ORCHESTRE', 
      image: '🎻', 
      definition: 'Groupe de musiciens qui jouent ensemble',
      pronunciation: '/or-kès-tre/'
    }
  ],
  cm2: [
    { 
      word: 'RESPONSABILITÉ', 
      image: '🎯', 
      definition: 'Obligation morale de répondre de ses actes et de leurs conséquences',
      pronunciation: '/rès-pon-sa-bi-li-té/'
    },
    { 
      word: 'DÉMOCRATIQUE', 
      image: '🗳️', 
      definition: 'Qui concerne un système où le peuple a le pouvoir',
      pronunciation: '/dé-mo-kra-tik/'
    },
    { 
      word: 'ENVIRONNEMENT', 
      image: '🌍', 
      definition: 'Ensemble des éléments naturels et artificiels qui nous entourent',
      pronunciation: '/an-vi-ro-ne-man/'
    },
    { 
      word: 'RECONNAISSANCE', 
      image: '🙏', 
      definition: 'Sentiment de gratitude envers quelqu\'un',
      pronunciation: '/re-ko-nè-san-se/'
    },
    { 
      word: 'DÉVELOPPEMENT', 
      image: '📈', 
      definition: 'Action de grandir, de progresser, d\'évoluer',
      pronunciation: '/dé-ve-lo-pe-man/'
    },
    { 
      word: 'COMMUNICATION', 
      image: '📡', 
      definition: 'Action de transmettre des informations à quelqu\'un',
      pronunciation: '/ko-mu-ni-ka-sion/'
    },
    { 
      word: 'MANIFESTATION', 
      image: '📣', 
      definition: 'Rassemblement public pour exprimer une opinion',
      pronunciation: '/ma-ni-fès-ta-sion/'
    },
    { 
      word: 'EXPÉRIMENTATION', 
      image: '🔬', 
      definition: 'Action de faire des expériences pour tester quelque chose',
      pronunciation: '/èks-pé-ri-man-ta-sion/'
    }
  ]
}

function initExercise() {
  words.value = [...wordDatabase[props.level] || wordDatabase.cp]
  shuffleArray(words.value)
  
  // Mélanger aussi les options pour le choix multiple
  if (isMultipleChoice.value) {
    words.value.forEach(word => {
      if (word.options) {
        shuffleArray(word.options)
      }
    })
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
  
  progressStore.recordExercise(
    props.level,
    'spelling',
    correctAnswers.value,
    words.value.length
  )
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
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 700px;
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

.word-card {
  text-align: center;
}

.question-number {
  color: #999;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.word-image {
  font-size: 6rem;
  margin: 1.5rem 0;
  animation: fadeIn 0.5s;
}

.word-definition {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  text-align: left;
}

.word-definition strong {
  color: #667eea;
  font-size: 1.1rem;
}

.word-definition p {
  margin: 0.5rem 0 0 0;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.6;
}

.word-pronunciation {
  color: #667eea;
  font-size: 1.3rem;
  font-family: 'Courier New', monospace;
  margin: 1rem 0;
  font-style: italic;
}

.instruction {
  font-size: 1.2rem;
  color: #333;
  margin: 1.5rem 0;
  font-weight: 500;
}

.multiple-choice {
  margin: 2rem 0;
}

.choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.choice-btn {
  padding: 1.25rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  border: 3px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1rem;
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
  margin: 2rem 0;
}

.spelling-input {
  width: 100%;
  max-width: 400px;
  font-size: 2rem;
  padding: 1rem;
  text-align: center;
  border: 3px solid #667eea;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1rem;
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
