<template>
  <div class="q-pa-md">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="warning" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado importado.</div>
      <q-btn flat color="primary" to="/" label="Ir para Upload" class="q-mt-sm" />
    </div>

    <div v-else>
      <div class="row q-mb-md q-col-gutter-md">
         <div class="col-12 col-md-8">
            <q-card flat bordered class="bg-grey-1" v-if="headerRecord">
               <q-card-section>
                  <div class="text-overline text-grey-7 q-mb-xs">INFORMAÇÕES DO ARQUIVO (CABEÇALHO)</div>
                  <div class="text-h6 text-weight-bold">{{ headerRecord.empregadorNome || 'Razão Social Não Identificada' }}</div>
                  <div class="text-subtitle2 text-grey-8">CNPJ/CPF: {{ headerRecord.empregadorCnpjCpf || '-' }}</div>
                  <div class="text-caption text-grey-7 q-mt-sm">
                     <q-icon name="event" class="q-mr-xs"/> Gerado em: {{ formatDateTime(headerRecord.dataHora) }}
                  </div>
               </q-card-section>
            </q-card>
            <q-card flat bordered class="bg-grey-1" v-else>
               <q-card-section>
                  <div class="text-overline text-grey-7">INFORMAÇÕES DO ARQUIVO</div>
                  <div class="text-subtitle2">Cabeçalho (Tipo 1) não encontrado ou em formato desconhecido.</div>
               </q-card-section>
            </q-card>
         </div>
      </div>

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
            <q-input dense outlined v-model="filter" placeholder="Procurar (CPF/PIS, NSR)" class="q-mr-sm soft-input bg-white" style="flex-grow: 1;">
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
        virtual-scroll
        :rows-per-page-options="[0]"
        style="height: 65vh"
        class="soft-card"
        title="Registros do Arquivo"
      >
        <template v-slot:body-cell-nsr="props">
          <q-td :props="props">
            {{ props.row.nsr }}
            <q-popup-edit v-model.number="props.row.nsr" title="Editar NSR" buttons v-slot="scope" @save="val => saveField(props.row, 'nsr', val)">
              <q-input type="number" v-model="scope.value" dense autofocus counter />
            </q-popup-edit>
          </q-td>
        </template>
        
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props" class="text-center">
            <q-badge v-if="props.value === '1'" color="primary" class="q-pa-xs">1 - Cabeçalho</q-badge>
            <q-badge v-else-if="props.value === '2'" color="secondary" class="q-pa-xs">2 - Empregador</q-badge>
            <q-badge v-else-if="props.value === '3'" color="accent" text-color="black" class="q-pa-xs">3 - Marcação</q-badge>
            <div v-else class="text-weight-bold">{{ props.value }}</div>
          </q-td>
        </template>
        
        <template v-slot:body-cell-data="props">
          <q-td :props="props">
            {{ props.value }}
          </q-td>
        </template>
        
        <template v-slot:body-cell-hora="props">
          <q-td :props="props">
            {{ props.value }}
          </q-td>
        </template>
        
        <template v-slot:body-cell-crc="props">
          <q-td :props="props" class="text-mono">
            {{ props.value }}
          </q-td>
        </template>

        <template v-slot:body-cell-identificador="props">
          <q-td :props="props">
              {{ props.row.cpf || props.row.pis || '-' }}
              <!-- Edição de cpf/pis -->
              <q-popup-edit v-if="props.row.tipo === '3'" v-model="props.row.pis" title="Editar Identificador" buttons v-slot="scope" @save="val => saveFieldId(props.row, val)">
                 <q-input v-model="scope.value" dense autofocus counter mask="###########" />
              </q-popup-edit>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge v-if="props.row.erros && props.row.erros.length > 0" color="negative" text-color="white">
              {{ props.row.erros.length }} Erro(s)
              <q-tooltip>
                <div v-for="(err, i) in props.row.erros" :key="i">- {{ err }}</div>
              </q-tooltip>
            </q-badge>
            <q-badge v-else-if="props.row.alterado" color="warning" text-color="black">Editado</q-badge>
            <q-badge v-else color="positive">OK</q-badge>
          </q-td>
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

export default defineComponent({
  name: 'AfdTable',
  setup() {
    const store = useAfdStore()
    const { validateSingle, validateBulk } = useValidators()
    const $q = useQuasar()

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

    const formatDateTime = (isoStr) => {
      if (!isoStr) return '-'
      try {
         const dt = new Date(isoStr)
         if (isNaN(dt.getTime())) return isoStr
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

    const headerRecord = computed(() => {
       return store.records.find(r => r.tipo === '1')
    })

    const columns = [
      { name: 'nsr', label: 'NSR', field: 'nsr', sortable: true, align: 'left' },
      { name: 'tipo', label: 'Tipo', field: 'tipo', sortable: true, align: 'center' },
      { name: 'data', label: 'Data', field: row => row.dataHora ? formatDataStr(row.dataHora) : '-', sortable: true, align: 'left' },
      { name: 'hora', label: 'Hora', field: row => row.dataHora ? formatHoraStr(row.dataHora) : '-', sortable: true, align: 'left' },
      { name: 'fuso', label: 'Fuso Horário', field: row => row.fusoHorario || '-', sortable: true, align: 'center' },
      { name: 'identificador', label: 'CPF / PIS', field: row => row.cpf || row.pis, sortable: true, align: 'left' },
      { name: 'crc', label: 'CRC', field: row => row.crc || '-', sortable: true, align: 'center' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' }
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
        // Convert to YYYY-MM-DD local comparison effectively
        const d1 = new Date(dataInicio.value + "T00:00:00").getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() >= d1)
      }
      
      if (dataFim.value) {
        // Until the end of that day locally
        const d2 = new Date(dataFim.value + "T23:59:59").getTime()
        recs = recs.filter(r => r.dataHora && new Date(r.dataHora).getTime() <= d2)
      }

      return recs
    })

    const saveField = (row, field, val) => {
       const clone = { ...row, [field]: val }
       const errors = validateSingle(clone)
       
       if (errors.length > 0) {
          $q.notify({ type: 'warning', message: errors.join(', ') })
       }
       
       store.updateRecord(row.id, { [field]: val })
       // Para manter os status globais corretos, ideal seria rodar um validateBulk apenas na view,
       // ou revalidar todos silentamente assumindo custo logico pequeno p/ cliente
       validatorsrecheck()
    }
    
    const saveFieldId = (row, val) => {
       store.updateRecord(row.id, { cpf: val, pis: val })
       validatorsrecheck()
    }
    
    const validatorsrecheck = () => {
        // Revalida tudo para acertar alertas globais de duplicidade / sequencia
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
      formatDateTime,
      formatDataStr,
      formatHoraStr,
      saveField,
      saveFieldId
    }
  }
})
</script>
