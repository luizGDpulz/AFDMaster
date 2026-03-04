<template>
  <q-page class="fade-in q-px-lg q-pt-sm q-pb-xs column">
    <!-- Header/Toolbar -->
    <div class="row items-center q-mb-sm">
      <div class="text-h5 text-weight-bold row items-center">
        <q-icon name="analytics" class="q-mr-sm text-primary" /> Analisar AFD
      </div>
      <q-space />
      <q-btn
        color="primary"
        icon="upload_file"
        label="Importar AFD"
        unelevated
        class="soft-btn soft-btn-primary"
        @click="uploadModal = true"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!store.hasRecords" class="flex flex-center q-pa-xl" style="height: 60vh;">
      <div class="text-center text-grey-6">
        <q-icon name="document_scanner" size="64px" class="q-mb-md" />
        <div class="text-h6 text-weight-bold">Nenhum arquivo em análise</div>
        <div class="text-subtitle1 q-mt-sm">Clique em "Importar AFD" no topo para começar.</div>
      </div>
    </div>

    <!-- Data State -->
    <div v-else>
      <q-card flat bordered class="soft-card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey q-my-sm"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="records" class="rounded-pill q-mx-sm" icon="table_view" label="Registros" />
          <q-tab name="validation" class="rounded-pill q-mx-sm" icon="rule" label="Validações" />
          <q-tab name="export" class="rounded-pill q-mx-sm" icon="file_download" label="Exportar" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Aba Registros -->
          <q-tab-panel name="records" class="q-pa-none">
            <AfdTable />
          </q-tab-panel>

          <!-- Aba Validações -->
          <q-tab-panel name="validation">
            <ValidationReport @filter-error="handleFilterError" />
          </q-tab-panel>

          <!-- Aba Exportar -->
          <q-tab-panel name="export">
            <div class="q-pa-md text-center">
              <div class="text-h6 q-mb-md">Configurações de Exportação</div>
               <q-toggle
                  v-model="store.settings.reindexNsrExport"
                  label="Reindexar NSR (Recalcular do 1 até o fim)"
                  color="primary"
                  class="q-mb-md"
               />
               <br />
               <q-btn
                  color="primary"
                  icon="save_alt"
                  label="Baixar Arquivo AFD Editado"
                  unelevated
                  class="soft-btn soft-btn-primary q-mt-md"
                  @click="downloadFile"
               />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- Upload Modal -->
    <q-dialog v-model="uploadModal">
       <q-card style="min-width: 400px" class="soft-card rounded-xl">
         <q-card-section class="row items-center q-pb-none">
           <div class="text-h6">Selecione o AFD</div>
           <q-space />
           <q-btn icon="close" flat round dense v-close-popup />
         </q-card-section>
         <q-card-section>
            <UploadAFD @file-processing="onFileProcessingStart" @file-processed="onFileProcessed" />
         </q-card-section>
       </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useQuasar } from 'quasar'
import { useGenerator } from 'src/composables/useGenerator'
import UploadAFD from 'src/components/UploadAFD.vue'
import AfdTable from 'src/components/AfdTable.vue'
import ValidationReport from 'src/components/ValidationReport.vue'

export default defineComponent({
  name: 'AnalyzePage',
  components: { UploadAFD, AfdTable, ValidationReport },
  setup() {
    const store = useAfdStore()
    const tab = ref('records')
    
    // Mapeamento para o Breadcrumb do Layout
    const tabLabels = { records: 'Registros', validation: 'Validações', export: 'Exportar' }
    watch(tab, (newVal) => {
       store.activeTabName = tabLabels[newVal]
    }, { immediate: true })

    const uploadModal = ref(false)
    const $q = useQuasar()
    const { generateFileContent } = useGenerator()

    const handleFilterError = (errorMsg) => {
       store.setFilters({
          search: errorMsg,
          onlyErrors: true,
          type: null // Remove qualquer filtro de tipo ativo para não bloquear resultados
       })
       tab.value = 'records'
    }

    const onFileProcessingStart = () => {
      // Don't close the modal yet, just notify so the user knows it's doing something
      $q.notify({ type: 'info', message: 'Lendo arquivo...', timeout: 1000 })
    }

    const onFileProcessed = () => {
      uploadModal.value = false
      tab.value = 'records'
    }

    const downloadFile = () => {
       try {
          const content = generateFileContent(store.records, store.portaria, { reindexNsr: store.settings.reindexNsrExport })
          
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `exported_afd_${store.portaria}_${Date.now()}.txt`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          $q.notify({ type: 'positive', message: 'Download iniciado com sucesso!' })
       } catch (err) {
          $q.notify({ type: 'negative', message: 'Erro ao gerar arquivo: ' + err.message })
       }
    }

    onMounted(() => {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    })

    onUnmounted(() => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    })

    return {
      store,
      tab,
      uploadModal,
      onFileProcessingStart,
      onFileProcessed,
      downloadFile,
      handleFilterError
    }
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--qm-border);
}
</style>
