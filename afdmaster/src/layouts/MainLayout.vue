<template>
  <q-layout :view="layoutView" class="main-layout">
    
    <!-- ===== SIDEBAR (Menu Lateral) ===== -->
    <q-drawer
      v-model="sidebarOpen"
      :width="260"
      :breakpoint="1024"
      show-if-above
      :bordered="false"
      :elevated="false"
      class="sidebar"
    >
      <AppSidebar
        :is-dark="isDark"
        @toggle-theme="toggleTheme"
      />
    </q-drawer>

    <!-- ===== HEADER / TOPBAR ===== -->
    <q-header class="main-header">
      <div class="header-left">
        <!-- Botão Menu Mobile -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="menu-btn"
          @click="sidebarOpen = !sidebarOpen"
        />
        
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs">
          <span class="breadcrumb-item">AFDMaster</span>
          <q-icon name="chevron_right" size="18px" class="breadcrumb-separator" />
          <span class="breadcrumb-current">{{ currentPageTitle }}</span>
          <template v-if="currentPageTitle === 'Analisar AFD' && store.activeTabName">
             <q-icon name="chevron_right" size="18px" class="breadcrumb-separator" />
             <span class="breadcrumb-current text-primary">{{ store.activeTabName }}</span>
          </template>
        </nav>
      </div>
    </q-header>

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <q-page-container class="page-container">
      
      <!-- Página -->
      <router-view />
      
    </q-page-container>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAfdStore } from 'src/stores/afdStore'
import { loadBrandColor } from 'src/utils/brand'
import AppSidebar from 'src/components/AppSidebar.vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    AppSidebar
  },

  setup() {
    const route = useRoute()
    const store = useAfdStore()

    const layoutView = computed(() => {
      // Se na página de docs, o header acompanha o scroll (lhh)
      // Nas outras, o header fica fixo (lHh)
      return route.path.startsWith('/docs') ? 'lhh LpR lff' : 'lHh LpR lff'
    })

    // ===== SIDEBAR =====
    const sidebarOpen = ref(true)

    const menuItems = [
      { path: '/', label: 'Analisar AFD' },
      { path: '/docs', label: 'Documentação' },
      { path: '/settings', label: 'Configurações' }
    ]

    const currentPageTitle = computed(() => {
      const currentItem = menuItems.find(item => {
        if (item.path === '/') {
          return route.path === '/'
        }
        return route.path.startsWith(item.path)
      })
      return currentItem?.label || 'Início'
    })

    // ===== THEME =====
    const isDark = computed(() => store.isDark)

    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', store.isDark ? 'dark' : 'light')
    }

    const toggleTheme = () => {
      store.isDark = !store.isDark
      localStorage.setItem('theme', store.isDark ? 'dark' : 'light')
      applyTheme()
      loadBrandColor()
    }

    onMounted(() => {
      // Load theme
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        store.isDark = savedTheme === 'dark'
      } else {
        store.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
      loadBrandColor()
    })

    // ===== STATE MOCK =====
    const hasRecords = ref(false) // placeholder to show export button globally if needed

    return {
      sidebarOpen,
      currentPageTitle,
      isDark,
      toggleTheme,
      hasRecords,
      store,
      layoutView
    }
  }
})
</script>

<style lang="scss" scoped>
// ===== MAIN LAYOUT =====
.main-layout {
  background: var(--qm-bg-secondary);
}

// ===== SIDEBAR =====
.sidebar {
  border: none !important;
  box-shadow: none !important;
}

// ===== PAGE CONTAINER =====
.page-container {
  background: var(--qm-bg-secondary);
}

// ===== HEADER =====
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: transparent;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  color: var(--qm-text-secondary);
  
  @media (min-width: 1024px) {
    display: none;
  }
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-item {
  font-size: 0.875rem;
  color: var(--qm-text-muted);
}

.breadcrumb-separator {
  color: var(--qm-text-muted);
}

.breadcrumb-current {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--qm-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
