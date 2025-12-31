import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import LevelView from './views/LevelView.vue'

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
    }
  ]
})

createApp(App).use(router).mount('#app')
