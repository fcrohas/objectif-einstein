<template>
  <div class="lessons-selection">
    <div class="back-link">
      <router-link :to="`/niveau/${level}`" class="back-button">
        ← Retour au niveau {{ levelName }}
      </router-link>
    </div>

    <h2>📖 Leçons - {{ levelName }}</h2>
    <p class="subtitle">Choisis une leçon pour apprendre avant de faire les exercices !</p>
    
    <div class="lessons-grid">
      <div 
        v-for="lesson in availableLessons" 
        :key="lesson.id"
        class="lesson-card"
        @click="goToLesson(lesson.id)"
      >
        <div class="lesson-icon">{{ lesson.icon }}</div>
        <h3>{{ lesson.name }}</h3>
        <p>{{ lesson.description }}</p>
        <div class="lesson-badge">📚 Leçon interactive</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  level: {
    type: String,
    required: true
  }
})

const levelName = computed(() => {
  const names = { cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM1', cm2: 'CM2' }
  return names[props.level] || props.level.toUpperCase()
})

// Leçons disponibles par niveau
const lessonsByLevel = {
  cp: [
    {
      id: 'addition',
      name: 'Les additions',
      icon: '➕',
      description: 'Apprends à additionner avec plaisir !'
    },
    {
      id: 'soustraction',
      name: 'Les soustractions',
      icon: '➖',
      description: 'Apprends à enlever avec facilité !'
    },
    {
      id: 'grammar',
      name: 'Classes de mots',
      icon: '📝',
      description: 'Noms, verbes et adjectifs'
    },
    {
      id: 'conjugation',
      name: 'Le présent',
      icon: '🔤',
      description: 'Être et avoir au présent'
    },
    {
      id: 'vocabulary',
      name: 'Synonymes et antonymes',
      icon: '📚',
      description: 'Enrichis ton vocabulaire'
    }
  ],
  ce1: [
    {
      id: 'addition',
      name: 'Les additions',
      icon: '➕',
      description: 'Additions avec retenue jusqu\'à 20'
    },
    {
      id: 'multiplication',
      name: 'Les multiplications',
      icon: '✖️',
      description: 'Découvre les tables de multiplication'
    },
    {
      id: 'grammar',
      name: 'Le sujet et le verbe',
      icon: '📝',
      description: 'Comprends la structure de la phrase'
    }
  ],
  ce2: [
    {
      id: 'addition',
      name: 'Les additions avec retenue',
      icon: '➕',
      description: 'Maîtrise les additions complexes'
    },
    {
      id: 'soustraction',
      name: 'Les soustractions avec retenue',
      icon: '➖',
      description: 'Apprends à soustraire avec retenue'
    },
    {
      id: 'multiplication',
      name: 'Les tables de multiplication',
      icon: '✖️',
      description: 'Révise toutes les tables jusqu\'à 10'
    },
    {
      id: 'division',
      name: 'La division',
      icon: '➗',
      description: 'Découvre comment diviser'
    },
    {
      id: 'fractions',
      name: 'Les fractions simples',
      icon: '🍕',
      description: 'Comprends les fractions'
    },
    {
      id: 'grammar',
      name: 'Les compléments COD et COI',
      icon: '📝',
      description: 'Apprends les compléments d\'objet'
    },
    {
      id: 'conjugation',
      name: 'Le passé composé',
      icon: '🔤',
      description: 'Raconte ce qui s\'est passé'
    },
    {
      id: 'orthographe',
      name: 'Les homophones',
      icon: '✍️',
      description: 'Ne confonds plus a/à, et/est, son/sont'
    },
    {
      id: 'vocabulary',
      name: 'Les préfixes et suffixes',
      icon: '📚',
      description: 'Crée de nouveaux mots'
    }
  ],
  cm1: [
    {
      id: 'division',
      name: 'La division à deux chiffres',
      icon: '➗',
      description: 'Divise par des nombres plus grands'
    },
    {
      id: 'fractions',
      name: 'Les fractions et décimaux',
      icon: '🔢',
      description: 'Transforme les fractions en décimaux'
    },
    {
      id: 'decimaux',
      name: 'Les nombres décimaux',
      icon: '📊',
      description: 'Maîtrise les nombres à virgule'
    },
    {
      id: 'mesures',
      name: 'Les mesures',
      icon: '📏',
      description: 'Convertis longueurs et masses'
    },
    {
      id: 'grammar',
      name: 'Les propositions',
      icon: '📝',
      description: 'Principales et subordonnées'
    },
    {
      id: 'conjugation',
      name: 'L\'imparfait et le passé simple',
      icon: '🔤',
      description: 'Raconte des histoires au passé'
    },
    {
      id: 'orthographe',
      name: 'Les accords du participe passé',
      icon: '✍️',
      description: 'Accorde correctement les participes'
    }
  ],
  cm2: [
    {
      id: 'fractions',
      name: 'Les fractions : opérations',
      icon: '🔢',
      description: 'Additionne et soustrais des fractions'
    },
    {
      id: 'decimaux',
      name: 'Les nombres décimaux : opérations',
      icon: '📊',
      description: 'Calcule avec les décimaux'
    },
    {
      id: 'proportionnalite',
      name: 'La proportionnalité',
      icon: '⚖️',
      description: 'Résous des problèmes de proportionnalité'
    },
    {
      id: 'geometrie',
      name: 'Périmètres et aires',
      icon: '📐',
      description: 'Calcule périmètres et surfaces'
    },
    {
      id: 'grammar',
      name: 'Les compléments circonstanciels',
      icon: '📝',
      description: 'Analyse les circonstances'
    },
    {
      id: 'conjugation',
      name: 'Le conditionnel et le subjonctif',
      icon: '🔤',
      description: 'Découvre de nouveaux modes'
    },
    {
      id: 'vocabulaire',
      name: 'Le sens propre et figuré',
      icon: '📚',
      description: 'Comprends les images du langage'
    }
  ]
}

const availableLessons = computed(() => {
  return lessonsByLevel[props.level] || []
})

function goToLesson(lessonId) {
  router.push(`/niveau/${props.level}/lecon/${lessonId}`)
}
</script>

<style scoped>
.lessons-selection {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.back-link {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.back-button:hover {
  color: #764ba2;
}

h2 {
  text-align: center;
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 3rem;
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.lesson-card {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid #ffc107;
  text-align: center;
}

.lesson-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  border-color: #ff9800;
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

.lesson-card h3 {
  color: #f57c00;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.lesson-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.lesson-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .lessons-grid {
    grid-template-columns: 1fr;
  }
}
</style>
