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
       <div class="text-center text-primary">
         <img :src="store.isDark ? '/app-logo-dark.svg' : '/app-logo.svg'" style="width: 128px; height: 128px; opacity: 1;" class="q-mb-md" alt="Logo AFDMaster" />
         <div class="text-h6 text-weight-bold">Nenhum arquivo em análise</div>
         <div class="text-subtitle1 q-mt-sm">Clique em "Importar AFD" no topo para começar.</div>
       </div>
    </div>

    <!-- Data State -->
    <div v-else class="full-width">
      <q-card flat bordered class="soft-card analyze-container">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey q-my-sm"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="records" class="q-mx-sm" icon="table_view" label="Registros" />
          <q-tab name="validation" class="q-mx-sm" icon="rule" label="Validações" />
          <q-tab name="editor" class="q-mx-sm" icon="edit_document" label="Edição" />
          <q-tab name="export" class="q-mx-sm" icon="file_download" label="Exportar" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated keep-alive class="col" style="background: transparent;">
          <!-- Aba Registros -->
          <q-tab-panel name="records" class="q-pa-none flex column custom-scrolling-panel">
            <AfdTable class="col" />
          </q-tab-panel>

          <!-- Aba Validações -->
          <q-tab-panel name="validation" class="flex column custom-scrolling-panel q-pa-none">
            <ValidationReport class="col" @filter-error="handleFilterError" @filter-warning="handleFilterWarning" />
          </q-tab-panel>

          <!-- Aba Edição Lote -->
          <q-tab-panel name="editor" class="flex column custom-scrolling-panel q-pa-none">
            <AfdAdvancedEditor class="col" />
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
                                <q-input dense outlined v-model="exportFilters.dateStart" type="date" label="A Partir De" class="soft-input" />
                             </div>
                             <div class="col-6">
                                <q-input dense outlined v-model="exportFilters.dateEnd" type="date" label="Até" class="soft-input" />
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
                                <q-input dense outlined v-model.number="exportFilters.nsrStart" type="number" label="NSR Mínimo" class="soft-input" />
                             </div>
                             <div class="col-6">
                                <q-input dense outlined v-model.number="exportFilters.nsrEnd" type="number" label="NSR Máximo" class="soft-input" />
                             </div>
                          </div>
                       </q-card-section>
                    </q-card>
                 </div>
              </div>

              <div class="text-center">
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
    const tabLabels = { records: 'Registros', validation: 'Validações', export: 'Exportar', editor: 'Edição' }
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
          const hasEdits = store.records.some(r => r.alterado)
          const ef = exportFilters.value
          const hasFilters = !!(ef.dateStart || ef.dateEnd ||
                               (ef.nsrStart !== null && ef.nsrStart !== '') ||
                               (ef.nsrEnd !== null && ef.nsrEnd !== ''))

          if (!hasEdits && !hasFilters && !store.settings.reindexNsrExport) {
             return $q.notify({
                type: 'warning',
                icon: 'info',
                message: 'Nenhuma edição ou filtro foi aplicado. O arquivo exportado seria idêntico ao original. Faça uma edição ou defina um filtro antes de exportar.',
                timeout: 5000
             })
          }

          $q.loading.show({ message: 'Preparando exportação...' })

          setTimeout(() => {
             try {
                 let dataset = store.records
    
                 if (ef.dateStart) {
                    const sd = new Date(ef.dateStart + 'T00:00:00').getTime()
                    dataset = dataset.filter(r => r.dataHora && new Date(r.dataHora).getTime() >= sd)
                 }
                 if (ef.dateEnd) {
                    const ed = new Date(ef.dateEnd + 'T23:59:59').getTime()
                    dataset = dataset.filter(r => r.dataHora && new Date(r.dataHora).getTime() <= ed)
                 }
                 if (ef.nsrStart !== null && ef.nsrStart !== '') {
                    const ns = Number(ef.nsrStart)
                    dataset = dataset.filter(r => r.nsr && Number(r.nsr) >= ns)
                 }
                 if (ef.nsrEnd !== null && ef.nsrEnd !== '') {
                    const ne = Number(ef.nsrEnd)
                    dataset = dataset.filter(r => r.nsr && Number(r.nsr) <= ne)
                 }
    
                 if (dataset.length === 0) {
                     $q.loading.hide()
                     return $q.notify({ type: 'warning', message: 'Os filtros excluíram todos os registros. O AFD exportado estaria vazio.' })
                 }
    
                 const content = generateFileContent(dataset, store.portaria, {
                   reindexNsr: store.settings.reindexNsrExport,
                   reindexNsrStart: store.settings.reindexNsrStart
                 })
                 
                 if (!content || content.length === 0) {
                      throw new Error('Conteúdo gerado vazio!')
                 }
    
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
             } catch (errInner) {
                 $q.loading.hide()
                 $q.notify({ type: 'negative', message: 'Falha interna ao gerar arquivo: ' + (errInner.message || errInner) })
                 console.error('Erro na exportação (Timeout):', errInner)
             }
          }, 50)
       } catch (err) {
          if ($q && $q.loading) $q.loading.hide()
          $q.notify({ type: 'negative', message: 'Erro crítico na exportação: ' + (err.message || err) })
          console.error('Erro na exportação:', err)
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

.analyze-container {
   height: calc(100vh - 119px);
   display: flex;
   flex-direction: column;
   overflow: hidden; /* Garante que os painéis não vazem pelo border-radius ocultando a sombra */
}

.custom-scrolling-panel {
   flex-wrap: nowrap;
   overflow-y: auto;
   overflow-x: hidden;
}
</style>