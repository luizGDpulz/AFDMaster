<!--
  Copyright (C) 2026 Luiz Gustavo Dias Pulz
  SPDX-License-Identifier: GPL-3.0-or-later

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see https://www.gnu.org/licenses/.
-->

<template>
  <q-page class="fade-in q-px-lg q-pt-sm q-pb-md">
    
    <!-- Cabeçalho da Página -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold row items-center">
        <q-icon name="menu_book" class="q-mr-sm text-primary" /> {{ pageTitle }}
      </div>
    </div>

    <!-- Container Principal de Cards / Documento -->
    <q-card 
      flat 
      bordered 
      class="soft-card doc-container"
    >
      <transition name="fade" mode="out-in">
        <!-- View Nível 0: Pastas Principais -->
        <div v-if="currentView === 'folders'" key="folders" class="row q-col-gutter-md fixed-container q-pa-md">
          <div class="col-12 col-sm-6 col-md-4" v-for="folder in folders" :key="folder.id">
            <q-card class="soft-card folder-card cursor-pointer q-hoverable" v-ripple @click="openFolder(folder)">
              <q-card-section class="column items-center q-pa-xl text-center">
                <q-icon :name="folder.icon" size="64px" :color="folder.color || 'primary'" class="q-mb-md opacity-80" />
                <div class="text-h6 text-weight-bold">{{ folder.title }}</div>
                <div class="text-caption text-grey q-mt-sm">{{ folder.description }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- View Nível 1: Arquivos da Pasta -->
        <div v-else-if="currentView === 'files'" key="files" class="full-width fixed-container q-pa-md">
           <div class="row items-center q-mb-md">
              <q-btn flat dense icon="arrow_back" color="primary" label="Voltar" @click="goBack" class="q-mr-md" />
           </div>
           
           <div class="row q-col-gutter-md">
             <div class="col-12 col-sm-6 col-md-4" v-for="file in activeFolder?.files" :key="file.id">
               <q-card class="soft-card file-card cursor-pointer q-hoverable" v-ripple @click="openFile(file)">
                 <q-card-section class="row items-center q-pa-md">
                   <q-icon :name="file.icon || 'description'" size="40px" color="secondary" class="q-mr-md" />
                   <div>
                     <div class="text-subtitle1 text-weight-bold">{{ file.title }}</div>
                   </div>
                 </q-card-section>
               </q-card>
             </div>
           </div>
        </div>

        <!-- View Nível 2: Leitura do Arquivo (Markdown) -->
        <div v-else-if="currentView === 'document'" key="document" class="doc-panel full-width q-pa-none">
           <!-- Exemplo de Sticky Header com Sombra -->
           <div class="row items-center justify-between q-mb-md q-pa-md sticky-doc-header">
              <q-btn flat dense icon="arrow_back" color="primary" label="Voltar para a Pasta" @click="goBackToFileList" />
              
              <div class="row items-center">
                 <q-btn 
                   flat 
                   outline
                   dense 
                   icon="picture_as_pdf" 
                   color="negative" 
                   label="Download PDF" 
                   class="q-mr-sm q-px-sm"
                   :disable="!activeFile?.pdfUrl"
                   :href="activeFile?.pdfUrl"
                   target="_blank"
                 >
                   <q-tooltip v-if="!activeFile?.pdfUrl">PDF indisponível para este documento</q-tooltip>
                   <q-tooltip v-else>Baixar PDF Original</q-tooltip>
                 </q-btn>
                 
                 <q-btn 
                   flat 
                   round 
                   dense 
                   :icon="docTheme === 'dark' ? 'light_mode' : 'dark_mode'" 
                   color="primary" 
                   @click="toggleDocTheme"
                 >
                   <q-tooltip>Alternar tema do documento</q-tooltip>
                 </q-btn>
              </div>
           </div>

           <div v-if="activeFile?.loading" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="40px" />
           </div>
           <div v-else-if="activeFile?.error" class="text-negative text-center q-pa-xl">
              <q-icon name="error_outline" size="48px" />
              <div class="text-h6 q-mt-md">Falha ao carregar documento</div>
              <div>{{ activeFile?.filename }}</div>
           </div>
           <div v-else class="markdown-body" :class="`doc-${docTheme}`" v-html="activeFile?.htmlContent"></div>
        </div>
      </transition>

    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { marked } from 'marked'

export default defineComponent({
  name: 'DocsPage',
  setup() {
    const store = useAfdStore()

    // O controller da view atual
    // Valores: 'folders' | 'files' | 'document'
    const currentView = ref('folders')
    const activeFolder = ref(null)
    const activeFile = ref(null)
    const docTheme = ref('light') // Tema local do documento

    // Estrutura de dados modular
    const folders = ref([
       {
          id: 'portaria_671',
          title: 'Portaria 671',
          description: 'Arquivos, manuais e formatos da Portaria MTP 671/2021',
          icon: 'folder_open',
          color: 'primary',
          files: [
             { id: 'md_671', title: 'Manual AFD 671', filename: 'ManualAFD671.md', pdfUrl: './docs/pdf/layout_afd_671.pdf', icon: 'article', htmlContent: '', loading: false, error: false },
             { id: 'md_tipos', title: 'Tipos de REP (671)', filename: 'TiposAFD671.md', icon: 'account_tree', htmlContent: '', loading: false, error: false },
             { id: 'md_crc', title: 'Cálculo CRC', filename: 'CalculoDoCRC.md', icon: 'calculate', htmlContent: '', loading: false, error: false }
          ]
       },
       {
          id: 'portaria_1510',
          title: 'Portaria 1510',
          description: 'Manuais da Portaria MTE 1510/2009 e estruturas de AFD legadas',
          icon: 'folder_special',
          color: 'secondary',
          files: [
             { id: 'md_1510', title: 'Manual AFD 1510', filename: 'ManualAFD1510.md', icon: 'article', htmlContent: '', loading: false, error: false },
             { id: 'md_portaria', title: 'Portaria 1510 Completa', filename: 'Portaria_1510_2009.md', icon: 'gavel', htmlContent: '', loading: false, error: false }
          ]
       }
    ])

    const pageTitle = computed(() => {
       if (currentView.value === 'document' && activeFile.value) {
          return activeFile.value.title;
       } else if (currentView.value === 'files' && activeFolder.value) {
          return activeFolder.value.title;
       }
       return 'Documentação & Manuais';
    });

    // Monitora as mudanças do store (quando no header clica no breadcrumb)
    watch(() => store.docsBreadcrumbs, (newVal) => {
       if (!newVal || newVal.length === 0) {
          currentView.value = 'folders'
          activeFolder.value = null
          activeFile.value = null
       }
    }, { deep: true })

    const openFolder = (folder) => {
       activeFolder.value = folder
       currentView.value = 'files'
       
       // Atualiza a navegação
       store.setDocsBreadcrumbs([
          { 
            label: folder.title, 
            action: () => {
               currentView.value = 'files'
               activeFile.value = null
               store.setDocsBreadcrumbs([store.docsBreadcrumbs[0]]) // mantem só a pasta
            }
          }
       ])
    }

    const openFile = async (file) => {
       activeFile.value = file
       currentView.value = 'document'
       
       // Reseta o tema do markdown para o padrão global quando abre um arquivo
       docTheme.value = store.isDark ? 'dark' : 'light'
       
       // Adiciona no breadcrumb
       const bcs = [...store.docsBreadcrumbs] // Pega o bc atual (pasta)
       if(bcs.length === 1) {
          bcs.push({ label: file.title, action: null })
       } else {
          bcs[1] = { label: file.title, action: null }
       }
       store.setDocsBreadcrumbs(bcs)

       // Fetch do conteudo sob demanda (lazy load)
       if (!file.htmlContent && !file.error) {
          file.loading = true
          const docsBaseUrl = './docs/'
          try {
             const res = await fetch(`${docsBaseUrl}${file.filename}?t=${Date.now()}`)
             if (!res.ok) throw new Error('Not found')
             const mdText = await res.text()
             file.htmlContent = marked.parse(mdText)
          } catch (e) {
             console.error(`Error loading ${file.filename}:`, e)
             file.error = true
          } finally {
             file.loading = false
          }
       }
    }

    const goBack = () => {
       store.clearDocsBreadcrumbs() // O watcher de docsBreadcrumbs cuidará de voltar pros folders
    }

    const goBackToFileList = () => {
       if (activeFolder.value) {
          store.docsBreadcrumbs[0].action() // Dispara a action do Nível 1 p/ voltar a lista de arquivos
       } else {
          goBack()
       }
    }

    onMounted(() => {
       // Quando a tela monta, garante que começa limpo caso venha de outra tela
       if(store.docsBreadcrumbs.length === 0) {
          currentView.value = 'folders'
       } else {
           // Resumes view from store if navigating back to docs, simplistic approach is reset for now
           store.clearDocsBreadcrumbs()
       }
    })

    onUnmounted(() => {
       store.clearDocsBreadcrumbs()
    })

    const toggleDocTheme = () => {
       docTheme.value = docTheme.value === 'dark' ? 'light' : 'dark'
    }

    return {
      folders,
      currentView,
      activeFolder,
      activeFile,
      pageTitle,
      docTheme,
      openFolder,
      openFile,
      goBack,
      goBackToFileList,
      toggleDocTheme
    }
  }
})
</script>

<style lang="scss">
/* Estilos para os Cards */
.doc-container {
   min-height: calc(100vh - 125px);
   display: flex;
   flex-direction: column;
}

.fixed-container {
   flex-grow: 1;
}

.folder-card, .file-card {
   transition: transform 0.2s, box-shadow 0.2s;
   border-radius: 12px;
   background: var(--qm-bg-primary);
   border: 1px solid var(--qm-border);
}

.folder-card:hover, .file-card:hover {
   transform: translateY(-4px);
   box-shadow: 0 10px 20px rgba(0,0,0,0.1);
   border-color: var(--qm-primary);
}

.opacity-80 {
   opacity: 0.8;
}

/* Transições de Fade entre Views */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos globais para o conteúdo injetado via v-html */
.doc-panel {
   background-color: transparent;
   position: relative;
}

/* Exemplo Prático daquele sombreamento de header discutido! */
.sticky-doc-header {
   position: sticky;
   top: 0;
   z-index: 10;
   background: var(--qm-surface);
   box-shadow: 0 4px 10px rgba(0,0,0,0.05); /* Sombra apontando para BAIXO (Y = 4px) */
   border-bottom: 1px solid var(--qm-border);
   border-top-left-radius: 1.25rem;
   border-top-right-radius: 1.25rem;
}

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  padding: 16px 32px;
  background: white;
  border-radius: 12px;
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: background-color 0.3s ease, color 0.3s ease;

  &.doc-dark {
     background: #1e1e1e;
     color: #e0e0e0;
     h1, h2, h3, h4, th, strong {
        color: #fff;
     }
     table { border-color: #333; }
     th, td { border-color: #333; }
     pre, code { background: #2d2d2d; border-color: #444; }
  }

  h1, h2, h3 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  
  h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 32px; }
  
  p { margin-top: 0; margin-bottom: 16px; }
  
  ul, ol { padding-left: 2em; margin-bottom: 16px; }
  
  table {
    display: block;
    width: 100%;
    overflow: auto;
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 16px;
    
    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    
    th {
      font-weight: 600;
      background-color: rgba(0,0,0,0.05);
      color: inherit;
    }
    
    tr:nth-child(2n) {
      background-color: rgba(0,0,0,0.02);
    }
  }

  &.doc-dark table tr:nth-child(2n) {
     background-color: rgba(255,255,255,0.02);
  }

  &.doc-dark table th {
     background-color: rgba(255,255,255,0.05);
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    color: inherit;
  }

  pre {
    word-wrap: normal;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    color: #333;
    
    code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
  }

  &.doc-dark pre {
     color: #e0e0e0;
  }
  
  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
  }
}
</style>
