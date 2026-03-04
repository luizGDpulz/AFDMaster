<template>
  <q-dialog v-model="open" @hide="$emit('update:modelValue', false)">
    <q-card style="min-width: 480px; max-width: 600px; border-radius: 24px;" class="soft-card">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center q-gutter-sm">
          <RecordTypeBadge :tipo="record.tipo" />
          <span class="text-h6 text-weight-bold">Detalhe do Registro</span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="q-mt-sm" />

      <!-- Tipo 1: Cabeçalho -->
      <template v-if="record.tipo === '1'">
        <q-card-section class="q-pt-md">
           <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Empresa</div>
                <div class="detail-value text-weight-bold">{{ record.empregadorNome || '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">{{ record.flagCNPJ === '1' ? 'CNPJ' : 'CPF' }} Empregador</div>
                <div class="detail-value text-mono">{{ formatCNPJ14(record.empregadorCnpjCpf, record.flagCNPJ) }}</div>
              </div>
              <div class="detail-item" v-if="record.cnoCapef && record.cnoCapef !== '00000000000000'">
                <div class="detail-label">CNO / CAEPF</div>
                <div class="detail-value text-mono">{{ record.cnoCapef }}</div>
              </div>
              <div class="detail-item" v-if="record.dataInicial">
                <div class="detail-label">Data Inicial</div>
                <div class="detail-value">{{ formatDate(record.dataInicial) }}</div>
              </div>
              <div class="detail-item" v-if="record.dataFinal">
                <div class="detail-label">Data Final</div>
                <div class="detail-value">{{ formatDate(record.dataFinal) }}</div>
              </div>
              <div class="detail-item" v-if="record.dataHora">
                <div class="detail-label">Geração do Arquivo</div>
                <div class="detail-value">{{ formatDateTime(record.dataHora) }}</div>
              </div>
              <div class="detail-item" v-if="record.fusoHorario">
                <div class="detail-label">Fuso Horário</div>
                <span class="fuso-chip">GMT{{ record.fusoHorario }}</span>
              </div>
              <div class="detail-item" v-if="record.nroFabricacao">
                <div class="detail-label">Nº Fabricação</div>
                <div class="detail-value text-mono">{{ record.nroFabricacao }}</div>
              </div>
              <div class="detail-item" v-if="record.modelo">
                <div class="detail-label">Modelo</div>
                <div class="detail-value">{{ record.modelo }}</div>
              </div>
              <div class="detail-item" v-if="record.cnpjFabricante">
                <div class="detail-label">{{ record.flagFabricante === '1' ? 'CNPJ' : 'CPF' }} Fabricante</div>
                <div class="detail-value text-mono">{{ formatCNPJ14(record.cnpjFabricante, record.flagFabricante) }}</div>
              </div>
              <div class="detail-item" v-if="record.crc">
                <div class="detail-label">CRC-16</div>
                <div class="detail-value text-mono text-grey-7">{{ record.crc }}</div>
              </div>
              <div class="detail-item" v-if="record.erros && record.erros.length > 0">
                <div class="detail-label text-negative">Erros de Validação</div>
                <div v-for="(e, i) in record.erros" :key="i" class="detail-value text-negative text-weight-bold">
                  • {{ e }}
                </div>
              </div>
           </div>
        </q-card-section>
        
        <!-- Raw line -->
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw (Original)</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>

      <!-- Tipo 2: Empresa (Inclusão/Alteração) -->
      <template v-else-if="record.tipo === '2'">
        <q-card-section class="q-pt-md">
           <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Razão Social / Nome</div>
                <div class="detail-value text-weight-bold">{{ record.empregadorNome || '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">{{ record.flagCNPJ === '1' ? 'CNPJ' : 'CPF' }} Empregador</div>
                <div class="detail-value text-mono">{{ formatCNPJ14(record.empregadorCnpjCpf, record.flagCNPJ) }}</div>
              </div>
              <div class="detail-item" v-if="record.cnoCapef && record.cnoCapef !== '00000000000000'">
                <div class="detail-label">CNO / CAEPF</div>
                <div class="detail-value text-mono">{{ record.cnoCapef }}</div>
              </div>
              <div class="detail-item" v-if="record.local">
                <div class="detail-label">Local de Prestação</div>
                <div class="detail-value">{{ record.local }}</div>
              </div>
              <div class="detail-item" v-if="record.dataHora">
                <div class="detail-label">Data / Hora</div>
                <div class="detail-value">{{ formatDateTime(record.dataHora) }}</div>
              </div>
              <div class="detail-item" v-if="record.fusoHorario">
                <div class="detail-label">Fuso Horário</div>
                <span class="fuso-chip">GMT{{ record.fusoHorario }}</span>
              </div>
              <div class="detail-item" v-if="record.cpf">
                <div class="detail-label">CPF Responsável</div>
                <div class="detail-value text-mono">{{ formatCPF(record.cpf) }}</div>
              </div>
              <div class="detail-item" v-if="record.crc">
                <div class="detail-label">CRC-16</div>
                <div class="detail-value text-mono text-grey-7">{{ record.crc }}</div>
              </div>
              <div class="detail-item" v-if="record.erros && record.erros.length > 0">
                <div class="detail-label text-negative">Erros de Validação</div>
                <div v-for="(e, i) in record.erros" :key="i" class="detail-value text-negative text-weight-bold">
                  • {{ e }}
                </div>
              </div>
           </div>
        </q-card-section>
        
        <!-- Raw line -->
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw (Original)</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>

      <!-- Tipo 9: Trailer -->
      <template v-else-if="record.tipo === '9'">
        <q-card-section class="q-pt-md">
           <div class="detail-grid">
              <div class="detail-item" v-if="record.qtdTipo2 !== undefined">
                <div class="detail-label">Qtde. Tipo 2 (Empresa)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo2 }}</div>
              </div>
              <div class="detail-item" v-if="record.qtdTipo3 !== undefined">
                <div class="detail-label">Qtde. Tipo 3 (Marcação Ponto)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo3 }}</div>
              </div>
              <div class="detail-item" v-if="record.qtdTipo4 !== undefined">
                <div class="detail-label">Qtde. Tipo 4 (Ajuste Relógio)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo4 }}</div>
              </div>
              <div class="detail-item" v-if="record.qtdTipo5 !== undefined">
                <div class="detail-label">Qtde. Tipo 5 (Empregados)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo5 }}</div>
              </div>
              <div class="detail-item" v-if="record.qtdTipo6 !== undefined">
                <div class="detail-label">Qtde. Tipo 6 (Eventos REP)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo6 }}</div>
              </div>
              <div class="detail-item" v-if="record.qtdTipo7 !== undefined">
                <div class="detail-label">Qtde. Tipo 7 (Marcações REP-P)</div>
                <div class="detail-value text-mono text-weight-bold">{{ record.qtdTipo7 }}</div>
              </div>
           </div>
        </q-card-section>

        <!-- Raw line -->
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw (Original)</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>

      <!-- Tipo 5: Trabalhador -->
      <template v-else-if="record.tipo === '5'">
        <q-card-section class="q-pt-md">
          <!-- Operação badge -->
          <div class="row items-center q-mb-lg q-gutter-sm">
            <q-chip
              :color="operacaoColor"
              text-color="white"
              icon="person"
              size="md"
              class="text-weight-bold"
            >
              {{ operacaoLabel }}
            </q-chip>
            <span class="text-caption text-grey-6">NSR #{{ record.nsr }}</span>
          </div>

          <!-- Grid de campos -->
          <div class="detail-grid">

            <div class="detail-item">
              <div class="detail-label">Nome do Empregado</div>
              <div class="detail-value text-weight-bold text-body1">
                {{ record.nomeEmpregado || '—' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">{{ identificadorLabel }} do Empregado</div>
              <div class="detail-value text-mono">{{ formatCPF(record.cpf) || '—' }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Data / Hora da Gravação</div>
              <div class="detail-value">
                {{ formatDateTime(record.dataHora) }}
              </div>
            </div>

            <div class="detail-item" v-if="record.fusoHorario">
              <div class="detail-label">Fuso Horário</div>
              <span class="fuso-chip">GMT{{ record.fusoHorario }}</span>
            </div>

            <div class="detail-item">
              <div class="detail-label">CPF Responsável</div>
              <div class="detail-value text-mono">{{ formatCPF(record.cpfResponsavel) || '—' }}</div>
            </div>

            <div class="detail-item" v-if="record.demaisDados">
              <div class="detail-label">Demais Dados</div>
              <div class="detail-value text-mono">{{ record.demaisDados }}</div>
            </div>

            <div class="detail-item" v-if="record.crc">
              <div class="detail-label">CRC-16</div>
              <div class="detail-value text-mono text-grey-7">{{ record.crc }}</div>
            </div>

            <div class="detail-item" v-if="record.erros && record.erros.length > 0">
              <div class="detail-label text-negative">Erros de Validação</div>
              <div v-for="(e, i) in record.erros" :key="i" class="detail-value text-negative text-weight-bold">
                • {{ e }}
              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Raw line -->
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>

      <!-- Outros tipos: exibe campos genéricos disponíveis -->
      <template v-else>
        <q-card-section>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">NSR</div>
              <div class="detail-value text-mono">{{ record.nsr }}</div>
            </div>
            <div class="detail-item" v-if="record.dataHora">
              <div class="detail-label">Data / Hora</div>
              <div class="detail-value">
                {{ formatDateTime(record.dataHora) }}
              </div>
            </div>
            <div class="detail-item" v-if="record.fusoHorario">
              <div class="detail-label">Fuso Horário</div>
              <span class="fuso-chip">GMT{{ record.fusoHorario }}</span>
            </div>
            <div class="detail-item" v-if="record.cpf || record.pis">
              <div class="detail-label">{{ identificadorLabel }}</div>
              <div class="detail-value text-mono">{{ formatCPF(record.cpf || record.pis) }}</div>
            </div>
            <div class="detail-item" v-if="record.crc">
              <div class="detail-label">CRC-16</div>
              <div class="detail-value text-mono text-grey-7">{{ record.crc }}</div>
            </div>
            <div class="detail-item" v-if="record.erros && record.erros.length > 0">
              <div class="detail-label text-negative">Erros de Validação</div>
              <div v-for="(e, i) in record.erros" :key="i" class="detail-value text-negative text-weight-bold">
                • {{ e }}
              </div>
            </div>
          </div>
          <div class="detail-label q-mb-xs q-mt-md">Linha raw</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import RecordTypeBadge from 'src/components/RecordTypeBadge.vue'

export default defineComponent({
  name: 'RecordDetailDialog',
  components: { RecordTypeBadge },

  props: {
    modelValue: { type: Boolean, default: false },
    record: { type: Object, default: () => ({}) }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const store = useAfdStore()
    const identificadorLabel = computed(() => store.portaria === '1510' ? 'PIS' : 'CPF')

    const open = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const OPERACAO_MAP = {
      'I': { label: 'Inclusão',  color: 'positive' },
      'A': { label: 'Alteração', color: 'warning'  },
      'E': { label: 'Exclusão',  color: 'negative' },
    }

    const operacaoLabel = computed(() => {
      const op = props.record?.operacao
      return OPERACAO_MAP[op]?.label ?? (op ? `Operação "${op}"` : 'Desconhecida')
    })

    const operacaoColor = computed(() => {
      const op = props.record?.operacao
      return OPERACAO_MAP[op]?.color ?? 'grey'
    })

    const formatCPF = (cpf) => {
      if (!cpf) return null
      const digits = cpf.replace(/\D/g, '')
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,6)}.${digits.substring(6,9)}-${digits.substring(9,11)}`
      }
      if (digits.length === 12) {
        // CPF de 12 dígitos (padrão 671): primeiro dígito pode ser leading zero de PIS
        // Exibe formatado como 3.3.3-2 ou 11 dígitos sem leading zero
        const trimmed = digits.replace(/^0/, '')
        if (trimmed.length === 11) {
          return `${trimmed.substring(0,3)}.${trimmed.substring(3,6)}.${trimmed.substring(6,9)}-${trimmed.substring(9,11)}`
        }
      }
      return cpf
    }

    const formatDateTime = (isoStr) => {
      if (!isoStr) return '—'
      try {
        const dt = new Date(isoStr)
        if (isNaN(dt.getTime())) return isoStr
        return dt.toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
      } catch {
        return isoStr
      }
    }

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

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '—'
      const [y, m, dd] = dateStr.split('-')
      return `${dd}/${m}/${y}`
    }

    return { open, identificadorLabel, operacaoLabel, operacaoColor, formatCPF, formatDateTime, formatCNPJ14, formatDate }
  }
})
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px 24px;
  min-width: 0;
  width: 100%;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.detail-label {
  font-size: 0.70rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #78909c;
  margin-bottom: 2px;
  padding-left: 4px;
}

.detail-value {
  font-size: 0.9rem;
  color: #263238;
  background-color: #f5f7fa;
  padding: 6px 14px;
  border-radius: 24px;
  display: inline-block;
  word-break: break-word;
  overflow-wrap: break-word;
  font-weight: 500;
  border: 1px solid #eceff1;
}

.detail-value.text-negative {
  background-color: #ffebee;
  color: #c62828 !important;
  border-color: #ffcdd2;
  border-radius: 12px;
  margin-bottom: 4px;
}

/* ── Fuso chip ── */
.fuso-chip {
  display: inline-block;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  padding: 6px 14px;
  letter-spacing: 0.03em;
  border: 1px solid #bbdefb;
  width: fit-content;
}

.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

.raw-line {
  word-break: break-all;
  border-radius: 12px;
  border: 1px solid #cfd8dc;
  color: #546e7a;
  background-color: #eceff1 !important;
  line-height: 1.6;
}
</style>
