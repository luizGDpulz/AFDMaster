<template>
  <q-page class="fade-in q-px-lg q-pt-sm q-pb-xs column">
    
    <!-- Cabeçalho da Página -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold row items-center">
        <q-icon name="menu_book" class="q-mr-sm text-primary" /> Documentação & Manuais
      </div>
    </div>

    <!-- Container Principal com Tabs -->
    <q-card flat bordered class="soft-card col column">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="md_1510" label="Portaria 1510 (Resumo)" icon="article" />
        <q-tab name="md_671" label="Portaria 671 (Resumo)" icon="article" />
        <q-tab name="md_tipos" label="Tipos de REP (671)" icon="account_tree" />
        <q-tab name="md_crc" label="Cálculo CRC" icon="calculate" />
        <q-tab name="md_portaria" label="Portaria 1510 (Completo)" icon="gavel" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="col scroll q-pa-md doc-panel">
        <q-tab-panel v-for="doc in documents" :key="doc.id" :name="doc.id">
           <div v-if="doc.loading" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="40px" />
           </div>
           <div v-else-if="doc.error" class="text-negative text-center q-pa-xl">
              <q-icon name="error_outline" size="48px" />
              <div class="text-h6 q-mt-md">Falha ao carregar documento</div>
              <div>O arquivo {{ doc.filename }} não foi encontrado.</div>
           </div>
           <div v-else class="markdown-body" v-html="doc.htmlContent"></div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { marked } from 'marked'

export default defineComponent({
  name: 'DocsPage',
  setup() {
    const tab = ref('md_1510')

    const documents = ref({
       md_1510:   { id: 'md_1510', filename: 'ManualAFD1510.md', htmlContent: '', loading: true, error: false },
       md_671:    { id: 'md_671', filename: 'ManualAFD671.md', htmlContent: '', loading: true, error: false },
       md_tipos:  { id: 'md_tipos', filename: 'TiposAFD671.md', htmlContent: '', loading: true, error: false },
       md_crc:    { id: 'md_crc', filename: 'CRC_CALCULO.md', htmlContent: '', loading: true, error: false },
       md_portaria: { id: 'md_portaria', filename: 'Portaria_1510_2009.md', htmlContent: '', loading: true, error: false }
    })

    const fetchDocuments = async () => {
       // Em modo dev/produção com Vite, recursos estáticos fora da src precisam
       // ser servidos ou importados. Assumindo que moveremos/copiaremos eles para /public/docs
       const docsBaseUrl = '/docs/' // Ajustaremos para ler da public folder
       
       for (const key in documents.value) {
          const doc = documents.value[key]
          try {
             // Opcional: Adicionar um timestamp para evitar cache no dev mode
             const res = await fetch(`${docsBaseUrl}${doc.filename}?t=${Date.now()}`)
             if (!res.ok) throw new Error('Not found')
             const mdText = await res.text()
             doc.htmlContent = marked.parse(mdText)
          } catch (e) {
             console.error(`Error loading ${doc.filename}:`, e)
             doc.error = true
          } finally {
             doc.loading = false
          }
       }
    }

    onMounted(() => {
        fetchDocuments()
    })

    return {
      tab,
      documents
    }
  }
})
</script>

<style lang="scss">
/* Estilos globais para o conteúdo injetado via v-html. 
   Evitar <style scoped> senão o Vue não estiliza tags injetadas dinamicamente. */
.doc-panel {
   background-color: var(--qm-bg-secondary);
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

  @media (prefers-color-scheme: dark) {
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
    }
    
    tr:nth-child(2n) {
      background-color: rgba(0,0,0,0.02);
    }
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  }

  pre {
    word-wrap: normal;
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 6px;
    
    code {
      background: transparent;
      padding: 0;
    }
  }
  
  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
  }
}
</style>
