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
         <img :src="store.isDark ? './app-logo-dark.svg' : './app-logo.svg'" style="width: 128px; height: 128px; opacity: 1;" class="q-mb-md" alt="Logo AFDMaster" />
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
              <div class="text-h6 q-mb-md text-center">Exportação de Dados</div>

              <div class="row justify-center q-mb-lg">
                <q-btn-toggle
                  v-model="exportType"
                  spread
                  unelevated
                  toggle-color="primary"
                  color="grey-2"
                  text-color="grey-7"
                  :options="[
                    { label: 'Arquivo AFD (Original/Editado)', value: 'afd', icon: 'description' },
                    { label: 'Arquivo de Batidas (Personalizado)', value: 'batidas', icon: 'list' }
                  ]"
                  class="soft-btn-toggle"
                  style="max-width: 600px; width: 100%;"
                />
              </div>

              <!-- AFD Export Section -->
              <div v-if="exportType === 'afd'">
                <!-- Password Warning for AFD if set -->
                <div v-if="hasPassword && !isUnlocked" class="text-center q-pa-lg">
                   <q-icon name="lock" size="64px" color="grey-4" />
                   <div class="text-h6 text-grey-6 q-mt-md">Exportação AFD protegida por senha</div>
                   <q-btn
                     unelevated
                     color="primary"
                     label="Desbloquear para Exportar"
                     icon="lock_open"
                     class="q-mt-md soft-btn soft-btn-primary"
                     @click="promptPassword"
                   />
                </div>

                <div v-else>
                  <div class="text-subtitle1 q-mb-md text-center">Filtros de Exportação do AFD</div>
              
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
                          <div class="text-subtitle2 q-mb-sm text-primary">Intervalo de NSR</div>
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
              </div>

              <!-- Batidas Export Section -->
              <div v-if="exportType === 'batidas'">
                <div class="text-subtitle1 q-mb-md text-center">Configuração de Exportação de Batidas</div>
                
                <div class="row q-col-gutter-md justify-center">
                  <div class="col-12 col-md-8">
                    <q-card class="soft-card" flat bordered>
                       <q-card-section>
                          <div class="row q-col-gutter-md">
                            <!-- Layout e Delimitador -->
                            <div class="col-12 col-sm-6">
                               <div class="text-caption text-weight-bold q-mb-xs">Tipo de Layout</div>
                               <q-select
                                 outlined dense
                                 v-model="batidasConfig.layout"
                                 :options="[{label: 'Tamanho Fixo', value: 'fixed'}, {label: 'Delimitado', value: 'delimited'}]"
                                 emit-value map-options
                                 class="soft-input"
                               />
                            </div>
                            <div class="col-12 col-sm-6" v-if="batidasConfig.layout === 'delimited'">
                               <div class="text-caption text-weight-bold q-mb-xs">Caractere Delimitador</div>
                               <q-input
                                 outlined dense
                                 v-model="batidasConfig.delimiter"
                                 maxlength="1"
                                 placeholder="Ex: ;"
                                 class="soft-input"
                               />
                            </div>
                          </div>

                          <!-- Tamanhos de Campo (Fixo) -->
                          <div class="q-mt-md" v-if="batidasConfig.layout === 'fixed'">
                             <div class="text-caption text-weight-bold q-mb-sm">Tamanhos de Campo</div>
                             <div class="row q-col-gutter-sm">
                                <div class="col-4">
                                   <q-input dense outlined type="number" v-model.number="batidasConfig.fields.cpf" label="CPF/PIS" class="soft-input" />
                                </div>
                                <div class="col-4">
                                   <q-input dense outlined type="number" v-model.number="batidasConfig.fields.date" label="Data" class="soft-input" />
                                </div>
                                <div class="col-4">
                                   <q-input dense outlined type="number" v-model.number="batidasConfig.fields.time" label="Hora" class="soft-input" />
                                </div>
                             </div>
                          </div>

                          <q-separator class="q-my-lg" />

                          <!-- Novos Filtros de Batidas -->
                          <div class="text-subtitle2 q-mb-md text-primary">Filtros Adicionais</div>
                          
                          <div class="row q-col-gutter-md">
                            <!-- Intervalo de Data -->
                            <div class="col-12 col-sm-6">
                              <div class="text-caption text-weight-bold q-mb-xs">Intervalo de Data</div>
                              <div class="row q-col-gutter-sm">
                                <div class="col-6">
                                  <q-input dense outlined v-model="batidasConfig.dateStart" type="date" label="De" class="soft-input" />
                                </div>
                                <div class="col-6">
                                  <q-input dense outlined v-model="batidasConfig.dateEnd" type="date" label="Até" class="soft-input" />
                                </div>
                              </div>
                            </div>

                            <!-- Intervalo de NSR -->
                            <div class="col-12 col-sm-6">
                              <div class="text-caption text-weight-bold q-mb-xs">Intervalo de NSR</div>
                              <div class="row q-col-gutter-sm">
                                <div class="col-6">
                                  <q-input dense outlined v-model.number="batidasConfig.nsrStart" type="number" label="NSR Mín" class="soft-input" />
                                </div>
                                <div class="col-6">
                                  <q-input dense outlined v-model.number="batidasConfig.nsrEnd" type="number" label="NSR Máx" class="soft-input" />
                                </div>
                              </div>
                            </div>

                            <!-- Filtro de Documento -->
                            <div class="col-12 col-sm-6">
                              <div class="text-caption text-weight-bold q-mb-xs">Filtrar por Documento</div>
                              <q-input 
                                dense outlined 
                                v-model="batidasConfig.documento" 
                                label="CPF ou PIS" 
                                class="soft-input"
                                hint="Apenas registros deste colaborador"
                              />
                            </div>

                            <!-- Substituição de Documento -->
                            <div class="col-12 col-sm-6">
                              <div class="text-caption text-weight-bold q-mb-xs">Substituir por</div>
                              <q-input 
                                dense outlined 
                                v-model="batidasConfig.replaceDocumento" 
                                label="Novo Valor" 
                                class="soft-input"
                                :disable="!batidasConfig.documento"
                                hint="Muda o valor no arquivo final"
                              />
                            </div>
                          </div>
                       </q-card-section>
                    </q-card>
                  </div>
                </div>

                <div class="text-center q-mt-lg">
                   <q-btn
                     color="secondary"
                     icon="download"
                     label="Baixar Arquivo de Batidas"
                     size="lg"
                     unelevated
                     class="soft-btn q-px-xl"
                     @click="downloadBatidas"
                   />
                </div>
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

  <!-- Modal de boas-vindas do modo demo (aparece a cada carregamento/recarga) -->
  <q-dialog v-if="isDemo" v-model="demoWelcome" persistent>
    <q-card class="demo-welcome-card soft-card" style="max-width:480px; width:100%; border-radius:20px;">

      <!-- Header laranja -->
      <div class="demo-welcome-header row items-center no-wrap q-pa-lg q-pb-md">
        <q-icon name="science" size="40px" color="white" class="q-mr-md" />
        <div>
          <div class="text-h6 text-white text-weight-bold">Modo Demonstração</div>
          <div class="text-caption" style="color:rgba(255,255,255,0.8);">Instância pública de portfólio</div>
        </div>
      </div>

      <q-card-section class="q-pt-md q-pb-xs">
        <p class="text-body2 text-grey-8 q-mb-md">
          Você está acessando o <strong>AFDMaster</strong> em modo demonstração.
          Algumas funcionalidades são limitadas para preservar os recursos do servidor.
        </p>

        <q-list dense class="q-mb-md">
          <q-item dense class="q-pa-none q-mb-xs">
            <q-item-section avatar style="min-width:30px">
              <q-icon name="lock" color="orange-8" size="18px"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption text-grey-8">
                Importão livre desabilitada — use os <strong>arquivos de exemplo</strong> disponíveis
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense class="q-pa-none q-mb-xs">
            <q-item-section avatar style="min-width:30px">
              <q-icon name="lock" color="orange-8" size="18px"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption text-grey-8">
                Gerador limitado a <strong>1 funcionário</strong>, 1 dia e CPF fixo
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense class="q-pa-none">
            <q-item-section avatar style="min-width:30px">
              <q-icon name="check_circle" color="positive" size="18px"/>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption text-grey-8">
                Análise, validação, documentação e configurações funcionam normalmente
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner dense rounded class="bg-blue-1 text-blue-9 text-caption q-mb-md">
          <template v-slot:avatar>
            <q-icon name="tips_and_updates" color="blue-7" size="18px"/>
          </template>
          Quer usar sem limitações? O projeto é open-source sob a licença GPL-3.0-SA —
          <a href="https://github.com/luizGDpulz/AFDMaster" target="_blank" class="text-blue-9 text-decoration-none" >Faça seu próprio Deploy aqui</a>.
        </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-xs">
        <q-btn
          unelevated
          color="orange-8"
          label="Sobre"
          icon="info"
          class="soft-btn text-weight-bold"
          @click="aboutpage"
        />
        <q-btn
          unelevated
          color="orange-8"
          label="Entendido, continuar"
          icon="arrow_forward"
          class="soft-btn text-weight-bold"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { defineComponent, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
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
    const router = useRouter()
    const tab = ref('records')
    const demoWelcome = ref(false)
    const isDemo = process.env.DEMO_MODE === 'true'
    
    // Mapeamento para o Breadcrumb do Layout
    const tabLabels = { records: 'Registros', validation: 'Validações', export: 'Exportar', editor: 'Edição' }
    watch(tab, (newVal) => {
       store.activeTabName = tabLabels[newVal]
    }, { immediate: true })

    const uploadModal = ref(false)
    const $q = useQuasar()
    const { generateFileContent, generateBatidasContent } = useGenerator()

    // ── Proteção Técnica ──────────────────────────────────────────
    const isUnlocked = ref(false)
    const hasPassword = computed(() => {
      return !!process.env.TECH_PASSWORD && process.env.TECH_PASSWORD !== ''
    })

    const promptPassword = () => {
      $q.dialog({
        title: 'Acesso Técnico',
        message: 'Informe a senha técnica para desbloquear a exportação AFD:',
        prompt: {
          model: '',
          type: 'password'
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        if (data === process.env.TECH_PASSWORD) {
          isUnlocked.value = true
          $q.notify({ type: 'positive', message: 'Exportação AFD desbloqueada!' })
        } else {
          $q.notify({ type: 'negative', message: 'Senha incorreta.' })
        }
      })
    }

    const aboutpage = () => {
       router.push('/about')
    }

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

    const exportType = ref('afd')
    const batidasConfig = ref({
       layout: 'delimited',
       delimiter: ';',
       fields: { cpf: 11, date: 8, time: 4 },
       // Filtros
       dateStart: '',
       dateEnd: '',
       nsrStart: null,
       nsrEnd: null,
       documento: '',
       replaceDocumento: ''
    })

    const downloadBatidas = () => {
       try {
          $q.loading.show({ message: 'Preparando exportação de batidas...' })
          setTimeout(() => {
             const bc = batidasConfig.value
             let dataset = store.records.filter(r => r.tipo === '3')

             // Filtro de Data
             if (bc.dateStart) {
                const sd = new Date(bc.dateStart + 'T00:00:00').getTime()
                dataset = dataset.filter(r => r.dataHora && new Date(r.dataHora).getTime() >= sd)
             }
             if (bc.dateEnd) {
                const ed = new Date(bc.dateEnd + 'T23:59:59').getTime()
                dataset = dataset.filter(r => r.dataHora && new Date(r.dataHora).getTime() <= ed)
             }

             // Filtro de NSR
             if (bc.nsrStart !== null && bc.nsrStart !== '') {
                const ns = Number(bc.nsrStart)
                dataset = dataset.filter(r => r.nsr && Number(r.nsr) >= ns)
             }
             if (bc.nsrEnd !== null && bc.nsrEnd !== '') {
                const ne = Number(bc.nsrEnd)
                dataset = dataset.filter(r => r.nsr && Number(r.nsr) <= ne)
             }

             // Filtro de Documento
             if (bc.documento) {
                const filterDoc = bc.documento.replace(/\D/g, '')
                dataset = dataset.filter(r => {
                   const recDoc = (r.cpf || r.pis || '').replace(/\D/g, '')
                   return recDoc.endsWith(filterDoc)
                })

                // Substituição (opcional, só se tiver filtro de documento)
                if (bc.replaceDocumento) {
                   const newVal = bc.replaceDocumento.trim()
                   dataset = dataset.map(r => ({
                      ...r,
                      cpf: newVal,
                      pis: newVal
                   }))
                }
             }

             if (dataset.length === 0) {
                $q.loading.hide()
                return $q.notify({ type: 'warning', message: 'Nenhum registro encontrado com os filtros selecionados.' })
             }

             const content = generateBatidasContent(dataset, bc)
             const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
             const url = URL.createObjectURL(blob)
             const link = document.createElement('a')
             link.href = url
             link.download = `batidas_export_${Date.now()}.txt`
             document.body.appendChild(link)
             link.click()
             document.body.removeChild(link)
             URL.revokeObjectURL(url)
             $q.loading.hide()
             $q.notify({ type: 'positive', message: 'Arquivo de batidas exportado com sucesso!' })
          }, 100)
       } catch (err) {
          $q.loading.hide()
          $q.notify({ type: 'negative', message: 'Erro na exportação: ' + err.message })
       }
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
      if (isDemo) demoWelcome.value = true
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
      isDemo,
      aboutpage,
      // Export
      exportType,
      batidasConfig,
      downloadBatidas,
      exportFilters,
      // Proteção
      isUnlocked,
      hasPassword,
      promptPassword
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

.demo-welcome-header {
  background: linear-gradient(135deg, #e65100, #f57f17);
  border-radius: 20px 20px 0 0;
}
</style>