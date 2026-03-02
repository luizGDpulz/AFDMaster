<template>
  <q-dialog v-model="open" @hide="$emit('update:modelValue', false)">
    <q-card style="min-width: 480px; max-width: 600px" class="soft-card">
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

      <!-- Tipo 5: Trabalhador -->
      <template v-if="record.tipo === '5'">
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
              <div class="detail-label">CPF do Empregado</div>
              <div class="detail-value text-mono">{{ formatCPF(record.cpf) || '—' }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Data / Hora da Gravação</div>
              <div class="detail-value">
                {{ formatDateTime(record.dataHora) }}
                <q-chip v-if="record.fusoHorario" dense size="sm" color="grey-3" text-color="grey-8" class="q-ml-xs">
                  {{ record.fusoHorario }}
                </q-chip>
              </div>
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
                <q-chip v-if="record.fusoHorario" dense size="sm" color="grey-3" text-color="grey-8" class="q-ml-xs">
                  {{ record.fusoHorario }}
                </q-chip>
              </div>
            </div>
            <div class="detail-item" v-if="record.cpf || record.pis">
              <div class="detail-label">CPF / PIS</div>
              <div class="detail-value text-mono">{{ formatCPF(record.cpf || record.pis) }}</div>
            </div>
            <div class="detail-item" v-if="record.crc">
              <div class="detail-label">CRC-16</div>
              <div class="detail-value text-mono text-grey-7">{{ record.crc }}</div>
            </div>
          </div>
          <div class="detail-label q-mb-xs q-mt-md">Linha raw</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">
            {{ record.raw }}
          </div>
        </q-card-section>
      </template>

      <q-card-actions align="right" class="q-pa-md q-pt-none">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue'
import RecordTypeBadge from 'src/components/RecordTypeBadge.vue'

export default defineComponent({
  name: 'RecordDetailDialog',
  components: { RecordTypeBadge },

  props: {
    modelValue: { type: Boolean, default: false },
    record: { type: Object, default: () => ({}) }
  },

  emits: ['update:modelValue'],

  setup(props) {
    const open = computed(() => props.modelValue)

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

    return { open, operacaoLabel, operacaoColor, formatCPF, formatDateTime }
  }
})
</script>

<style scoped>
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9e9e9e;
}

.detail-value {
  font-size: 0.95rem;
  color: #212121;
}

.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

.raw-line {
  word-break: break-all;
  border-radius: 6px;
  color: #546e7a;
  line-height: 1.6;
}
</style>
