<template>
  <div class="sidebar-content">
    
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">
        <q-icon name="document_scanner" size="48px" :color="isDark ? 'white' : 'black'" />
        <span class="logo-text">AFDMaster</span>
      </div>
    </div>

    <!-- Menu de Navegação -->
    <q-list class="nav-list">
      
      <q-item
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        clickable
        v-ripple
        :class="{ 'nav-item-active': isActive(item.path) }"
        class="nav-item"
      >
        <q-item-section avatar>
          <div class="nav-icon-wrapper" :class="{ 'active': isActive(item.path) }">
            <q-icon :name="item.icon" size="20px" />
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label class="nav-label">{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>

    <!-- Spacer -->
    <div class="sidebar-spacer"></div>

    <!-- Footer Settings & Theme -->
    <div class="sidebar-footer">
      <!-- Toggle Tema -->
      <button class="theme-toggle-btn" @click="$emit('toggle-theme')">
        <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" size="18px" />
        <span>{{ isDark ? 'Modo Claro' : 'Modo Escuro' }}</span>
      </button>
    </div>

  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'AppSidebar',

  props: {
    isDark: {
      type: Boolean,
      default: false
    }
  },

  emits: ['toggle-theme'],

  setup() {
    const route = useRoute()

    const menuItems = [
      { path: '/', label: 'Analisar AFD', icon: 'analytics' },
      { path: '/settings', label: 'Configurações', icon: 'settings' }
    ]

    const isActive = (path) => {
      if (path === '/') {
        return route.path === '/'
      }
      return route.path.startsWith(path)
    }

    return {
      menuItems,
      isActive
    }
  }
})
</script>

<style lang="scss" scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Permite que o container bata no chão da tela */
  padding: 1rem;
  background: transparent;
}

// ===== HEADER/LOGO =====
.sidebar-header {
  padding: 0 0.5rem;
  margin-bottom: 2rem;
  margin-top: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: column;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--qm-text-primary);
  margin-top: 0.5rem;
}

// ===== NAVEGAÇÃO =====
.nav-list {
  padding: 0;
}

.nav-item {
  border-radius: 0.75rem;
  margin-bottom: 0.25rem;
  padding: 0.75rem 1rem;
  min-height: auto;
  transition: all 0.2s ease;

  &:hover {
    background: var(--qm-surface);
    box-shadow: var(--qm-shadow-sm);
  }

  &.nav-item-active {
    background: var(--qm-surface);
    box-shadow: var(--qm-shadow);
  }
}

.nav-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--qm-bg-tertiary);
  color: var(--qm-text-secondary);
  transition: all 0.2s ease;

  &.active {
    background: var(--qm-brand);
    color: var(--qm-brand-contrast);
  }
}

.nav-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--qm-text-secondary);
}

.nav-item-active .nav-label {
  color: var(--qm-text-primary);
  font-weight: 600;
}

// ===== FOOTER =====
.sidebar-spacer {
  flex: 1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// ===== TOGGLE TEMA =====
.theme-toggle-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: none;
  background: var(--qm-surface);
  color: var(--qm-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: var(--qm-shadow-sm);

  &:hover {
    box-shadow: var(--qm-shadow);
  }
}
</style>
