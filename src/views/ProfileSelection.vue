<template>
  <div class="profile-selection">
    <div class="welcome-header">
      <h1>🎓 Bienvenue sur Objectif Einstein !</h1>
      <p>Sélectionne ton profil ou crée-en un nouveau</p>
    </div>

    <!-- Liste des profils existants -->
    <div v-if="profiles.length > 0" class="profiles-list">
      <h2>Mes profils</h2>
      <div class="profile-cards">
        <div 
          v-for="profile in profiles" 
          :key="profile.id"
          class="profile-card"
          @click="selectProfile(profile.id)"
        >
          <div class="profile-avatar">{{ profile.name.charAt(0).toUpperCase() }}</div>
          <div class="profile-info">
            <h3>{{ profile.name }}</h3>
            <p class="profile-level">{{ getLevelLabel(profile.currentLevel) }}</p>
          </div>
          <button 
            @click.stop="deleteProfile(profile.id)"
            class="delete-btn"
            title="Supprimer ce profil"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Formulaire de création de profil -->
    <div class="create-profile">
      <h2>{{ profiles.length === 0 ? 'Créer mon profil' : 'Nouveau profil' }}</h2>
      
      <div class="form-group">
        <label for="name">Prénom</label>
        <input
          id="name"
          v-model="newProfileName"
          type="text"
          placeholder="Ton prénom"
          @keyup.enter="createProfile"
          ref="nameInput"
        />
      </div>

      <div class="form-group">
        <label>Niveau actuel</label>
        <div class="level-buttons">
          <button
            v-for="level in availableLevels"
            :key="level.id"
            @click="selectedLevel = level.id"
            :class="['level-btn', { active: selectedLevel === level.id }]"
          >
            {{ level.icon }} {{ level.label }}
          </button>
        </div>
      </div>

      <button 
        @click="createProfile"
        class="btn-create"
        :disabled="!newProfileName.trim() || !selectedLevel"
      >
        ✨ Créer mon profil
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileStore } from '../utils/profileStore'

const router = useRouter()
const profiles = ref([])
const newProfileName = ref('')
const selectedLevel = ref('cp')
const nameInput = ref(null)

const availableLevels = [
  { id: 'cp', label: 'CP', icon: '🌱' },
  { id: 'ce1', label: 'CE1', icon: '🌿' },
  { id: 'ce2', label: 'CE2', icon: '🌳' },
  { id: 'cm1', label: 'CM1', icon: '🏔️' },
  { id: 'cm2', label: 'CM2', icon: '🎯' }
]

function getLevelLabel(levelId) {
  const level = availableLevels.find(l => l.id === levelId)
  return level ? `${level.icon} ${level.label}` : levelId.toUpperCase()
}

function loadProfiles() {
  profiles.value = profileStore.getProfiles()
}

function selectProfile(profileId) {
  profileStore.setActiveProfile(profileId)
  router.push('/')
}

function createProfile() {
  if (!newProfileName.value.trim() || !selectedLevel.value) return
  
  profileStore.createProfile(newProfileName.value, selectedLevel.value)
  router.push('/')
}

function deleteProfile(profileId) {
  if (confirm('Es-tu sûr de vouloir supprimer ce profil ?')) {
    profileStore.deleteProfile(profileId)
    loadProfiles()
  }
}

onMounted(() => {
  loadProfiles()
  setTimeout(() => nameInput.value?.focus(), 100)
})
</script>

<style scoped>
.profile-selection {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 1.5rem;
  border-radius: 12px;
}

.welcome-header h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.welcome-header p {
  color: #666;
  font-size: 1.1rem;
}

.profiles-list {
  margin-bottom: 2rem;
}

.profiles-list h2 {
  color: #667eea;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.profile-cards {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.profile-level {
  margin: 0.25rem 0 0 0;
  color: #667eea;
  font-weight: 600;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0.5rem;
}

.delete-btn:hover {
  opacity: 1;
}

.create-profile {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.create-profile h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #764ba2;
}

.level-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.level-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
}

.level-btn:hover {
  background: #667eea15;
}

.level-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.btn-create {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .welcome-header h1 {
    font-size: 1.5rem;
  }
  
  .profile-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}
</style>
