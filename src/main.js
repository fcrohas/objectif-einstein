import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import LevelView from './views/LevelView.vue'
import SubjectSelection from './views/SubjectSelection.vue'
import ExercisesView from './views/ExercisesView.vue'
import ProgressDashboard from './components/ProgressDashboard.vue'

const router = createRouter({
  history: createWebHistory('/objectif-einstein/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/niveau/:level',
      name: 'Level',
      component: LevelView,
      props: true
    },
    {
      path: '/niveau/:level/matières',
      name: 'SubjectSelection',
      component: SubjectSelection,
      props: true
    },
    {
      path: '/niveau/:level/:subject',
      name: 'Exercises',
      component: ExercisesView,
      props: true
    },
    {
      path: '/progression',
      name: 'Progress',
      component: ProgressDashboard
    }
  ]
})

createApp(App).use(router).mount('#app')
