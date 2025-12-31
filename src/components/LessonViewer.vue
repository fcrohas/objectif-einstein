<template>
  <div class="lesson-viewer">
    <div v-if="loading" class="loading">
      <div class="spinner">📚</div>
      <p>Chargement de la leçon...</p>
    </div>

    <div v-else-if="loadingError" class="error">
      <p>{{ loadingError }}</p>
    </div>

    <div v-else class="lesson-content">
      <!-- En-tête de la leçon -->
      <div class="lesson-header">
        <div class="lesson-icon">{{ lesson.icon }}</div>
        <h2>{{ lesson.title }}</h2>
        <p class="lesson-subtitle">{{ lesson.subtitle }}</p>
      </div>

      <!-- Progression -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        <span class="progress-text">{{ currentSlide + 1 }} / {{ lesson.slides.length }}</span>
      </div>

      <!-- Slide actuel -->
      <div class="slide-container" :key="currentSlide">
        <transition name="slide-fade" mode="out-in">
          <div class="slide" :key="currentSlide">
            <div class="slide-content">
              <!-- Type: texte avec illustration -->
              <div v-if="currentSlideData.type === 'text'" class="slide-text">
                <div v-if="currentSlideData.illustration" class="illustration">
                  {{ currentSlideData.illustration }}
                </div>
                <h3>{{ currentSlideData.title }}</h3>
                <div v-for="(paragraph, idx) in currentSlideData.content" :key="idx" class="paragraph">
                  <p v-html="paragraph"></p>
                </div>
              </div>

              <!-- Type: exemple interactif -->
              <div v-else-if="currentSlideData.type === 'example'" class="slide-example">
                <div class="illustration">{{ currentSlideData.illustration }}</div>
                <h3>{{ currentSlideData.title }}</h3>
                <div class="example-box">
                  <div v-for="(item, idx) in currentSlideData.examples" :key="idx" class="example-item">
                    <div class="example-question">{{ item.question }}</div>
                    <div class="example-answer" :class="{ revealed: revealedExamples.includes(idx) }">
                      <button v-if="!revealedExamples.includes(idx)" @click="revealExample(idx)" class="reveal-btn">
                        👁️ Voir la réponse
                      </button>
                      <div v-else class="answer-content">
                        <div class="answer-value">{{ item.answer }}</div>
                        <div v-if="item.explanation" class="answer-explanation">{{ item.explanation }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Type: mini-quiz -->
              <div v-else-if="currentSlideData.type === 'quiz'" class="slide-quiz">
                <div class="illustration">{{ currentSlideData.illustration }}</div>
                <h3>{{ currentSlideData.title }}</h3>
                <p class="quiz-instruction">{{ currentSlideData.instruction }}</p>
                
                <div class="quiz-question">
                  <p>{{ currentSlideData.question }}</p>
                  <div class="quiz-options">
                    <button
                      v-for="(option, idx) in currentSlideData.options"
                      :key="idx"
                      @click="checkQuizAnswer(option)"
                      :disabled="quizAnswered"
                      class="quiz-option"
                      :class="{
                        correct: quizAnswered && option === currentSlideData.answer,
                        incorrect: quizAnswered && selectedAnswer === option && option !== currentSlideData.answer
                      }"
                    >
                      {{ option }}
                    </button>
                  </div>
                  
                  <div v-if="quizAnswered" class="quiz-feedback">
                    <div v-if="selectedAnswer === currentSlideData.answer" class="feedback-correct">
                      ✅ Bravo ! {{ currentSlideData.correctFeedback }}
                    </div>
                    <div v-else class="feedback-incorrect">
                      ❌ Pas tout à fait ! {{ currentSlideData.incorrectFeedback }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Type: astuce/conseil -->
              <div v-else-if="currentSlideData.type === 'tip'" class="slide-tip">
                <div class="tip-icon">💡</div>
                <h3>{{ currentSlideData.title }}</h3>
                <div class="tip-content">
                  <p v-for="(tip, idx) in currentSlideData.tips" :key="idx">
                    <strong>{{ tip.label }}</strong> {{ tip.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <div class="lesson-navigation">
        <button @click="previousSlide" :disabled="currentSlide === 0" class="nav-btn">
          ⬅️ Précédent
        </button>
        
        <button v-if="currentSlide < lesson.slides.length - 1" @click="nextSlide" class="nav-btn nav-btn-primary">
          Suivant ➡️
        </button>
        
        <button v-else @click="completeLesson" class="nav-btn nav-btn-success">
          ✅ Terminer la leçon
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  level: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  lessonId: {
    type: String,
    default: 'main'
  }
})

const lesson = ref(null)
const currentSlide = ref(0)
const loading = ref(true)
const loadingError = ref(null)
const revealedExamples = ref([])
const quizAnswered = ref(false)
const selectedAnswer = ref(null)

const currentSlideData = computed(() => {
  if (!lesson.value || !lesson.value.slides) return {}
  return lesson.value.slides[currentSlide.value] || {}
})

const progressPercentage = computed(() => {
  if (!lesson.value || !lesson.value.slides) return 0
  return ((currentSlide.value + 1) / lesson.value.slides.length) * 100
})

async function loadLesson() {
  loading.value = true
  loadingError.value = null
  
  try {
    const BASE_URL = import.meta.env.BASE_URL
    const fileName = `lesson-${props.subject}-${props.level}.json`
    const response = await fetch(`${BASE_URL}data/${fileName}`)
    
    if (!response.ok) {
      throw new Error(`Leçon non disponible pour ce niveau`)
    }
    
    lesson.value = await response.json()
  } catch (error) {
    loadingError.value = error.message
  } finally {
    loading.value = false
  }
}

function nextSlide() {
  if (currentSlide.value < lesson.value.slides.length - 1) {
    currentSlide.value++
    resetSlideState()
  }
}

function previousSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
    resetSlideState()
  }
}

function resetSlideState() {
  revealedExamples.value = []
  quizAnswered.value = false
  selectedAnswer.value = null
}

function revealExample(index) {
  revealedExamples.value.push(index)
}

function checkQuizAnswer(answer) {
  if (quizAnswered.value) return
  
  selectedAnswer.value = answer
  quizAnswered.value = true
  
  if (answer === currentSlideData.value.answer) {
    setTimeout(() => {
      if (currentSlide.value < lesson.value.slides.length - 1) {
        nextSlide()
      }
    }, 2000)
  }
}

function completeLesson() {
  router.back()
}

onMounted(() => {
  loadLesson()
})
</script>

<style scoped>
.lesson-viewer {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}

.spinner {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.lesson-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lesson-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.lesson-header h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.lesson-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.progress-bar {
  background: #e0e0e0;
  border-radius: 20px;
  height: 12px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.slide-container {
  min-height: 400px;
}

.slide {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.illustration {
  font-size: 5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.slide h3 {
  color: #667eea;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.paragraph {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.1rem;
}

.paragraph p {
  color: #333;
}

/* Exemples */
.example-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.example-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-question {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.example-answer {
  margin-top: 1rem;
}

.reveal-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.reveal-btn:hover {
  transform: scale(1.05);
}

.answer-content {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 1rem;
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.answer-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 0.5rem;
}

.answer-explanation {
  color: #555;
  font-style: italic;
}

/* Quiz */
.quiz-instruction {
  text-align: center;
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.quiz-question p {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.quiz-option {
  background: white;
  border: 3px solid #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.quiz-option:not(:disabled):hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quiz-option:disabled {
  cursor: not-allowed;
}

.quiz-option.correct {
  background: #e8f5e9;
  border-color: #4caf50;
  animation: correctPulse 0.5s;
}

.quiz-option.incorrect {
  background: #ffebee;
  border-color: #f44336;
  animation: shake 0.5s;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.quiz-feedback {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-correct {
  background: #e8f5e9;
  color: #2e7d32;
}

.feedback-incorrect {
  background: #fff3e0;
  color: #e65100;
}

/* Astuces */
.slide-tip {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  border-radius: 16px;
  padding: 2rem;
}

.tip-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 235, 59, 0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 235, 59, 0.8)); }
}

.tip-content p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
}

.tip-content strong {
  color: #f57c00;
}

/* Navigation */
.lesson-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: #e0e0e0;
  color: #333;
}

.nav-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

@media (max-width: 768px) {
  .lesson-viewer {
    padding: 1rem;
  }
  
  .slide {
    padding: 1.5rem;
  }
  
  .illustration {
    font-size: 3rem;
  }
  
  .slide h3 {
    font-size: 1.4rem;
  }
  
  .quiz-options {
    grid-template-columns: 1fr;
  }
}
</style>
