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
  <div class="q-pa-md flex column no-wrap" ref="rootRef" style="height: 100%;">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="warning" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado importado.</div>
      <q-btn flat color="primary" to="/" label="Ir para Upload" class="q-mt-sm" />
    </div>

    <div v-else class="flex column no-wrap" style="height: 100%;">

      <div class="row items-center q-mb-xs q-col-gutter-sm">
        <div class="col-12 col-md-3">
           <q-select
              dense outlined
              v-model="tipoFiltro"
              :options="tipoOptions"
              :label="tipoFiltro ? undefined : 'Filtrar por Tipo'"
              class="soft-input filter-type-select"
              emit-value map-options
           >
              <template v-slot:selected-item="scope">
                <div class="row items-center full-width" style="min-height: 24px;">
                  <RecordTypeBadge v-if="scope.opt.value" :tipo="scope.opt.value" :label="scope.opt.label" />
                  <span v-else class="text-grey-8">{{ scope.opt.label }}</span>
                </div>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <RecordTypeBadge v-if="scope.opt.value" :tipo="scope.opt.value" :label="scope.opt.label" style="width: max-content;"/>
                    <span v-else class="text-weight-medium">{{ scope.opt.label }}</span>
                  </q-item-section>
                </q-item>
              </template>
           </q-select>
        </div>
        <div class="col-12 col-md-2">
           <q-input dense outlined v-model="dataInicio" type="date" label="Data Início" class="soft-input" />
        </div>
        <div class="col-12 col-md-2">
           <q-input dense outlined v-model="dataFim" type="date" label="Data Fim" class="soft-input" />
        </div>
        <div class="col-12 col-md-5 row justify-end items-center">
            <q-input dense outlined v-model="localSearchQuery" @update:model-value="onSearchInput" placeholder="Buscar: NSR, CPF, nome..." class="q-mr-sm soft-input" style="flex-grow: 1;">
              <template v-slot:append>
                <q-icon name="search" class="q-icon-ondark"/>
              </template>
            </q-input>
            <q-btn-dropdown
                unelevated
                class="soft-btn q-icon-onwhite"
                :color="statusFilterColor"
                :icon="statusFilterIcon"
                no-icon-animation
            >
              <q-list>
                <q-item clickable v-close-popup @click="setStatusFilter(null)">
                  <q-item-section avatar><q-icon name="list" color="primary" /></q-item-section>
                  <q-item-section>Todos</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="setStatusFilter('errors')">
                  <q-item-section avatar><q-icon name="error" color="negative" /></q-item-section>
                  <q-item-section>Somente Erros</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="setStatusFilter('warnings')">
                  <q-item-section avatar><q-icon name="warning" color="warning" /></q-item-section>
                  <q-item-section>Somente Avisos</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
        </div>
      </div>

      <q-table
        flat bordered
        :dark="store.isDark"
        :rows="store.records"
        :columns="columns"
        row-key="id"
        :filter="filterTrigger"
        :filter-method="customFilterMethod"
        :loading="isFiltering"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        v-model:pagination="pagination"
        :rows-per-page-options="[0]"
        ref="qTableRef"
        :style="{ height: tableHeight + 'px' }"
        table-style="width: 100%;"
        class="soft-card sticky-header-table"
        title="Registros do Arquivo"
      >
        <!-- Custom Body com Expansão Inline -->
        <template v-slot:body="props">
          <!-- Linha Principal -->
          <q-tr
            :props="props"
            :key="props.key"
            @click="openRecordDetail(props.row)"
            class="table-row cursor-pointer"
          >
             <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <!-- Customizações de Célula -->
                 <template v-if="col.name === 'tipo'">
                    <RecordTypeBadge :tipo="props.row.tipo" />
                 </template>
                 <template v-else-if="col.name === 'data'">
                    {{ formatDataStr(props.row.dataHora) }}
                 </template>
                 <template v-else-if="col.name === 'hora'">
                    {{ formatHoraStr(props.row.dataHora) }}
                 </template>
                 <template v-else-if="col.name === 'fuso'">
                    <span v-if="props.row.fusoHorario" class="fuso-chip">{{ formatFuso(props.row.fusoHorario) }}</span>
                    <span v-else class="text-grey-5">—</span>
                 </template>
                 <template v-else-if="col.name === 'identificador'">
                    <span class="ident-cell">
                      <span>{{ store.portaria === '1510' ? formatPIS(props.row.pis || props.row.cpf) : formatCPF(props.row.cpf || props.row.pis) }}</span>
                      <button
                        v-if="props.row.cpf || props.row.pis"
                        class="copy-btn"
                        title="Copiar"
                        @click.stop="copyToClipboard(props.row.cpf || props.row.pis)"
                      >⧉</button>
                    </span>
                 </template>
                <template v-else-if="col.name === 'status'">
                   <q-badge v-if="props.row.erros && props.row.erros.length > 0" color="negative" text-color="white">
                     {{ props.row.erros.length }} Erro(s)
                     <q-tooltip><div v-for="(err, i) in props.row.erros" :key="i">- {{ err }}</div></q-tooltip>
                   </q-badge>
                   <q-badge v-else-if="props.row.avisos && props.row.avisos.length > 0" color="warning" text-color="black">
                     {{ props.row.avisos.length }} Aviso(s)
                     <q-tooltip><div v-for="(warn, i) in props.row.avisos" :key="i">- {{ warn.msg || warn }}</div></q-tooltip>
                   </q-badge>
                   <q-badge v-else-if="props.row.alterado" color="info" text-color="white">Editado</q-badge>
                   <q-badge v-else color="positive">OK</q-badge>
                </template>
                <!-- Valor Padrão -->
                <template v-else>
                   {{ col.value }}
                </template>
             </q-td>
          </q-tr>

        </template>
      </q-table>

      <!-- Modal Único de Detalhes -> Contém a tela principal e os filhos lado a lado -->
       <q-dialog v-model="isDetailOpen" transition-show="fade" transition-hide="fade" class="wide-dialog">
         <div class="row no-wrap items-start justify-center shadow-0" style="gap: 24px; padding: 12px; background: transparent;">
            <div class="modal-slide-card">
               <RecordDetailDialog :record="selectedRecord" @hide="isDetailOpen = false" @viewConflict="openConflict" @viewDayPunches="openDayPunches" @viewNsrNeighborhood="openNsrNeighborhood" />
            </div>

            <!-- Modal Secundário para Marcação Conflitante -->
            <div class="modal-slide-card" v-if="conflictModalOpen && !nsrModalOpen">
               <RecordDetailDialog :record="conflictingRecord" is-child @hide="conflictModalOpen = false" @viewDayPunches="openDayPunches" @viewNsrNeighborhood="openNsrNeighborhood" />
            </div>
            
            <!-- Modal Secundário para Marcações do Dia -->
            <div class="modal-slide-card" v-if="dayModalOpen && !nsrModalOpen">
               <DayPunchesDialog :punches="dayPunches" @hide="dayModalOpen = false" />
            </div>

            <!-- Modal Secundário para Vizinhança NSR -->
            <div class="modal-slide-card flex column no-wrap" v-if="nsrModalOpen" style="gap: 16px; width: 340px;">
               <!-- Anterior -->
               <q-card class="soft-card shadow-12 q-pa-md col" style="border-radius: 16px;">
                  <div class="text-subtitle2 text-grey-7 q-mb-sm row items-center justify-between">
                     <span>Registro Anterior <span class="text-caption" style="opacity: 0.7">(Linha cima)</span></span>
                     <q-btn icon="close" flat round dense size="sm" @click="nsrModalOpen = false" style="background: rgba(0,0,0,0.05)" />
                  </div>
                  <template v-if="nsrPrevRecord">
                    <div class="q-mb-sm"><RecordTypeBadge :tipo="nsrPrevRecord.tipo" /></div>
                    <div class="text-h6 text-mono q-my-xs text-primary">NSR: {{ nsrPrevRecord.nsr || '—' }}</div>
                    <div class="text-body2 text-grey-8 q-mt-sm"><strong>Data/Hora:</strong> {{ formatDataStr(nsrPrevRecord.dataHora) }} {{ formatHoraStr(nsrPrevRecord.dataHora) }} <span class="fuso-chip q-ml-xs" v-if="nsrPrevRecord.fusoHorario">GMT{{ nsrPrevRecord.fusoHorario }}</span></div>
                    <div class="text-body2 text-grey-8 q-mt-xs" v-if="nsrPrevRecord.cpf || nsrPrevRecord.pis"><strong>{{ store.portaria === '1510' ? 'PIS' : 'CPF' }}:</strong> {{ store.portaria === '1510' ? formatPIS(nsrPrevRecord.cpf || nsrPrevRecord.pis) : formatCPF(nsrPrevRecord.cpf || nsrPrevRecord.pis) }}</div>
                    <div class="raw-line-modal text-mono q-mt-md">{{ String(nsrPrevRecord.raw || '').substring(0, 50) }}...</div>
                  </template>
                  <div v-else class="text-grey-6 text-center q-py-md">Início do arquivo. Nenhum registro anterior.</div>
               </q-card>

               <!-- Posterior -->
               <q-card class="soft-card shadow-12 q-pa-md col" style="border-radius: 16px;">
                  <div class="text-subtitle2 text-grey-7 q-mb-sm row items-center justify-between">
                     <span>Registro Posterior <span class="text-caption" style="opacity: 0.7">(Linha baixo)</span></span>
                  </div>
                  <template v-if="nsrNextRecord">
                    <div class="q-mb-sm"><RecordTypeBadge :tipo="nsrNextRecord.tipo" /></div>
                    <div class="text-h6 text-mono q-my-xs text-primary">NSR: {{ nsrNextRecord.nsr || '—' }}</div>
                    <div class="text-body2 text-grey-8 q-mt-sm"><strong>Data/Hora:</strong> {{ formatDataStr(nsrNextRecord.dataHora) }} {{ formatHoraStr(nsrNextRecord.dataHora) }} <span class="fuso-chip q-ml-xs" v-if="nsrNextRecord.fusoHorario">GMT{{ nsrNextRecord.fusoHorario }}</span></div>
                    <div class="text-body2 text-grey-8 q-mt-xs" v-if="nsrNextRecord.cpf || nsrNextRecord.pis"><strong>{{ store.portaria === '1510' ? 'PIS' : 'CPF' }}:</strong> {{ store.portaria === '1510' ? formatPIS(nsrNextRecord.cpf || nsrNextRecord.pis) : formatCPF(nsrNextRecord.cpf || nsrNextRecord.pis) }}</div>
                    <div class="raw-line-modal text-mono q-mt-md">{{ String(nsrNextRecord.raw || '').substring(0, 50) }}...</div>
                  </template>
                  <div v-else class="text-grey-6 text-center q-py-md">Fim do arquivo. Nenhum registro posterior.</div>
               </q-card>
            </div>
         </div>
      </q-dialog>

    </div>
  </div>

</template>
<script>
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useValidators } from 'src/composables/useValidators'
import { useQuasar, debounce } from 'quasar'
import RecordTypeBadge from 'src/components/RecordTypeBadge.vue'
import RecordDetailDialog from 'src/components/RecordDetailDialog.vue'
import DayPunchesDialog from 'src/components/DayPunchesDialog.vue'

const OPERACAO_MAP = {
  'I': { label: 'Inclusão',  color: 'positive' },
  'A': { label: 'Alteração', color: 'warning'  },
  'E': { label: 'Exclusão',  color: 'negative' },
}

export default defineComponent({
  name: 'AfdTable',
  components: { RecordTypeBadge, RecordDetailDialog, DayPunchesDialog },
  setup() {
    const store = useAfdStore()
    const { validateSingle } = useValidators()
    const $q = useQuasar()

    const pagination = ref({ rowsPerPage: 0 })

    const qTableRef = ref(null)
    const rootRef   = ref(null)
    const tableHeight = ref(600)

    const computeHeight = () => {
      const root = rootRef.value
      if (!root) return
      
      const containerTop = root.getBoundingClientRect().top
      const available = window.innerHeight - containerTop - 24
      
      let filtersH = 44
      const filtersEl = root.querySelector('.q-col-gutter-sm')
      if (filtersEl && filtersEl.offsetHeight > 0) {
        filtersH = filtersEl.offsetHeight + 8 
      }
      
      const newHeight = Math.max(200, Math.floor(available - 16 - filtersH))
      
      if (Math.abs(tableHeight.value - newHeight) > 5) {
          tableHeight.value = newHeight
      }
    }

    let resizeObserver = null

    onMounted(() => {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(computeHeight)
      })
      if (rootRef.value) resizeObserver.observe(rootRef.value)
      window.addEventListener('resize', computeHeight)
      
      setTimeout(computeHeight, 50)
      setTimeout(computeHeight, 300)
    })

    onUnmounted(() => {
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', computeHeight)
    })

    // ── Gerenciamento do Modal de Detalhes ────────────────────────────────────
    const isDetailOpen = ref(false)
    const selectedRecord = ref({})

    const conflictModalOpen = ref(false)
    const conflictingRecord = ref({})
    
    const dayModalOpen = ref(false)
    const dayPunches = ref([])

    const nsrModalOpen = ref(false)
    const nsrPrevRecord = ref(null)
    const nsrNextRecord = ref(null)

    watch(isDetailOpen, (val) => {
      if (!val) {
        conflictModalOpen.value = false
        dayModalOpen.value = false
        nsrModalOpen.value = false
      }
    })

    const openRecordDetail = (row) => {
      selectedRecord.value = row
      isDetailOpen.value = true
      
      // Avalia se esse registro foi flaggado com erro no sequencial lógico do NSR
      const hasNsrIssue = row.isNsrBreak || (row.erros && row.erros.some(e => e.includes('NSR') || e.includes('sequência') || e.includes('salto')))
      if (hasNsrIssue) {
         // Busca o index bruto dele na store
         const idx = store.records.findIndex(r => r === row)
         if (idx !== -1) {
            nsrPrevRecord.value = idx > 0 ? store.records[idx - 1] : null
            nsrNextRecord.value = idx < store.records.length - 1 ? store.records[idx + 1] : null
         }
      }
    }

    const openNsrNeighborhood = () => {
       conflictModalOpen.value = false
       dayModalOpen.value = false
       nsrModalOpen.value = true 
    }

    const openConflict = (nsr) => {
       if (!nsr) return
       dayModalOpen.value = false
       const rec = store.records.find(r => String(r.nsr) === String(nsr))
       if (rec) {
          conflictingRecord.value = rec
          setTimeout(() => { conflictModalOpen.value = true }, 50)
       }
    }

    const openDayPunches = ({ punches }) => {
       if (!punches || punches.length === 0) return
       conflictModalOpen.value = false
       dayPunches.value = punches
       
       // Garante que o Vue atualizou o estado (isChildOpened / hasChildOpen) antes de lançar o modal
       setTimeout(() => { dayModalOpen.value = true }, 50)
    }

    // ── Filtros ──────────────────────────────────────────────────────────────
    
    const isFiltering = ref(false)

    // Helper: liga o spinner, dá chance ao browser de pintar a tela (yield) 
    // e só depois dispara a rotina sincronizada pesada
    const applyFilterWithLoading = (actionFn) => {
        isFiltering.value = true
        setTimeout(() => {
            actionFn()
            // Mais um tick pro vue renderizar as td/tr antes de desligar o loading
            setTimeout(() => { isFiltering.value = false }, 50)
        }, 10)
    }

    // Para evitar lerdeza absurda ao digitar em um arquivo de 500k linhas, 
    // desacoplamos o input de busca (local) da reatividade da Store (global) via Debounce
    const localSearchQuery = ref(store.filters.search)

    const filter = computed({
      get: () => store.filters.search,
      set: (val) => store.setFilters({ search: val })
    })

    const debouncedApplySearch = debounce((val) => {
        filter.value = val
        setTimeout(() => { isFiltering.value = false }, 50)
    }, 400)

    const onSearchInput = (val) => {
        isFiltering.value = true
        debouncedApplySearch(val)
    }

    const statusFilter = computed({
      get: () => store.filters.status,
      set: (val) => applyFilterWithLoading(() => store.setFilters({ status: val }))
    })

    const statusFilterColor = computed(() => {
      if (statusFilter.value === 'errors') return 'negative'
      if (statusFilter.value === 'warnings') return 'warning'
      return 'primary'
    })

    const statusFilterIcon = computed(() => {
      if (statusFilter.value === 'errors') return 'error'
      if (statusFilter.value === 'warnings') return 'warning'
      return 'filter_alt'
    })

    const setStatusFilter = (val) => {
       applyFilterWithLoading(() => {
           store.setFilters({ status: val })
           if (!val) {
               localSearchQuery.value = ''
               filter.value = ''
           }
       })
    }

    const tipoFiltro = computed({
      get: () => store.filters.type,
      set: (val) => applyFilterWithLoading(() => store.setFilters({ type: val }))
    })
    const dataInicio = computed({
       get: () => store.filters.dateStart,
       set: (val) => applyFilterWithLoading(() => store.setFilters({ dateStart: val }))
    })
    const dataFim = computed({
       get: () => store.filters.dateEnd,
       set: (val) => applyFilterWithLoading(() => store.setFilters({ dateEnd: val }))
    })

    const tipoOptions = computed(() => {
      const base = [
        { label: 'Todos os Registros', value: null },
        { label: '1 - Cabeçalho', value: '1' },
        { label: '2 - Empregador / Empresa', value: '2' },
        { label: '3 - Marcação de Ponto', value: '3' },
        { label: '4 - Ajuste de Relógio', value: '4' },
        { label: '5 - Trabalhador', value: '5' },
      ]
      if (store.portaria !== '1510') {
        base.push({ label: '6 - Eventos', value: '6' })
        base.push({ label: '7 - Marcação REP-P', value: '7' })
      }
      base.push({ label: '9 - Trailer', value: '9' })
      return base
    })

    // ── Formatadores ─────────────────────────────────────────────────────────

    const formatDateTime = (isoStr) => {
      if (!isoStr) return '-'
      try {
        const dt = new Date(isoStr)
        if (isNaN(dt.getTime())) {
          // AFD 671 usa timezone compacto "-0300" (sem ':') que alguns browsers rejeitam.
          // Normaliza inserindo ':' no timezone: "-0300" → "-03:00"
          const normalized = isoStr.replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3')
          const dt2 = new Date(normalized)
          if (!isNaN(dt2.getTime())) return dt2.toLocaleString('pt-BR')
          return isoStr
        }
        return dt.toLocaleString('pt-BR')
      } catch {
        return isoStr
      }
    }

    const formatDataStr = (isoStr) => {
       if (!isoStr) return '-'
       if (isoStr.length >= 10) return isoStr.substring(0, 10).split('-').reverse().join('/')
       return formatDateTime(isoStr).split(' ')[0] || '-'
    }

    const formatHoraStr = (isoStr) => {
       if (!isoStr) return '-'
       if (isoStr.includes('T') && isoStr.length >= 16) return isoStr.substring(11, 16)
       return formatDateTime(isoStr).split(' ')[1] || '-'
    }

    /**
     * Converte "-0300" → "GMT-03:00" | "+0000" → "GMT+00:00"
     */
    const formatFuso = (fuso) => {
      if (!fuso) return '-'
      const raw = fuso.trim()
      if (raw.length < 5) return `GMT${raw}`
      const sign  = raw[0]                 // '+' ou '-'
      const hours = raw.substring(1, 3)   // '03'
      const mins  = raw.substring(3, 5)   // '00'
      return `GMT${sign}${hours}:${mins}`
    }

    const formatCPF = (cpf) => {
      if (!cpf) return '—'
      const digits = cpf.replace(/\D/g, '')
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,6)}.${digits.substring(6,9)}-${digits.substring(9,11)}`
      }
      if (digits.length === 12) {
        // CPF de 12 dígitos: remove leading zero se for 671 padding
        const trimmed = digits.replace(/^0/, '')
        if (trimmed.length === 11) {
          return `${trimmed.substring(0,3)}.${trimmed.substring(3,6)}.${trimmed.substring(6,9)}-${trimmed.substring(9,11)}`
        }
      }
      return cpf // fallback
    }

    /**
     * Formata PIS (11 dígitos) no padrão XXX.XXXXX.XX-X.
     * Campo vem com 12 chars no 1510 (zero na frente).
     */
    const formatPIS = (pis) => {
      if (!pis) return '—'
      const digits = pis.replace(/\D/g, '')
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,8)}.${digits.substring(8,10)}-${digits.substring(10,11)}`
      }
      if (digits.length === 12) {
        const trimmed = digits.replace(/^0/, '') // Tenta ver se é só padding de zero
        if (trimmed.length === 11) {
          return `${trimmed.substring(0,3)}.${trimmed.substring(3,8)}.${trimmed.substring(8,10)}-${trimmed.substring(10,11)}`
        } else {
          // Se realmente tem 12 dígitos fortes (alguns fabricantes fazem isso)
          return `${digits.substring(0,1)}.${digits.substring(1,4)}.${digits.substring(4,9)}.${digits.substring(9,11)}-${digits.substring(11,12)}`
        }
      }
      return pis // fallback
    }

    /**
     * Copia texto puro (digitos) para a área de transferência.
     * Usa Clipboard API quando disponível (HTTPS/localhost); fallback para
     * execCommand em contextos HTTP não seguros (ex: servidor local sem TLS).
     */
    const copyToClipboard = (raw) => {
      if (!raw) return
      const digits = raw.replace(/\D/g, '').replace(/^0+/, '') // remove leading zeros do PIS/CPF

      const onSuccess = () => $q.notify({ type: 'positive', message: 'Copiado!', timeout: 800, position: 'bottom-right' })
      const onFail    = () => $q.notify({ type: 'warning', message: 'Não foi possível copiar', timeout: 1200 })

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(digits).then(onSuccess).catch(onFail)
      } else {
        // Fallback: cria textarea temporária, seleciona e executa copy
        try {
          const ta = document.createElement('textarea')
          ta.value = digits
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.focus()
          ta.select()
          const ok = document.execCommand('copy')
          document.body.removeChild(ta)
          ok ? onSuccess() : onFail()
        } catch {
          onFail()
        }
      }
    }

    // ── Tipo 5 helpers ───────────────────────────────────────────────────────
    const operacaoLabel = (op) => OPERACAO_MAP[op]?.label ?? (op ? `"${op}"` : 'Desconhecida')
    const operacaoColor = (op) => OPERACAO_MAP[op]?.color ?? 'grey'

    // ── Dados ────────────────────────────────────────────────────────────────
    const headerRecord = computed(() => store.records.find(r => r.tipo === '1'))

    const columns = computed(() => {
      const is1510 = store.portaria === '1510'
      const cols = [
        { name: 'nsr',           label: 'NSR',           field: 'nsr',  sortable: true,  align: 'left'   },
        { name: 'tipo',          label: 'Tipo',           field: 'tipo', sortable: true,  align: 'center' },
        { name: 'data',          label: 'Data',           field: 'data', sortable: false, align: 'left'   },
        { name: 'hora',          label: 'Hora',           field: 'hora', sortable: false, align: 'left'   },
      ]
      // Fuso horário: só existe na 671
      if (!is1510) {
        cols.push({ name: 'fuso', label: 'Fuso', field: 'fuso', sortable: false, align: 'center' })
      }
      cols.push({ name: 'identificador', label: is1510 ? 'PIS' : 'CPF', field: 'id', sortable: true, align: 'left' })
      cols.push({ name: 'crc', label: 'CRC', field: 'crc', sortable: false, align: 'center' })
      cols.push({ name: 'status', label: 'Status', field: 'status', align: 'center' })
      return cols
    })

    const normalizeCPF = (raw) => {
      if (!raw) return ''
      return raw.replace(/\D/g, '').replace(/^0+/, '')
    }

    const activeFilters = computed(() => ({
      search: filter.value,
      status: statusFilter.value,
      type: tipoFiltro.value,
      dateStart: dataInicio.value,
      dateEnd: dataFim.value
    }))

    // Gatilho infalível para forçar o Quasar a refiltrar a tabela:
    // Concatena tudo num primitivo. Sempre que mudar, a QTable recarrega.
    const filterTrigger = computed(() => {
       return `${filter.value}|${statusFilter.value}|${tipoFiltro.value}|${dataInicio.value}|${dataFim.value}`
    })

    const customFilterMethod = (rows) => {
      const filters = activeFilters.value
      const hasStatus = !!filters.status
      const hasType = !!filters.type
      const hasStart = !!filters.dateStart
      const hasEnd = !!filters.dateEnd
      const hasSearch = !!(filters.search && filters.search.trim())

      // Pre-processamento fora do loop para máxima performance
      const d1 = hasStart ? new Date(filters.dateStart + 'T00:00:00').getTime() : 0
      const d2 = hasEnd ? new Date(filters.dateEnd + 'T23:59:59').getTime() : 0
      let q = '', qLower = '', qDigits = ''
      
      if (hasSearch) {
         q = filters.search.trim()
         qLower = q.toLowerCase()
         qDigits = normalizeCPF(q)
      }

      // Se não houver nenhum filtro ativo, a tabela nem precisa iterar
      if (!hasStatus && !hasType && !hasStart && !hasEnd && !hasSearch) {
         return rows
      }

      const recs = []
      const len = rows.length

      // Loop único de altíssima performance O(N) invés de 5 filter() seguidos (Evita 250k repetições)
      for (let i = 0; i < len; i++) {
        const row = rows[i]

        // 1. Status Filter
        if (hasStatus) {
           if (filters.status === 'errors' && (!row.erros || row.erros.length === 0)) continue
           if (filters.status === 'warnings' && (!row.avisos || row.avisos.length === 0)) continue
        }

        // 2. Type Filter
        if (hasType && row.tipo !== filters.type) continue

        // 3. Date Range (Cachea o .getTime())
        let rowTime = null
        if (hasStart || hasEnd) {
           if (!row.dataHora) continue
           rowTime = new Date(row.dataHora).getTime()
           if (isNaN(rowTime)) continue
        }
        if (hasStart && rowTime < d1) continue
        if (hasEnd && rowTime > d2) continue

        // 4. Search Filter
        if (hasSearch) {
           let match = false
           if (String(row.nsr || '').includes(q)) match = true
           else if (qDigits.length >= 3 && normalizeCPF(row.cpf || row.pis || '').includes(qDigits)) match = true
           else if (row.nomeEmpregado && row.nomeEmpregado.toLowerCase().includes(qLower)) match = true
           else if (row.erros && row.erros.some(err => err.toLowerCase().includes(qLower))) match = true
           else if (row.avisos && row.avisos.some(warn => (warn.msg || warn).toLowerCase().includes(qLower))) match = true

           if (!match) continue
        }

        // Se sobreviveu a todos os `continue`, é válido
        recs.push(row)
      }

      return recs
    }

    // ── Edição ───────────────────────────────────────────────────────────────
    const saveField = (row, field, val) => {
       const clone = { ...row, [field]: val }
       const errors = validateSingle(clone)
       if (errors.length > 0) {
          $q.notify({ type: 'warning', message: errors.join(', ') })
       }
       store.updateRecord(row.id, { [field]: val })
    }

    const saveFieldId = (row, val) => {
       store.updateRecord(row.id, { cpf: val, pis: val })
    }

    /**
     * Formata CNPJ (14 dígitos) ou CPF (11 dígitos) de acordo com o flag.
     * flag === '1' → CNPJ: XX.XXX.XXX/XXXX-XX
     * flag === '2' → CPF: XXX.XXX.XXX-XX
     */
    const formatCNPJ14 = (raw, flag) => {
      if (!raw) return '—'
      const d = raw.replace(/\D/g, '')
      if (flag === '2' && d.length >= 11) {
        const c = d.slice(-11)
        return `${c.substring(0,3)}.${c.substring(3,6)}.${c.substring(6,9)}-${c.substring(9,11)}`
      }
      if (d.length >= 14) {
        return `${d.substring(0,2)}.${d.substring(2,5)}.${d.substring(5,8)}/${d.substring(8,12)}-${d.substring(12,14)}`
      }
      return raw
    }

    /**
     * Formata data no formato AAAA-MM-dd → DD/MM/AAAA.
     */
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '—'
      const [y, m, dd] = dateStr.split('-')
      return `${dd}/${m}/${y}`
    }

    return {
      store,
      filter,
      statusFilter,
      statusFilterColor,
      statusFilterIcon,
      setStatusFilter,
      tipoFiltro,
      dataInicio,
      dataFim,
      tipoOptions,
      columns,
      headerRecord,
      isDetailOpen,
      selectedRecord,
      openRecordDetail,
      conflictModalOpen,
      conflictingRecord,
      openConflict,
      dayModalOpen,
      dayPunches,
      openDayPunches,
      formatDateTime,
      formatDataStr,
      formatHoraStr,
      formatFuso,
      formatCPF,
      formatCNPJ14,
      formatDate,
      filterTrigger,
      customFilterMethod,
      operacaoLabel,
      operacaoColor,
      formatPIS,
      copyToClipboard,
      saveField,
      saveFieldId,
      qTableRef,
      rootRef,
      tableHeight,
      pagination,
      localSearchQuery,
      onSearchInput,
      isFiltering,
      nsrModalOpen,
      nsrPrevRecord,
      nsrNextRecord,
      openNsrNeighborhood
    }
  }
})
</script>


<style scoped>
.q-pa-md {
  padding: 19px 16px;
}

/* ── Sticky Header ─────────────────────────────────────────────────────── */
.sticky-header-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--qm-surface);
  border-bottom: 2px solid var(--qm-border);
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sticky-header-table :deep(.q-table__middle) {
  overflow: auto;
}

/* ── Linhas clicáveis ──────────────────────────────────────────────────── */
.table-row {
  cursor: pointer;
  transition: background-color 0.1s ease;
}
.table-row:hover {
  background-color: var(--qm-hover-bg, rgba(255, 255, 255, 0.05));
}
.row-expanded {
  background-color: var(--qm-primary-muted, rgba(255, 255, 255, 0.08)) !important;
}

/* Linha selecionada */
.sticky-header-table :deep(tbody tr.row-selected) {
  background-color: var(--qm-primary-muted, rgba(255, 255, 255, 0.1)) !important;
}

/* ── Expansão inline ───────────────────────────────────────────────────── */
.expansion-row :deep(td) {
  padding: 0 !important;
}

.expansion-cell {
  padding: 0 !important;
}

.expansion-panel {
  border-top: 2px solid var(--qm-primary, #1565C0);
  border-bottom: 1px solid var(--qm-border-light, #2a2d2f);
  background: var(--qm-surface);
  padding: 14px 20px 16px;
  animation: slideDown 0.18s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.exp-header {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.exp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px 24px;
  margin-bottom: 14px;
  /* Garante que o grid não estoure a largura do container */
  min-width: 0;
  width: 100%;
}

.exp-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* Essencial: sem isso, filhos longos ignoram a largura do grid */
  min-width: 0;
  overflow: hidden;
}

.exp-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--qm-text-muted, #9e9e9e);
  white-space: nowrap;
}

.exp-value {
  font-size: 0.9rem;
  color: var(--qm-text, #212121);
  /* Quebra texto longo no limite da célula */
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

/* ── Fuso chip ─────────────────────────────────────────────────────────── */
.fuso-chip {
  display: inline-block;
  background: var(--qm-bg-tertiary, #25282a);
  color: var(--qm-text-primary, #fff);
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  padding: 1px 6px;
  letter-spacing: 0.03em;
}

/* ── Raw line ──────────────────────────────────────────────────────────── */
.exp-raw {
  border-top: 1px solid var(--qm-border-light, #e0e0e0);
  padding-top: 10px;
}

.raw-line {
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.72rem;
  color: var(--qm-text-muted, #737373);
  word-break: break-all;
  margin-top: 4px;
  background: var(--qm-bg-tertiary, #25282a);
  padding: 6px 10px;
  border-radius: 4px;
  line-height: 1.6;
}

.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

.raw-line-modal {
  word-break: break-all;
  border-radius: 12px;
  border: 1px dashed var(--qm-border-light, #cfd8dc);
  color: var(--qm-text-secondary, #90a4ae);
  opacity: 0.85;
  background-color: rgba(0, 0, 0, 0.03) !important;
  line-height: 1.6;
  font-size: 0.8rem;
  padding: 10px 14px;
}

[data-theme="dark"] .raw-line-modal {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

/* ── Identificador Cell com botão Copiar ───────────────────────────────── */
.ident-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  height: 18px;
  font-size: 0.82rem;
  line-height: 1;
  color: var(--qm-text-muted, #9e9e9e);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
  outline: none;
  opacity: 0;
  pointer-events: none;
}

.table-row:hover .copy-btn {
  opacity: 1;
  pointer-events: auto;
}

.copy-btn:hover {
  color: var(--qm-primary, #1565c0);
  background: var(--qm-hover-bg, rgba(21, 101, 192, 0.08));
}

.modal-slide-card {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

</style>

<style>
/* ── Modal Inteligente (Global, pois o q-dialog injeta no body) ── */

/* Remove a caixa delimitadora do container flex do pai para permitir que o filho vaze lado a lado sem overflow auto */
.wide-dialog .q-dialog__inner,
.wide-dialog .q-dialog__inner--minimized {
  overflow: visible !important;
}

/* Força a janela interna do filho a não ter maxWidth, borders nem background duro */
.wide-dialog .q-dialog__inner > div,
.wide-dialog .q-dialog__inner--minimized > div {
  max-width: 100vw !important;
  width: max-content !important;
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
  border-radius: 0 !important;
}
</style>
