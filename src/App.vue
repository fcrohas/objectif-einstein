<template>
  <div id="app">
    <header class="header">
      <nav class="nav-container">
        <router-link to="/" class="logo">
          <h1>🎓 Objectif Einstein</h1>
        </router-link>
      </nav>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>&copy; 2025 Objectif Einstein - Apprendre en s'amusant !</p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  text-decoration: none;
  color: white;
  display: inline-block;
}

.logo h1 {
  margin: 0;
  font-size: 2rem;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
}

.footer p {
  color: #666;
  margin: 0;
}
</style>
