<template>
  <div class="subject-selection">
    <div class="back-link">
      <router-link :to="`/niveau/${level}`" class="back-button">
        ← Retour au niveau {{ levelName }}
      </router-link>
    </div>

    <h2>📚 Choisis une matière</h2>
    
    <div class="subjects-grid">
      <div 
        v-for="subject in availableSubjects" 
        :key="subject.id"
        class="subject-card"
        @click="selectSubject(subject.id)"
      >
        <div class="subject-icon">{{ subject.icon }}</div>
        <h3>{{ subject.name }}</h3>
        <p>{{ subject.description }}</p>
        <div class="subject-badge">{{ subject.exerciseCount }} exercices</div>
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

const subjectsByLevel = {
  cp: [
    {
      id: 'math',
      name: 'Mathématiques',
      icon: '🔢',
      description: 'Additions et soustractions',
      exerciseCount: 5
    },
    {
      id: 'french',
      name: 'Français',
      icon: '✏️',
      description: 'Orthographe par thèmes',
      exerciseCount: 6
    },
    {
      id: 'reading',
      name: 'Lecture Fluide',
      icon: '📖',
      description: 'Lire et comprendre un texte',
      exerciseCount: 1
    },
    {
      id: 'grammar',
      name: 'Grammaire',
      icon: '📝',
      description: 'Classes de mots',
      exerciseCount: 1
    },
    {
      id: 'conjugation',
      name: 'Conjugaison',
      icon: '🔤',
      description: 'Verbes au présent',
      exerciseCount: 1
    },
    {
      id: 'vocabulary',
      name: 'Vocabulaire',
      icon: '📚',
      description: 'Synonymes et antonymes',
      exerciseCount: 1
    },
    {
      id: 'science',
      name: 'Sciences',
      icon: '🔬',
      description: 'Les saisons et les sens',
      exerciseCount: 1
    },
    {
      id: 'history',
      name: 'Histoire',
      icon: '📜',
      description: 'Se repérer dans le temps',
      exerciseCount: 1
    },
    {
      id: 'geography',
      name: 'Géographie',
      icon: '🗺️',
      description: 'Découvrir le monde',
      exerciseCount: 1
    }
  ],
  ce1: [
    {
      id: 'math',
      name: 'Mathématiques',
      icon: '🔢',
      description: 'Additions, soustractions et multiplications',
      exerciseCount: 6
    },
    {
      id: 'french',
      name: 'Français',
      icon: '✏️',
      description: 'Orthographe par thèmes',
      exerciseCount: 6
    },
    {
      id: 'reading',
      name: 'Lecture Fluide',
      icon: '📖',
      description: 'Lire et comprendre un texte',
      exerciseCount: 1
    },
    {
      id: 'grammar',
      name: 'Grammaire',
      icon: '📝',
      description: 'Noms, verbes et adjectifs',
      exerciseCount: 1
    },
    {
      id: 'conjugation',
      name: 'Conjugaison',
      icon: '🔤',
      description: 'Temps simples et composés',
      exerciseCount: 1
    },
    {
      id: 'vocabulary',
      name: 'Vocabulaire',
      icon: '📚',
      description: 'Familles de mots et champs lexicaux',
      exerciseCount: 1
    },
    {
      id: 'science',
      name: 'Sciences',
      icon: '🔬',
      description: 'Le vivant et la matière',
      exerciseCount: 1
    },
    {
      id: 'history',
      name: 'Histoire',
      icon: '📜',
      description: 'La Préhistoire',
      exerciseCount: 1
    },
    {
      id: 'geography',
      name: 'Géographie',
      icon: '🗺️',
      description: 'La France et ses régions',
      exerciseCount: 1
    }
  ],
  ce2: [
    {
      id: 'math',
      name: 'Mathématiques',
      icon: '🔢',
      description: 'Toutes les opérations',
      exerciseCount: 6
    },
    {
      id: 'french',
      name: 'Français',
      icon: '✏️',
      description: 'Orthographe et vocabulaire',
      exerciseCount: 1
    },
    {
      id: 'reading',
      name: 'Lecture Fluide',
      icon: '📖',
      description: 'Lire et comprendre un texte',
      exerciseCount: 1
    },
    {
      id: 'grammar',
      name: 'Grammaire',
      icon: '📝',
      description: 'Fonctions et groupes nominaux',
      exerciseCount: 1
    },
    {
      id: 'conjugation',
      name: 'Conjugaison',
      icon: '🔤',
      description: 'Temps complexes et accords',
      exerciseCount: 1
    },
    {
      id: 'vocabulary',
      name: 'Vocabulaire',
      icon: '📚',
      description: 'Préfixes, suffixes et sens figuré',
      exerciseCount: 1
    },
    {
      id: 'science',
      name: 'Sciences',
      icon: '🔬',
      description: 'Le corps humain et l\'alimentation',
      exerciseCount: 1
    },
    {
      id: 'history',
      name: 'Histoire',
      icon: '📜',
      description: 'L\'Antiquité et les Gaulois',
      exerciseCount: 1
    },
    {
      id: 'geography',
      name: 'Géographie',
      icon: '🗺️',
      description: 'Les continents et océans',
      exerciseCount: 1
    }
  ],
  cm1: [
    {
      id: 'math',
      name: 'Mathématiques',
      icon: '🔢',
      description: 'Toutes les opérations',
      exerciseCount: 7
    },
    {
      id: 'french',
      name: 'Français',
      icon: '✏️',
      description: 'Orthographe avancée',
      exerciseCount: 1
    },
    {
      id: 'reading',
      name: 'Lecture Fluide',
      icon: '📖',
      description: 'Lire et comprendre un texte',
      exerciseCount: 1
    },
    {
      id: 'grammar',
      name: 'Grammaire',
      icon: '📝',
      description: 'Propositions et compléments',
      exerciseCount: 1
    },
    {
      id: 'conjugation',
      name: 'Conjugaison',
      icon: '🔤',
      description: 'Temps littéraires et subjonctif',
      exerciseCount: 1
    },
    {
      id: 'vocabulary',
      name: 'Vocabulaire',
      icon: '📚',
      description: 'Étymologie et figures de style',
      exerciseCount: 1
    },
    {
      id: 'science',
      name: 'Sciences',
      icon: '🔬',
      description: 'L\'énergie et le système solaire',
      exerciseCount: 1
    },
    {
      id: 'history',
      name: 'Histoire',
      icon: '📜',
      description: 'Le Moyen Âge et les Temps modernes',
      exerciseCount: 1
    },
    {
      id: 'geography',
      name: 'Géographie',
      icon: '🗺️',
      description: 'Le monde et ses pays',
      exerciseCount: 1
    }
  ],
  cm2: [
    {
      id: 'math',
      name: 'Mathématiques',
      icon: '🔢',
      description: 'Toutes les opérations',
      exerciseCount: 7
    },
    {
      id: 'french',
      name: 'Français',
      icon: '✏️',
      description: 'Orthographe complexe',
      exerciseCount: 1
    },
    {
      id: 'reading',
      name: 'Lecture Fluide',
      icon: '📖',
      description: 'Lire et comprendre un texte',
      exerciseCount: 1
    },
    {
      id: 'grammar',
      name: 'Grammaire',
      icon: '📝',
      description: 'Analyse grammaticale complète',
      exerciseCount: 1
    },
    {
      id: 'conjugation',
      name: 'Conjugaison',
      icon: '🔤',
      description: 'Formes complexes et voix passive',
      exerciseCount: 1
    },
    {
      id: 'vocabulary',
      name: 'Vocabulaire',
      icon: '📚',
      description: 'Registres de langue et rhétorique',
      exerciseCount: 1
    },
    {
      id: 'science',
      name: 'Sciences',
      icon: '🔬',
      description: 'L\'électricité et l\'environnement',
      exerciseCount: 1
    },
    {
      id: 'history',
      name: 'Histoire',
      icon: '📜',
      description: 'Du XXe siècle à nos jours',
      exerciseCount: 1
    },
    {
      id: 'geography',
      name: 'Géographie',
      icon: '🗺️',
      description: 'L\'Europe et l\'Union européenne',
      exerciseCount: 1
    }
  ]
}

const availableSubjects = computed(() => {
  return subjectsByLevel[props.level] || subjectsByLevel.cp
})

function selectSubject(subjectId) {
  router.push(`/niveau/${props.level}/${subjectId}`)
}
</script>

<style scoped>
.subject-selection {
  max-width: 1000px;
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
  margin-bottom: 3rem;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.subject-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  text-align: center;
}

.subject-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.subject-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.subject-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.subject-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.subject-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
