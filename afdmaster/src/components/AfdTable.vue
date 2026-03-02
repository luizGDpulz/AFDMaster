<template>
  <div class="q-pa-md">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="warning" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado importado.</div>
      <q-btn flat color="primary" to="/" label="Ir para Upload" class="q-mt-sm" />
    </div>

    <div v-else>

      <div class="row items-center q-mb-sm q-col-gutter-sm">
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
        :rows="filteredRecords"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :filter-method="filterMethod"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        :rows-per-page-options="[0]"
        style="height: 65vh"
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
            @click="toggleRow(props.row)"
            class="table-row"
            :class="{ 'row-expanded': expandedIds.has(props.row.id) }"
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

          <!-- Linha Expandida (Inline Panel) -->
          <q-tr v-if="expandedIds.has(props.row.id)" :props="props" :key="`exp-${props.key}`" class="expansion-row">
            <q-td colspan="100%" class="expansion-cell">
              <div class="expansion-panel">
                
                <div class="exp-header">
                  <RecordTypeBadge :tipo="props.row.tipo" />
                  <q-chip v-if="props.row.tipo === '5'" :color="operacaoColor(props.row.operacao)" text-color="white" icon="person" size="sm" class="q-ml-sm" dense>{{ operacaoLabel(props.row.operacao) }}</q-chip>
                  <span class="text-caption text-grey-5 q-ml-sm">NSR #{{ props.row.nsr }}</span>
                  <q-space />
                  <q-btn icon="close" flat round dense size="sm" @click.stop="toggleRow(props.row)" />
                </div>

                <!-- Campos tipo 5 -->
                <div v-if="props.row.tipo === '5'" class="exp-grid">
                  <div class="exp-field">
                    <div class="exp-label">Nome do Empregado</div>
                    <div class="exp-value text-weight-bold">{{ props.row.nomeEmpregado || '—' }}</div>
                  </div>
                  <div class="exp-field">
                    <div class="exp-label">CPF do Empregado</div>
                    <div class="exp-value text-mono">{{ formatCPF(props.row.cpf) }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.dataHora">
                    <div class="exp-label">Data / Hora</div>
                    <div class="exp-value">{{ formatDateTime(props.row.dataHora) }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.fusoHorario">
                    <div class="exp-label">Fuso Horário</div>
                    <div class="exp-value"><span class="fuso-chip">{{ formatFuso(props.row.fusoHorario) }}</span></div>
                  </div>
                  <div class="exp-field">
                    <div class="exp-label">CPF Responsável</div>
                    <div class="exp-value text-mono">{{ formatCPF(props.row.cpfResponsavel) || '—' }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.demaisDados">
                    <div class="exp-label">Demais Dados</div>
                    <div class="exp-value text-mono">{{ props.row.demaisDados }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.crc">
                    <div class="exp-label">CRC-16</div>
                    <div class="exp-value text-mono text-grey-6">{{ props.row.crc }}</div>
                  </div>
                </div>

                <!-- Campos genéricos -->
                <div v-else class="exp-grid">
                  <div class="exp-field" v-if="props.row.dataHora">
                    <div class="exp-label">Data / Hora</div>
                    <div class="exp-value">{{ formatDateTime(props.row.dataHora) }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.fusoHorario">
                    <div class="exp-label">Fuso Horário</div>
                    <div class="exp-value"><span class="fuso-chip">{{ formatFuso(props.row.fusoHorario) }}</span></div>
                  </div>
                  <div class="exp-field" v-if="props.row.cpf || props.row.pis">
                    <div class="exp-label">CPF / PIS</div>
                    <div class="exp-value text-mono">{{ formatCPF(props.row.cpf || props.row.pis) }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.crc">
                    <div class="exp-label">CRC-16</div>
                    <div class="exp-value text-mono text-grey-6">{{ props.row.crc }}</div>
                  </div>
                  <div class="exp-field" v-if="props.row.erros && props.row.erros.length > 0">
                    <div class="exp-label">Erros</div>
                    <div v-for="(e, i) in props.row.erros" :key="i" class="exp-value text-negative">{{ e }}</div>
                  </div>
                </div>

                <!-- Linha raw -->
                <div class="exp-raw">
                  <span class="exp-label">Linha raw</span>
                  <div class="raw-line text-mono">{{ props.row.raw }}</div>
                </div>

              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>

    </div>
  </div>

</template>
<script>
import { defineComponent, ref, computed } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useValidators } from 'src/composables/useValidators'
import { useQuasar } from 'quasar'
import RecordTypeBadge from 'src/components/RecordTypeBadge.vue'

const OPERACAO_MAP = {
  'I': { label: 'Inclusão',  color: 'positive' },
  'A': { label: 'Alteração', color: 'warning'  },
  'E': { label: 'Exclusão',  color: 'negative' },
}

export default defineComponent({
  name: 'AfdTable',
  components: { RecordTypeBadge },
  setup() {
    const store = useAfdStore()
    const { validateSingle, validateBulk } = useValidators()
    const $q = useQuasar()

    // ── Expansão Inline Múltipla ──────────────────────────────────────────────
    const expandedIds = ref(new Set())

    const toggleRow = (row) => {
      const newSet = new Set(expandedIds.value)
      if (newSet.has(row.id)) {
        newSet.delete(row.id)
      } else {
        newSet.add(row.id)
      }
      expandedIds.value = newSet
    }

    // ── Filtros ──────────────────────────────────────────────────────────────
    const filter = ref('')
    const showOnlyErrors = ref(false)
    const tipoFiltro = ref(null)
    const dataInicio = ref('')
    const dataFim = ref('')

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
      showOnlyErrors.value = !showOnlyErrors.value
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
      const d = cpf.replace(/\D/g, '')
      // O AFD 671 armazena CPF em 12 posições (zero à esquerda): normaliza para 11 dígitos
      const digits = d.length === 12 ? d.replace(/^0+/, '') : d.replace(/^0+(?=\d{11})/, '')
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,6)}.${digits.substring(6,9)}-${digits.substring(9,11)}`
      }
      return cpf // fallback: exibe como veio
    }

    /**
     * Normaliza um CPF para dígitos limpos (sem zeros à esquerda).
     * Usado na busca para comparar query contra campo independente do formato.
     */
    const normalizeCPF = (raw) => {
      if (!raw) return ''
      return raw.replace(/\D/g, '').replace(/^0+/, '')
    }

    /**
     * Filter method customizado para a q-table.
     * Suporta:
     *  - Busca por NSR (numérico)
     *  - Busca por CPF/PIS formatado (xxx.xxx.xxx-xx) OU apenas dígitos
     *  - Busca por nome do empregado (tipo 5)
     */
    const filterMethod = (rows, terms) => {
      if (!terms || !terms.trim()) return rows
      const q = terms.trim()
      const qLower = q.toLowerCase()
      const qDigits = normalizeCPF(q) // somente dígitos sem zeros iniciais

      return rows.filter(row => {
        // NSR
        if (String(row.nsr || '').includes(q)) return true
        // CPF / PIS — compara dígitos normalizados
        if (qDigits.length >= 3) {
          const rowCpf = normalizeCPF(row.cpf || row.pis || '')
          if (rowCpf.includes(qDigits)) return true
        }
        // Nome empregado (tipo 5)
        if (row.nomeEmpregado && row.nomeEmpregado.toLowerCase().includes(qLower)) return true
        return false
      })
    }

    // ── Tipo 5 helpers ───────────────────────────────────────────────────────
    const operacaoLabel = (op) => OPERACAO_MAP[op]?.label ?? (op ? `"${op}"` : 'Desconhecida')
    const operacaoColor = (op) => OPERACAO_MAP[op]?.color ?? 'grey'

    // ── Dados ────────────────────────────────────────────────────────────────
    const headerRecord = computed(() => store.records.find(r => r.tipo === '1'))

    const columns = [
      { name: 'nsr',           label: 'NSR',       field: 'nsr',    sortable: true,  align: 'left',   style: 'width: 10%;', headerStyle: 'width: 10%;' },
      { name: 'tipo',          label: 'Tipo',      field: 'tipo',   sortable: true,  align: 'center', style: 'width: 10%;', headerStyle: 'width: 10%;' },
      { name: 'data',          label: 'Data',      field: 'data',   sortable: false, align: 'left',   style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'hora',          label: 'Hora',      field: 'hora',   sortable: false, align: 'left',   style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'fuso',          label: 'Fuso',      field: 'fuso',   sortable: false, align: 'center', style: 'width: 12%;', headerStyle: 'width: 12%;' },
      { name: 'identificador', label: 'CPF / PIS', field: 'id',     sortable: true,  align: 'left',   style: 'width: 18%;', headerStyle: 'width: 18%;' },
      { name: 'crc',           label: 'CRC',       field: 'crc',    sortable: false, align: 'center', style: 'width: 14%;', headerStyle: 'width: 14%;' },
      { name: 'status',        label: 'Status',    field: 'status', align: 'center',                  style: 'width: 12%;', headerStyle: 'width: 12%;' },
    ]

    const filteredRecords = computed(() => {
      let recs = store.records

      if (showOnlyErrors.value) {
        recs = recs.filter(r => r.erros && r.erros.length > 0)
      }

      if (tipoFiltro.value) {
        recs = recs.filter(r => r.tipo === tipoFiltro.value)
      }

      if (dataInicio.value) {
        const d1 = new Date(dataInicio.value + 'T00:00:00').getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() >= d1)
      }

      if (dataFim.value) {
        const d2 = new Date(dataFim.value + 'T23:59:59').getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() <= d2)
      }

      return recs
    })

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
      filteredRecords,
      headerRecord,
      expandedIds,
      toggleRow,
      formatDateTime,
      formatDataStr,
      formatHoraStr,
      formatFuso,
      formatCPF,
      filterMethod,
      operacaoLabel,
      operacaoColor,
      saveField,
      saveFieldId,
    }
  }
})
</script>

<style scoped>
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
