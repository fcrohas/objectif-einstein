<template>
  <div class="level-view container">
    <div class="level-header">
      <router-link to="/" class="back-button">← Retour</router-link>
      <div class="level-title">
        <span class="level-emoji">{{ levelData.icon }}</span>
        <h1>{{ levelData.name }} - {{ levelData.description }}</h1>
      </div>
    </div>

    <div class="cta-section">
      <button @click="goToSubjects" class="btn-start">
        🎓 Commencer les exercices
      </button>
      <button @click="goToLessons" class="btn-lessons">
        📖 Voir les leçons
      </button>
    </div>

    <div class="activities-section">
      <h2>Programme du {{ levelData.name }}</h2>
      <div class="subjects-grid">
        <div 
          v-for="subject in levelData.activities" 
          :key="subject.name"
          class="subject-card"
        >
          <div class="subject-header">
            <span class="subject-emoji">{{ subject.emoji }}</span>
            <h3>{{ subject.name }}</h3>
          </div>
          <ul class="activity-list">
            <li v-for="activity in subject.items" :key="activity">
              {{ activity }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelsData = {
  cp: {
    name: 'CP',
    icon: '🌱',
    description: 'Cours Préparatoire',
    activities: [
      {
        name: 'Lecture',
        emoji: '📖',
        items: [
          'Reconnaissance des lettres',
          'Syllabes simples',
          'Premiers mots',
          'Phrases courtes'
        ]
      },
      {
        name: 'Écriture',
        emoji: '✏️',
        items: [
          'Tracer les lettres',
          'Majuscules et minuscules',
          'Copie de mots',
          'Écrire son prénom'
        ]
      },
      {
        name: 'Mathématiques',
        emoji: '🔢',
        items: [
          'Compter jusqu\'à 100',
          'Addition simple',
          'Soustraction simple',
          'Formes géométriques'
        ]
      }
    ]
  },
  ce1: {
    name: 'CE1',
    icon: '🌿',
    description: 'Cours Élémentaire 1',
    activities: [
      {
        name: 'Français',
        emoji: '📚',
        items: [
          'Lecture fluide',
          'Grammaire de base',
          'Orthographe simple',
          'Production d\'écrits'
        ]
      },
      {
        name: 'Mathématiques',
        emoji: '➕',
        items: [
          'Tables d\'addition',
          'Multiplication initiation',
          'Problèmes simples',
          'Mesures et monnaie'
        ]
      },
      {
        name: 'Découverte du monde',
        emoji: '🌍',
        items: [
          'Les saisons',
          'Le vivant',
          'L\'espace',
          'Le temps'
        ]
      }
    ]
  },
  ce2: {
    name: 'CE2',
    icon: '🌳',
    description: 'Cours Élémentaire 2',
    activities: [
      {
        name: 'Français',
        emoji: '📝',
        items: [
          'Conjugaison (présent, futur, passé)',
          'Grammaire approfondie',
          'Vocabulaire enrichi',
          'Rédaction'
        ]
      },
      {
        name: 'Mathématiques',
        emoji: '✖️',
        items: [
          'Tables de multiplication',
          'Division',
          'Fractions simples',
          'Géométrie'
        ]
      },
      {
        name: 'Sciences',
        emoji: '🔬',
        items: [
          'Le corps humain',
          'États de la matière',
          'Énergie',
          'Environnement'
        ]
      }
    ]
  },
  cm1: {
    name: 'CM1',
    icon: '🏔️',
    description: 'Cours Moyen 1',
    activities: [
      {
        name: 'Français',
        emoji: '📖',
        items: [
          'Analyse grammaticale',
          'Conjugaison tous temps',
          'Orthographe complexe',
          'Expression écrite'
        ]
      },
      {
        name: 'Mathématiques',
        emoji: '📐',
        items: [
          'Nombres décimaux',
          'Fractions',
          'Problèmes complexes',
          'Géométrie avancée'
        ]
      },
      {
        name: 'Histoire',
        emoji: '🏛️',
        items: [
          'Préhistoire',
          'Antiquité',
          'Moyen Âge',
          'Frises chronologiques'
        ]
      },
      {
        name: 'Géographie',
        emoji: '🗺️',
        items: [
          'La France',
          'Reliefs et climats',
          'Régions',
          'Europe'
        ]
      }
    ]
  },
  cm2: {
    name: 'CM2',
    icon: '🎯',
    description: 'Cours Moyen 2',
    activities: [
      {
        name: 'Français',
        emoji: '📚',
        items: [
          'Analyse de textes',
          'Conjugaison maîtrisée',
          'Orthographe avancée',
          'Argumentation'
        ]
      },
      {
        name: 'Mathématiques',
        emoji: '🎲',
        items: [
          'Proportionnalité',
          'Pourcentages',
          'Aires et périmètres',
          'Volumes'
        ]
      },
      {
        name: 'Histoire',
        emoji: '⏳',
        items: [
          'Temps modernes',
          'Révolution française',
          'XIXe et XXe siècles',
          'Monde contemporain'
        ]
      },
      {
        name: 'Sciences',
        emoji: '🧪',
        items: [
          'Système solaire',
          'Électricité',
          'Développement durable',
          'Technologie'
        ]
      }
    ]
  }
}

const levelData = computed(() => {
  return levelsData[route.params.level] || levelsData.cp
})

function goToSubjects() {
  router.push(`/niveau/${route.params.level}/matières`)
}

function goToLessons() {
  router.push(`/niveau/${route.params.level}/leçons`)
}
</script>

<style scoped>
.level-view {
  min-height: calc(100vh - 200px);
}

.level-header {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.back-button:hover {
  color: #764ba2;
}

.level-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 2rem;
  border-radius: 12px;
}

.level-emoji {
  font-size: 4rem;
}

.level-title h1 {
  color: #667eea;
  margin: 0;
}

.cta-section {
  text-align: center;
  margin: 3rem 0;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1.5rem 3rem;
  font-size: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-start:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-lessons {
  padding: 1.5rem 3rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.btn-lessons:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

.activities-section {
  margin: 3rem 0;
}

.activities-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.subject-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #f0f0f0;
  transition: all 0.3s;
}

.subject-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.subject-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.subject-emoji {
  font-size: 2rem;
}

.subject-card h3 {
  color: #667eea;
  margin: 0;
  font-size: 1.5rem;
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #666;
}

.activity-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}
</style>
