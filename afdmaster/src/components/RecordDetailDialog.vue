<template>
    <q-card style="min-width: 480px; max-width: 600px; border-radius: 24px; max-height: 90vh; display: flex; flex-direction: column;"
            class="soft-card shadow-12">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center q-gutter-sm">
          <RecordTypeBadge :tipo="record.tipo" />
          <span class="text-h6 text-weight-bold" v-if="!isChild">Detalhe do Registro</span>
          <span class="text-h6 text-weight-bold" v-else>Registro Conflitante</span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('hide')" />
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
              <!-- CEI (1510) -->
              <div class="detail-item" v-if="record.cei && !/^0+$/.test(record.cei)">
                <div class="detail-label">CEI</div>
                <div class="detail-value text-mono">{{ record.cei }}</div>
              </div>
              <!-- CNO/CAEPF (671) -->
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
                <div class="detail-label">Nº Fabricação REP</div>
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
              <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
                <div class="detail-label text-warning-dark">Avisos</div>
                <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold">
                  • {{ w }}
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
              <!-- CEI (1510) -->
              <div class="detail-item" v-if="record.cei && !/^0+$/.test(record.cei)">
                <div class="detail-label">CEI</div>
                <div class="detail-value text-mono">{{ record.cei }}</div>
              </div>
              <!-- CNO/CAEPF (671) -->
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
              <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
                <div class="detail-label text-warning-dark">Avisos</div>
                <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold row items-center justify-between no-wrap q-mb-xs">
                  <span class="q-pr-sm">• {{ w.msg || w }}</span>
                  <q-btn v-if="w.conflitoNsr" size="sm" color="warning" text-color="black" outline label="Ver conflitante" dense flat @click="viewConflict(w.conflitoNsr)" />
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

      <!-- Tipo 3: Marcação de Ponto -->
      <template v-else-if="record.tipo === '3'">
        <q-card-section class="q-pt-md">
          <div class="detail-grid">
            <div class="detail-item" v-if="record.ordemPar">
              <div class="detail-label">Marcação</div>
              <div>
                <q-chip :color="record.ordemPar.startsWith('Entrada') ? 'green-2' : 'orange-2'" text-color="black" class="text-weight-bold shadow-1" style="margin: 0;" dense size="14px">
                  {{ record.ordemPar }}
                </q-chip>
              </div>
              <div class="q-mt-sm">
                 <q-btn outline color="primary" size="sm" class="full-width soft-btn" icon="list" label="Marcações do dia" @click="viewDayPunches(record)" />
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">{{ identificadorLabel }}</div>
              <div class="detail-value text-mono">{{ formatPIS(record.cpf || record.pis) || '—' }}</div>
            </div>
            <div class="detail-item" v-if="record.dataHora">
              <div class="detail-label">Data</div>
              <div class="detail-value">{{ formatDate(record.dataHora ? record.dataHora.substring(0,10) : null) }}</div>
            </div>
            <div class="detail-item" v-if="record.dataHora">
              <div class="detail-label">Hora</div>
              <div class="detail-value text-mono text-weight-bold">{{ record.dataHora ? record.dataHora.substring(11,16) : '—' }}</div>
            </div>
            <div class="detail-item" v-if="record.fusoHorario">
              <div class="detail-label">Fuso Horário</div>
              <span class="fuso-chip">GMT{{ record.fusoHorario }}</span>
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
            <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
              <div class="detail-label text-warning-dark">Avisos</div>
              <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold row items-center justify-between no-wrap q-mb-xs">
                <span class="q-pr-sm">• {{ w.msg || w }}</span>
                <q-btn v-if="w.conflitoNsr" size="sm" color="warning" text-color="black" outline label="Ver conflitante" dense flat @click="viewConflict(w.conflitoNsr)" />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">{{ record.raw }}</div>
        </q-card-section>
      </template>

      <!-- Tipo 4: Ajuste de Relógio -->
      <template v-else-if="record.tipo === '4'">
        <q-card-section class="q-pt-md">
          <div class="detail-grid">
            <div class="detail-item" v-if="record.dataHora">
              <div class="detail-label">Data/Hora Antes do Ajuste</div>
              <div class="detail-value">{{ formatDateTime(record.dataHora) }}</div>
            </div>
            <div class="detail-item" v-if="record.dataHoraAjuste">
              <div class="detail-label">Data/Hora Ajustada</div>
              <div class="detail-value text-weight-bold">{{ formatDateTime(record.dataHoraAjuste) }}</div>
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
            <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
              <div class="detail-label text-warning-dark">Avisos</div>
              <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold row items-center justify-between no-wrap q-mb-xs">
                <span class="q-pr-sm">• {{ w.msg || w }}</span>
                <q-btn v-if="w.conflitoNsr" size="sm" color="warning" text-color="black" outline label="Ver conflitante" dense flat @click="viewConflict(w.conflitoNsr)" />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="detail-label q-mb-xs">Linha raw</div>
          <div class="raw-line text-mono text-caption bg-grey-2 q-pa-sm rounded-borders">{{ record.raw }}</div>
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

            <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
              <div class="detail-label text-warning-dark">Avisos</div>
              <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold row items-center justify-between no-wrap q-mb-xs">
                <span class="q-pr-sm">• {{ w.msg || w }}</span>
                <q-btn v-if="w.conflitoNsr" size="sm" color="warning" text-color="black" outline label="Ver conflitante" dense flat @click="viewConflict(w.conflitoNsr)" />
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

      <!-- Outros tipos: exibe campos genéricos disponíveis (tipos 6, 7, etc.) -->
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
              <div class="detail-value text-mono">{{ formatPIS(record.cpf || record.pis) }}</div>
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
            
            <div class="detail-item" v-if="record.avisos && record.avisos.length > 0">
              <div class="detail-label text-warning-dark">Avisos</div>
              <div v-for="(w, i) in record.avisos" :key="i" class="detail-value text-warning-dark text-weight-bold row items-center justify-between no-wrap q-mb-xs">
                <span class="q-pr-sm">• {{ w.msg || w }}</span>
                <q-btn v-if="w.conflitoNsr" size="sm" color="warning" text-color="black" outline label="Ver conflitante" dense flat @click="viewConflict(w.conflitoNsr)" />
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
    record: { type: Object, default: () => ({}) },
    isChild: { type: Boolean, default: false },
    hasChildOpen: { type: Boolean, default: false }
  },

  emits: ['hide', 'viewConflict', 'viewDayPunches'],

  setup(props, { emit }) {
    const store = useAfdStore()
    const identificadorLabel = computed(() => store.portaria === '1510' ? 'PIS' : 'CPF')

    const viewConflict = (nsr) => {
       emit('viewConflict', nsr)
    }

    const viewDayPunches = (rec) => {
       if (!rec.dataHora) return
       const empId = rec.cpf || rec.pis
       if (!empId) return
       
       const dateStr = rec.dataHora.substring(0, 10)
       const punches = store.records.filter(r => 
          r.tipo === '3' && 
          (r.cpf === empId || r.pis === empId) && 
          r.dataHora && r.dataHora.startsWith(dateStr)
       ).sort((a,b) => new Date(a.dataHora) - new Date(b.dataHora))
       
       emit('viewDayPunches', { rec, punches })
    }

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

    /**
     * Formata CPF (11 dígitos) ou CPF com leading zero de 12 chars (padrão 671).
     * Para o PIS (11 dígitos, campo de 12 com zero na frente), usa formatPIS.
     */
    const formatCPF = (cpf) => {
      if (!cpf) return null
      const digits = cpf.replace(/\D/g, '')
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,6)}.${digits.substring(6,9)}-${digits.substring(9,11)}`
      }
      if (digits.length === 12) {
        const trimmed = digits.replace(/^0/, '')
        if (trimmed.length === 11) {
          return `${trimmed.substring(0,3)}.${trimmed.substring(3,6)}.${trimmed.substring(6,9)}-${trimmed.substring(9,11)}`
        }
      }
      return cpf
    }

    /**
     * Formata PIS para exibição (11 dígitos, campo pode vir com 12 chars com zero à esquerda).
     * No 1510 o PIS está em campo de 12 chars, sempre com zero na frente quando 11 dígitos.
     * Para portaria 671 o CPF tem o mesmo comportamento, então reutiliza formatCPF.
     */
    const formatPIS = (pis) => {
      if (!pis) return null
      const digits = pis.replace(/\D/g, '')
      // PIS 11 dígitos: XXX.XXXXX.XX-X
      if (digits.length === 11) {
        return `${digits.substring(0,3)}.${digits.substring(3,8)}.${digits.substring(8,10)}-${digits.substring(10,11)}`
      }
      // Campo de 12 chars com zero na frente (1510)
      if (digits.length === 12) {
        const trimmed = digits.replace(/^0/, '')
        if (trimmed.length === 11) {
          return `${trimmed.substring(0,3)}.${trimmed.substring(3,8)}.${trimmed.substring(8,10)}-${trimmed.substring(10,11)}`
        }
      }
      return pis
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

    return { identificadorLabel, operacaoLabel, operacaoColor, formatCPF, formatPIS, formatDateTime, formatCNPJ14, formatDate, viewConflict, viewDayPunches }
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
