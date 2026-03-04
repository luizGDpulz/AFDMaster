<template>
  <div class="q-pa-md" ref="rootRef">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="warning" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado importado.</div>
      <q-btn flat color="primary" to="/" label="Ir para Upload" class="q-mt-sm" />
    </div>

    <div v-else>

      <div class="row items-center q-mb-xs q-col-gutter-sm">
        <div class="col-12 col-md-3">
           <q-select
              dense outlined
              v-model="tipoFiltro"
              :options="tipoOptions"
              label="Filtrar por Tipo"
              class="soft-input bg-white"
              emit-value map-options
           />
        </div>
        <div class="col-12 col-md-2">
           <q-input dense outlined v-model="dataInicio" type="date" label="Data Início" class="soft-input bg-white" />
        </div>
        <div class="col-12 col-md-2">
           <q-input dense outlined v-model="dataFim" type="date" label="Data Fim" class="soft-input bg-white" />
        </div>
        <div class="col-12 col-md-5 row justify-end items-center">
            <q-input dense outlined v-model="filter" placeholder="Buscar: NSR, CPF, nome..." class="q-mr-sm soft-input bg-white" style="flex-grow: 1;">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
                unelevated
                class="soft-btn"
                icon="filter_alt"
                label="Somente Erros"
                @click="toggleErrorsFilter"
                :color="showOnlyErrors ? 'negative' : 'primary'"
            />
        </div>
      </div>

      <q-table
        flat bordered
        :rows="store.records"
        :columns="columns"
        row-key="id"
        :filter="filterTrigger"
        :filter-method="customFilterMethod"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        v-model:pagination="pagination"
        :rows-per-page-options="[0]"
        ref="qTableRef"
        :style="{ height: tableHeight + 'px' }"
        table-style="table-layout: fixed; width: 100%;"
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
                   {{ formatCPF(props.row.cpf || props.row.pis) }}
                </template>
                <template v-else-if="col.name === 'status'">
                   <q-badge v-if="props.row.erros && props.row.erros.length > 0" color="negative" text-color="white">
                     {{ props.row.erros.length }} Erro(s)
                     <q-tooltip><div v-for="(err, i) in props.row.erros" :key="i">- {{ err }}</div></q-tooltip>
                   </q-badge>
                   <q-badge v-else-if="props.row.alterado" color="warning" text-color="black">Editado</q-badge>
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

      <!-- Modal de Detalhes de Registro (Substitui Expansão Inline) -->
      <RecordDetailDialog v-model="isDetailOpen" :record="selectedRecord" />

    </div>
  </div>

</template>
<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useValidators } from 'src/composables/useValidators'
import { useQuasar } from 'quasar'
import RecordTypeBadge from 'src/components/RecordTypeBadge.vue'
import RecordDetailDialog from 'src/components/RecordDetailDialog.vue'

const OPERACAO_MAP = {
  'I': { label: 'Inclusão',  color: 'positive' },
  'A': { label: 'Alteração', color: 'warning'  },
  'E': { label: 'Exclusão',  color: 'negative' },
}

export default defineComponent({
  name: 'AfdTable',
  components: { RecordTypeBadge, RecordDetailDialog },
  setup() {
    const store = useAfdStore()
    const { validateSingle, validateBulk } = useValidators()
    const $q = useQuasar()

    const pagination = ref({ rowsPerPage: 0 })

    // ── Altura dinâmica da tabela ──────────────────────────────────────────
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
      
      // Threshold check to prevent ResizeObserver infinite loops on virtual scroll jumps
      if (Math.abs(tableHeight.value - newHeight) > 10) {
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
      
      // Fallbacks para garantir que a medida ocorra após montagem
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

    const openRecordDetail = (row) => {
      selectedRecord.value = row
      isDetailOpen.value = true
    }

    // ── Filtros ──────────────────────────────────────────────────────────────
    const filter = computed({
      get: () => store.filters.search,
      set: (val) => store.setFilters({ search: val })
    })
    const showOnlyErrors = computed({
      get: () => store.filters.onlyErrors,
      set: (val) => store.setFilters({ onlyErrors: val })
    })
    const tipoFiltro = computed({
      get: () => store.filters.type,
      set: (val) => store.setFilters({ type: val })
    })
    const dataInicio = computed({
       get: () => store.filters.dateStart,
       set: (val) => store.setFilters({ dateStart: val })
    })
    const dataFim = computed({
       get: () => store.filters.dateEnd,
       set: (val) => store.setFilters({ dateEnd: val })
    })

    const tipoOptions = [
      { label: 'Todos os Registros', value: null },
      { label: '1 - Cabeçalho', value: '1' },
      { label: '2 - Empregador / Empresa', value: '2' },
      { label: '3 - Marcação de Ponto', value: '3' },
      { label: '4 - Ajuste de Relógio', value: '4' },
      { label: '5 - Trabalhador', value: '5' },
      { label: '6 - Eventos', value: '6' },
      { label: '7 - Marcação REP-P', value: '7' }
    ]

    const toggleErrorsFilter = () => {
      const isCurrentlyActive = showOnlyErrors.value
      showOnlyErrors.value = !isCurrentlyActive
      
      // Quando o usuário desmarcar o botão "Somente Erros", 
      // limpa a barra de pesquisa junto para fechar o Drill-down de vez
      if (isCurrentlyActive) {
        filter.value = ''
      }
    }

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

    // ── Tipo 5 helpers ───────────────────────────────────────────────────────
    const operacaoLabel = (op) => OPERACAO_MAP[op]?.label ?? (op ? `"${op}"` : 'Desconhecida')
    const operacaoColor = (op) => OPERACAO_MAP[op]?.color ?? 'grey'

    // ── Dados ────────────────────────────────────────────────────────────────
    const headerRecord = computed(() => store.records.find(r => r.tipo === '1'))

    const columns = computed(() => [
      { name: 'nsr',           label: 'NSR',       field: 'nsr',    sortable: true,  align: 'left',   style: 'width: 10%;', headerStyle: 'width: 10%;' },
      { name: 'tipo',          label: 'Tipo',      field: 'tipo',   sortable: true,  align: 'center', style: 'width: 10%;', headerStyle: 'width: 10%;' },
      { name: 'data',          label: 'Data',      field: 'data',   sortable: false, align: 'left',   style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'hora',          label: 'Hora',      field: 'hora',   sortable: false, align: 'left',   style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'fuso',          label: 'Fuso',      field: 'fuso',   sortable: false, align: 'center', style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'identificador', label: store.portaria === '1510' ? 'PIS' : 'CPF', field: 'id', sortable: true, align: 'left', style: 'width: 18%;', headerStyle: 'width: 18%;' },
      { name: 'crc',           label: 'CRC',       field: 'crc',    sortable: false, align: 'center', style: 'width: 14%;', headerStyle: 'width: 14%;' },
      { name: 'status',        label: 'Status',    field: 'status', align: 'center',                  style: 'width: 12%;', headerStyle: 'width: 12%;' },
    ])

    const normalizeCPF = (raw) => {
      if (!raw) return ''
      return raw.replace(/\D/g, '').replace(/^0+/, '')
    }

    const activeFilters = computed(() => ({
      search: filter.value,
      onlyErrors: showOnlyErrors.value,
      type: tipoFiltro.value,
      dateStart: dataInicio.value,
      dateEnd: dataFim.value
    }))

    // Gatilho infalível para forçar o Quasar a refiltrar a tabela:
    // Concatena tudo num primitivo. Sempre que mudar, a QTable recarrega.
    const filterTrigger = computed(() => {
       return `${filter.value}|${showOnlyErrors.value}|${tipoFiltro.value}|${dataInicio.value}|${dataFim.value}`
    })

    const customFilterMethod = (rows) => {
      let recs = rows
      const filters = activeFilters.value

      if (filters.onlyErrors) {
        recs = recs.filter(r => r.erros && r.erros.length > 0)
      }

      if (filters.type) {
        recs = recs.filter(r => r.tipo === filters.type)
      }

      if (filters.dateStart) {
        const d1 = new Date(filters.dateStart + 'T00:00:00').getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() >= d1)
      }

      if (filters.dateEnd) {
        const d2 = new Date(filters.dateEnd + 'T23:59:59').getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() <= d2)
      }

      if (filters.search && filters.search.trim()) {
         const q = filters.search.trim()
         const qLower = q.toLowerCase()
         const qDigits = normalizeCPF(q)

         recs = recs.filter(row => {
            if (String(row.nsr || '').includes(q)) return true
            if (qDigits.length >= 3) {
               const rowCpf = normalizeCPF(row.cpf || row.pis || '')
               if (rowCpf.includes(qDigits)) return true
            }
            if (row.nomeEmpregado && row.nomeEmpregado.toLowerCase().includes(qLower)) return true
            if (row.erros && row.erros.some(err => err.toLowerCase().includes(qLower))) return true
            return false
         })
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
       validatorsrecheck()
    }

    const saveFieldId = (row, val) => {
       store.updateRecord(row.id, { cpf: val, pis: val })
       validatorsrecheck()
    }

    const validatorsrecheck = () => {
        validateBulk(store.records, store.portaria, store.settings.checkNsrSequential)
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
      showOnlyErrors,
      tipoFiltro,
      dataInicio,
      dataFim,
      tipoOptions,
      toggleErrorsFilter,
      columns,
      headerRecord,
      isDetailOpen,
      selectedRecord,
      openRecordDetail,
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
      saveField,
      saveFieldId,
      qTableRef,
      rootRef,
      tableHeight,
      pagination
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
  background: #fff;
  border-bottom: 2px solid #e0e0e0;
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
  background-color: rgba(0, 0, 0, 0.04);
}
.row-expanded {
  background-color: rgba(21, 101, 192, 0.06) !important;
}

/* Linha selecionada */
.sticky-header-table :deep(tbody tr.row-selected) {
  background-color: rgba(21, 101, 192, 0.07) !important;
}

/* ── Expansão inline ───────────────────────────────────────────────────── */
.expansion-row :deep(td) {
  padding: 0 !important;
}

.expansion-cell {
  padding: 0 !important;
}

.expansion-panel {
  border-top: 2px solid #1565C0;
  border-bottom: 1px solid #e8eaf6;
  background: linear-gradient(to bottom, #f3f6fd, #ffffff);
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
  color: #9e9e9e;
  white-space: nowrap;
}

.exp-value {
  font-size: 0.9rem;
  color: #212121;
  /* Quebra texto longo no limite da célula */
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

/* ── Fuso chip ─────────────────────────────────────────────────────────── */
.fuso-chip {
  display: inline-block;
  background: #e8eaf6;
  color: #3949ab;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  padding: 1px 6px;
  letter-spacing: 0.03em;
}

/* ── Raw line ──────────────────────────────────────────────────────────── */
.exp-raw {
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
}

.raw-line {
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.72rem;
  color: #607d8b;
  word-break: break-all;
  margin-top: 4px;
  background: #f5f5f5;
  padding: 6px 10px;
  border-radius: 4px;
  line-height: 1.6;
}

.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}
</style>
