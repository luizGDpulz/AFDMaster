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
          <q-tab name="editor" class="rounded-pill q-mx-sm" icon="edit_document" label="Edição/Lote" />
          <q-tab name="export" class="rounded-pill q-mx-sm" icon="file_download" label="Exportar" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated keep-alive>
          <!-- Aba Registros -->
          <q-tab-panel name="records" class="q-pa-none">
            <AfdTable />
          </q-tab-panel>

          <!-- Aba Validações -->
          <q-tab-panel name="validation">
            <ValidationReport @filter-error="handleFilterError" @filter-warning="handleFilterWarning" />
          </q-tab-panel>

          <!-- Aba Edição Lote -->
          <q-tab-panel name="editor">
            <AfdAdvancedEditor />
          </q-tab-panel>

          <!-- Aba Exportar -->
          <q-tab-panel name="export">
            <div class="q-pa-md">
              <div class="text-h6 q-mb-md text-center">Filtros de Exportação do AFD</div>
              
              <div class="row q-col-gutter-md q-mb-md justify-center">
                 <div class="col-12 col-md-5">
                    <q-card class="soft-card" flat bordered>
                       <q-card-section>
                          <div class="text-subtitle2 q-mb-sm text-primary">Intervalo de Data</div>
                          <div class="row q-col-gutter-sm">
                             <div class="col-6">
                                <q-input dense outlined v-model="exportFilters.dateStart" type="date" label="A Partir De" class="soft-input bg-white" />
                             </div>
                             <div class="col-6">
                                <q-input dense outlined v-model="exportFilters.dateEnd" type="date" label="Até" class="soft-input bg-white" />
                             </div>
                          </div>
                       </q-card-section>
                    </q-card>
                 </div>
                 <div class="col-12 col-md-5">
                    <q-card class="soft-card" flat bordered>
                       <q-card-section>
                          <div class="text-subtitle2 q-mb-sm text-warning-dark">Intervalo de NSR</div>
                          <div class="row q-col-gutter-sm">
                             <div class="col-6">
                                <q-input dense outlined v-model.number="exportFilters.nsrStart" type="number" label="NSR Mínimo" class="soft-input bg-white" />
                             </div>
                             <div class="col-6">
                                <q-input dense outlined v-model.number="exportFilters.nsrEnd" type="number" label="NSR Máximo" class="soft-input bg-white" />
                             </div>
                          </div>
                       </q-card-section>
                    </q-card>
                 </div>
              </div>

              <div class="text-center">
                 <q-toggle
                    v-model="store.settings.reindexNsrExport"
                    label="Reindexar NSR (Forçar recalculo sequencial no arquivo final)"
                    color="primary"
                    class="q-mb-md text-weight-medium"
                 />
                 <br />
                 <q-btn
                    color="primary"
                    icon="save_alt"
                    label="Baixar Arquivo AFD Editado"
                    size="lg"
                    unelevated
                    class="soft-btn soft-btn-primary q-mt-md"
                    @click="downloadFile"
                 />
              </div>
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
import AfdAdvancedEditor from 'src/components/AfdAdvancedEditor.vue'

export default defineComponent({
  name: 'AnalyzePage',
  components: { UploadAFD, AfdTable, ValidationReport, AfdAdvancedEditor },
  setup() {
    const store = useAfdStore()
    const tab = ref('records')
    
    // Mapeamento para o Breadcrumb do Layout
    const tabLabels = { records: 'Registros', validation: 'Validações', export: 'Exportar', editor: 'Edição Avançada' }
    watch(tab, (newVal) => {
       store.activeTabName = tabLabels[newVal]
    }, { immediate: true })

    const uploadModal = ref(false)
    const $q = useQuasar()
    const { generateFileContent } = useGenerator()

    const handleFilterError = (errorMsg) => {
       store.setFilters({
          search: errorMsg,
          status: 'errors',
          type: null // Remove qualquer filtro de tipo ativo para não bloquear resultados
       })
       tab.value = 'records'
    }

    const handleFilterWarning = (warnMsg) => {
       store.setFilters({
          search: warnMsg,
          status: 'warnings',
          type: null
       })
       tab.value = 'records'
    }

    const exportFilters = ref({
       dateStart: '',
       dateEnd: '',
       nsrStart: null,
       nsrEnd: null
    })

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
          $q.loading.show({ message: 'Preparando exportação...' })

          setTimeout(() => {
             // 1. Filtrar a base na Memória antes de gerar o Export String
             let dataset = store.records
             
             if (exportFilters.value.dateStart) {
                const sd = new Date(exportFilters.value.dateStart + 'T00:00:00')
                dataset = dataset.filter(r => r.dataHora && r.dataHora >= sd)
             }
             if (exportFilters.value.dateEnd) {
                const ed = new Date(exportFilters.value.dateEnd + 'T23:59:59')
                dataset = dataset.filter(r => r.dataHora && r.dataHora <= ed)
             }
             if (exportFilters.value.nsrStart !== null && exportFilters.value.nsrStart !== '') {
                const ns = Number(exportFilters.value.nsrStart)
                dataset = dataset.filter(r => r.nsr && Number(r.nsr) >= ns)
             }
             if (exportFilters.value.nsrEnd !== null && exportFilters.value.nsrEnd !== '') {
                const ne = Number(exportFilters.value.nsrEnd)
                dataset = dataset.filter(r => r.nsr && Number(r.nsr) <= ne)
             }

             if (dataset.length === 0) {
                 $q.loading.hide()
                 return $q.notify({ type: 'warning', message: 'Os filtros informados excluíram todos os registros. O AFD exportado estaria vazio.' })
             }

             const content = generateFileContent(dataset, store.portaria, { reindexNsr: store.settings.reindexNsrExport })
             
             const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
             const url = URL.createObjectURL(blob)
             const link = document.createElement('a')
             link.href = url
             link.download = `exported_afd_${store.portaria}_${Date.now()}.txt`
             document.body.appendChild(link)
             link.click()
             document.body.removeChild(link)
             URL.revokeObjectURL(url)

             $q.loading.hide()
             $q.notify({ type: 'positive', message: `${dataset.length} registros exportados com sucesso!` })
          }, 50)
       } catch (err) {
          $q.loading.hide()
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
      handleFilterError,
      handleFilterWarning,
      exportFilters
    }
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid var(--qm-border);
}
</style>
