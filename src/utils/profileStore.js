// Gestion des profils enfants
const STORAGE_KEY = 'objectif-einstein-profiles'
const ACTIVE_PROFILE_KEY = 'objectif-einstein-active-profile'

const levelOrder = ['cp', 'ce1', 'ce2', 'cm1', 'cm2']

export const profileStore = {
  // Obtenir tous les profils
  getProfiles() {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  },

  // Obtenir le profil actif
  getActiveProfile() {
    const profileId = localStorage.getItem(ACTIVE_PROFILE_KEY)
    if (!profileId) return null
    
    const profiles = this.getProfiles()
    return profiles.find(p => p.id === profileId) || null
  },

  // Définir le profil actif
  setActiveProfile(profileId) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
  },

  // Créer un nouveau profil
  createProfile(name, currentLevel) {
    const profiles = this.getProfiles()
    const newProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      currentLevel: currentLevel,
      createdAt: new Date().toISOString(),
      progress: {}
    }
    
    profiles.push(newProfile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    
    // Définir comme profil actif
    this.setActiveProfile(newProfile.id)
    
    return newProfile
  },

  // Supprimer un profil
  deleteProfile(profileId) {
    const profiles = this.getProfiles()
    const filtered = profiles.filter(p => p.id !== profileId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // Si c'était le profil actif, le retirer
    if (localStorage.getItem(ACTIVE_PROFILE_KEY) === profileId) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY)
    }
  },

  // Obtenir les niveaux accessibles pour un profil
  getAccessibleLevels(currentLevel) {
    const currentIndex = levelOrder.indexOf(currentLevel)
    if (currentIndex === -1) return levelOrder
    
    // Retourner uniquement le niveau actuel et les suivants
    return levelOrder.slice(currentIndex)
  },

  // Mettre à jour la progression d'un profil
  updateProgress(profileId, progressData) {
    const profiles = this.getProfiles()
    const profile = profiles.find(p => p.id === profileId)
    
    if (profile) {
      profile.progress = progressData
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    }
  },

  // Obtenir la progression d'un profil
  getProgress(profileId) {
    const profiles = this.getProfiles()
    const profile = profiles.find(p => p.id === profileId)
    return profile ? profile.progress : {}
  }
}
