// Système de gestion de la progression de l'élève
import { profileStore } from './profileStore'

export const progressStore = {
  // Récupérer la progression complète du profil actif
  getProgress() {
    const activeProfile = profileStore.getActiveProfile()
    if (!activeProfile) return this.getDefaultProgress()
    
    return activeProfile.progress && Object.keys(activeProfile.progress).length > 0
      ? activeProfile.progress
      : this.getDefaultProgress()
  },

  // Structure par défaut
  getDefaultProgress() {
    return {
      currentLevel: 'cp',
      levels: {
        cp: { completed: 0, total: 0, score: 0 },
        ce1: { completed: 0, total: 0, score: 0 },
        ce2: { completed: 0, total: 0, score: 0 },
        cm1: { completed: 0, total: 0, score: 0 },
        cm2: { completed: 0, total: 0, score: 0 }
      },
      exercises: {},
      achievements: []
    }
  },

  // Sauvegarder la progression du profil actif
  saveProgress(progress) {
    const activeProfile = profileStore.getActiveProfile()
    if (activeProfile) {
      profileStore.updateProgress(activeProfile.id, progress)
    }
  },

  // Enregistrer un exercice complété
  recordExercise(level, exerciseId, score, maxScore) {
    const progress = this.getProgress()
    
    if (!progress.exercises[level]) {
      progress.exercises[level] = {}
    }
    
    const previousBest = progress.exercises[level][exerciseId]?.score || 0
    const newBest = Math.max(previousBest, score)
    
    progress.exercises[level][exerciseId] = {
      score: newBest,
      maxScore,
      lastAttempt: new Date().toISOString(),
      attempts: (progress.exercises[level][exerciseId]?.attempts || 0) + 1
    }
    
    // Mettre à jour les stats du niveau
    const levelExercises = Object.values(progress.exercises[level])
    progress.levels[level].completed = levelExercises.filter(e => e.score === e.maxScore).length
    progress.levels[level].total = levelExercises.length
    progress.levels[level].score = Math.round(
      levelExercises.reduce((sum, e) => sum + (e.score / e.maxScore * 100), 0) / levelExercises.length
    )
    
    // Vérifier les achievements
    this.checkAchievements(progress, score, maxScore)
    
    this.saveProgress(progress)
    return progress
  },

  // Vérifier et débloquer des achievements
  checkAchievements(progress, score, maxScore) {
    const achievements = []
    
    // Premier exercice réussi
    if (score === maxScore && progress.achievements.indexOf('first-perfect') === -1) {
      achievements.push({
        id: 'first-perfect',
        title: 'Premier sans faute !',
        icon: '⭐',
        date: new Date().toISOString()
      })
    }
    
    // 10 exercices complétés
    const totalCompleted = Object.values(progress.levels).reduce((sum, l) => sum + l.completed, 0)
    if (totalCompleted >= 10 && progress.achievements.indexOf('ten-exercises') === -1) {
      achievements.push({
        id: 'ten-exercises',
        title: '10 exercices réussis',
        icon: '🏆',
        date: new Date().toISOString()
      })
    }
    
    // Ajouter les nouveaux achievements
    achievements.forEach(a => {
      if (!progress.achievements.find(pa => pa.id === a.id)) {
        progress.achievements.push(a)
      }
    })
    
    return achievements
  },

  // Obtenir les stats globales
  getStats() {
    const progress = this.getProgress()
    const totalExercises = Object.values(progress.exercises).reduce(
      (sum, level) => sum + Object.keys(level).length, 0
    )
    const perfectScores = Object.values(progress.exercises).reduce(
      (sum, level) => sum + Object.values(level).filter(e => e.score === e.maxScore).length, 0
    )
    
    return {
      totalExercises,
      perfectScores,
      achievements: progress.achievements.length,
      currentLevel: progress.currentLevel
    }
  },

  // Changer de niveau
  setCurrentLevel(level) {
    const progress = this.getProgress()
    progress.currentLevel = level
    this.saveProgress(progress)
  },

  // Réinitialiser la progression
  reset() {
    localStorage.removeItem('objectif-einstein-progress')
  }
}
