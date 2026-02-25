<template>
  <q-layout view="lHh LpR lff" class="main-layout">
    
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

    <!-- ===== CONTEÚDO PRINCIPAL ===== -->
    <q-page-container class="page-container">
      
      <!-- Header / Topbar -->
      <header class="main-header">
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
          </nav>
        </div>

        <div class="header-right">
          <!-- Botões de Ação Rápida -->
          <q-btn
            v-if="hasRecords"
            unelevated
            class="soft-btn soft-btn-primary"
            icon="file_download"
            label="Exportar"
            to="/export"
          />
        </div>
      </header>

      <!-- Página -->
      <router-view />
      
    </q-page-container>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { loadBrandColor } from 'src/utils/brand'
import AppSidebar from 'src/components/AppSidebar.vue'
// Se utilizarmos Pinia depois, importamos a store aqui para ver se tem registros (hasRecords).

export default defineComponent({
  name: 'MainLayout',

  components: {
    AppSidebar
  },

  setup() {
    const route = useRoute()

    // ===== SIDEBAR =====
    const sidebarOpen = ref(true)

    const menuItems = [
      { path: '/', label: 'Upload' },
      { path: '/records', label: 'Registros' },
      { path: '/validation', label: 'Validação' },
      { path: '/export', label: 'Exportar' },
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
    const isDark = ref(false)

    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }

    const toggleTheme = () => {
      isDark.value = !isDark.value
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      applyTheme()
      loadBrandColor()
    }

    onMounted(() => {
      // Load theme
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
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
      hasRecords
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
