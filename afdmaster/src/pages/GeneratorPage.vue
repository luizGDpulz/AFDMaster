<template>
  <q-page class="fade-in q-pt-sm q-pb-md column full-width" style="min-width: 0;">
    
    <div class="row items-center q-mb-sm q-px-md" style="min-width: 0;">
      <div class="text-h5 text-weight-bold row items-center">
        <q-icon name="precision_manufacturing" class="q-mr-sm text-primary" /> Gerador de AFD
      </div>
    </div>

    <!-- Container para não grudar na borda, mantendo tudo dentro -->
    <div class="col flex column no-wrap q-px-md" style="min-height: 0; max-width: 100%;">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        class="soft-card col custom-scrolling-stepper"
        style="min-height: 0; max-width: 100%; overflow: hidden;"
        contracted
      >
      <!-- PASSO 1: Estrutura Base -->
      <q-step
        :name="1"
        title="Formato e Estrutura"
        icon="settings"
        :done="step > 1"
        class="stepper-step-body text-grey-8"
      >
        <div class="text-subtitle1 q-mb-md text-weight-medium">Selecione o Formato do Arquivo Fonte de Dados</div>
        
        <div class="row q-col-gutter-sm q-mb-sm">
           <div class="col-12">
              <div class="text-subtitle2 q-mb-xs text-grey-8">Tipo de Arquivo Origem</div>
              <q-select 
                 outlined dense 
                 v-model="genConfig.portaria" 
                 :options="portariaOptions" 
                 label="Selecione a Portaria (1510 ou 671)" 
                 class="soft-input"
                 emit-value map-options
              />
           </div>
        </div>

        <div class="row q-col-gutter-sm q-mb-xs">
           <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs text-grey-8">Período de Extração (Início)</div>
              <q-input outlined dense v-model="genConfig.dateStart" type="date" class="soft-input" />
           </div>
           <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs text-grey-8">Período de Extração (Fim)</div>
              <q-input outlined dense v-model="genConfig.dateEnd" type="date" class="soft-input" />
           </div>
        </div>

        <div class="text-subtitle2 q-mb-xs q-mt-md text-grey-8">Incluir Registros Especiais?</div>
        <q-list bordered separator class="rounded-borders q-mb-sm" dense>
           <q-item tag="label" v-ripple>
              <q-item-section avatar>
                 <q-checkbox v-model="genConfig.includeHeader" color="primary" />
              </q-item-section>
              <q-item-section>
                 <q-item-label>Cabeçalho (Header)</q-item-label>
                 <q-item-label caption class="text-grey-6">Gera o registro inicial contendo informações obrigatórias da empresa e do REP.</q-item-label>
              </q-item-section>
           </q-item>
           <q-item tag="label" v-ripple>
              <q-item-section avatar>
                 <q-checkbox v-model="genConfig.includeTrailer" color="primary" />
              </q-item-section>
              <q-item-section>
                 <q-item-label>Trailer (Rodapé)</q-item-label>
                 <q-item-label caption class="text-grey-6">Gera o registro final de consolidação na última linha do arquivo.</q-item-label>
              </q-item-section>
           </q-item>
           <q-item tag="label" v-ripple>
              <q-item-section avatar>
                 <q-checkbox v-model="genConfig.includeCrc" color="primary" />
              </q-item-section>
              <q-item-section>
                 <q-item-label>Adicionar CRC-16 (Kermit)</q-item-label>
                 <q-item-label caption class="text-grey-6">Anexa o código de verificação de 4 dígitos (ex: 4A8F) ao final de cada registro.</q-item-label>
              </q-item-section>
           </q-item>
        </q-list>

        <!-- Preview Text -->
        <q-card flat bordered class="q-pa-md bg-dark text-white rounded-borders q-mt-md" style="border-color: var(--qm-border);">
           <div class="text-subtitle2 q-mb-sm text-weight-bold row items-center">
              <q-icon name="visibility" class="q-mr-sm" /> Preview Transparente do Arquivo
           </div>
           <p class="text-caption text-grey-5 q-mb-md">
              Exemplo do arquivo a ser gerado com base nas suas seleções.
           </p>
           <pre class="bg-black q-pa-sm rounded-borders" style="font-size: 11px; max-width: 100%; overflow-x: auto; margin: 0; white-space: pre-wrap; word-break: break-all;">{{ previewText }}</pre>
        </q-card>


      </q-step>

      <!-- PASSO 2: Dados do Cabeçalho -->
      <q-step
        :name="2"
        v-if="genConfig.includeHeader"
        title="Dados do Cabeçalho"
        icon="business"
        :done="step > 2"
        class="stepper-step-body"
      >
        <div class="text-subtitle1 q-mb-md text-weight-medium">Informações Fiscais e do Relógio</div>
        <p class="text-caption text-grey-7">O Serial do REP é altamente recomendado para arquivos gerados para importação. Os demais campos fiscais foram preenchidos com placeholders válidos.</p>
        
        <div class="row q-col-gutter-md">
           <!-- Campos Principais -->
           <div class="col-12 col-md-6">
              <q-input outlined dense v-model="genConfig.header.cnpjCpf" label="CNPJ/CPF do Empregador" placeholder="12345678000199" class="soft-input" />
           </div>
           <div class="col-12 col-md-6">
              <q-input outlined dense v-model="genConfig.header.razaoSocial" label="Razão Social" placeholder="EMPRESA TESTE DE SOFTWARE LTDA" class="soft-input" />
           </div>
           <div class="col-12 col-md-12">
              <q-input outlined dense v-model="genConfig.header.serialRep" label="Serial do REP" placeholder="00000010000123456" class="soft-input" hint="Obrigatório! Identificação de fábrica." />
           </div>

           <!-- Campos Complementares -->
           <div class="col-12 q-mt-md">
              <div class="text-subtitle2 text-grey-6 q-mb-sm">Campos Complementares (Geralmente para Portaria 671)</div>
              <div class="row q-col-gutter-md">
                 <div class="col-12 col-md-4">
                    <q-input outlined dense v-model="genConfig.header.cei" label="CEI / CAEPF / CNO" placeholder="123456789012" class="soft-input" />
                 </div>
                 <div class="col-12 col-md-8">
                    <q-input outlined dense v-model="genConfig.header.endereco" label="Endereço do Local de Trabalho" placeholder="RUA TESTE, 123 - CENTRO" class="soft-input" />
                 </div>
              </div>
           </div>
        </div>
      </q-step>

      <!-- PASSO 3: Funcionários e Batidas -->
      <q-step
        :name="3"
        title="Colaboradores e Jornadas"
        icon="people"
        :done="step > 3"
        class="stepper-step-body"
      >
        <div class="row justify-between items-center q-mb-md">
           <div class="text-subtitle1 text-weight-medium">Configuração de Batidas</div>
           <q-btn icon="person_add" label="Adicionar Funcionário" color="primary" unelevated class="soft-btn" @click="addEmployee" />
        </div>

        <q-list separator>
           <q-item v-for="(emp, i) in genConfig.employees" :key="i" class="q-pa-md bg-surface rounded-borders q-mb-sm" style="border: 1px solid var(--qm-border-light);">
              <q-item-section>
                 <div class="row q-col-gutter-md items-end">
                    <div class="col-12 col-md-5">
                       <q-input outlined dense v-model="emp.name" label="NOME DO FUNCIONÁRIO" class="soft-input" />
                    </div>
                    <div class="col-12 col-md-3">
                       <q-input outlined dense v-model="emp.pis" :label="genConfig.portaria === '1510' ? 'PIS (11 ou 12 dígitos)' : 'CPF (11 dígitos)'" class="soft-input" />
                    </div>
                    <div class="col-12 col-md-1">
                       <q-btn icon="delete" color="negative" flat round @click="removeEmployee(i)" />
                    </div>
                 </div>

                 <!-- Array de Pares de Marcação do Dia Para Esse Funcionario -->
                 <div class="q-mt-md q-pa-sm rounded-borders bg-surface" style="border: 1px dashed var(--qm-border-light);">
                    <div class="text-caption text-grey-8 q-mb-sm row justify-between items-center">
                       <span>Horários da Jornada (Gerações diárias para cada dia do Período):</span>
                       <q-btn size="sm" icon="add_time" unelevated color="primary" class="soft-btn soft-btn-primary" label="Nova marcação" @click="addPunchToEmp(emp)" />
                    </div>
                    
                    <div class="row q-gutter-sm">
                       <div v-for="(punch, pIdx) in emp.punches" :key="pIdx" class="row items-center no-wrap">
                          <q-input outlined dense type="time" v-model="emp.punches[pIdx]" style="width: 110px;" class="soft-input" />
                          <q-btn icon="close" size="sm" flat round color="grey" @click="emp.punches.splice(pIdx, 1)" />
                       </div>
                    </div>
                 </div>
              </q-item-section>
           </q-item>
        </q-list>

      </q-step>

      <!-- PASSO 4: Randomização -->
      <q-step
        :name="4"
        title="Realismo e Variação"
        icon="auto_fix_high"
        class="stepper-step-body"
      >
        <div class="text-subtitle1 q-mb-md text-weight-medium">Variância Matemática de Marcação</div>
        <p class="text-caption text-grey-8">
           Ninguém bate o ponto exatamente às 08:00 em ponto todos os dias. Uma marcação perfeitamente pontual no arquivo inteiro disparará bloqueios em softwares de folha de pagamento sofisticados (indicando fraude gerada pelo fabricante). Adicione uma variação aleatória de minutos para construir um arquivo realista.
        </p>

        <q-card flat bordered class="soft-card q-pa-lg text-center" style="max-width: 500px; margin: 0 auto;">
           <div class="text-h4 text-primary text-weight-bold q-mb-sm">{{ genConfig.varianceMinutes }} Minutos</div>
           <div class="text-subtitle2 q-mb-lg text-grey-8">Para mais (+) ou para menos (-) em cada batida</div>
           
           <q-slider
              v-model="genConfig.varianceMinutes"
              :min="0"
              :max="30"
              :step="1"
              label
              label-always
              color="primary"
           />
           <div class="text-caption q-mt-md text-grey-8">Exemplo com Base 08:00 e Variância 5: Randomiza entre 07:55 e 08:05.</div>
        </q-card>
      </q-step>

      <template v-slot:navigation>
        <div class="stepper-navigation-footer">
           <q-separator class="q-mb-sm" />
           <q-stepper-navigation class="row justify-end q-gutter-sm q-px-lg q-py-xs">
          <q-btn 
             v-if="step > 1" 
             outline
             rounded
             color="primary" 
             icon="chevron_left"
             @click="$refs.stepper.previous()" 
             label="Voltar" 
             class="soft-btn q-px-md"
          />
          <q-btn 
             v-if="step < 4" 
             @click="$refs.stepper.next()" 
             color="primary" 
             label="Próximo" 
             unelevated 
             class="soft-btn soft-btn-primary" 
          />
          <q-btn 
             v-if="step === 4" 
             @click="generateAfd" 
             color="positive" 
             icon="precision_manufacturing" 
             label="Gerar e Baixar AFD" 
             unelevated 
             class="soft-btn text-weight-bold" 
          />
           </q-stepper-navigation>
        </div>
      </template>

      </q-stepper>
    </div>

    <!-- Modal de Geração e Download -->
    <q-dialog v-model="genModal.show" persistent>
      <q-card class="soft-card text-center q-pa-lg" style="min-width: 350px; border-radius: 20px;">
        <q-card-section v-if="genModal.generating">
           <q-spinner-dots color="primary" size="64px" class="q-mb-md" />
           <div class="text-h6 text-grey-8">Sintetizando AFD...</div>
           <div class="text-caption text-grey-6">Calculando variâncias e codificando as marcações diárias.</div>
        </q-card-section>
        
        <q-card-section v-else>
           <q-icon name="check_circle" color="positive" size="80px" class="q-mb-md fade-in" />
           <div class="text-h5 text-weight-bold q-mb-sm">Sucesso!</div>
           <div class="text-subtitle1 text-grey-8 q-mb-lg">
             {{ genModal.recordCount }} registros foram compialdos na portaria {{ genConfig.portaria }}.
           </div>
           
           <q-btn 
              color="primary" 
              icon="save_alt" 
              label="Baixar Arquivo" 
              size="lg" 
              unelevated 
              class="soft-btn text-weight-bold full-width" 
              @click="downloadGeneratedAfd" 
           />
           <q-btn 
              flat 
              color="grey" 
              label="Fechar" 
              class="q-mt-sm full-width" 
              v-close-popup 
           />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'GeneratorPage',
  setup() {
    const $q = useQuasar()
    const step = ref(1)

    const portariaOptions = [
       { label: 'Portaria 671 / C (Convencional)', value: '671C' },
       { label: 'Portaria 671 / P (Painel/Software)', value: '671P' },
       { label: 'Portaria 671 / A (Alternativo)', value: '671A' },
       { label: 'Portaria 1510 (Antiga)', value: '1510' }
    ]

    const padDateToToday = () => {
       return new Date().toISOString().split('T')[0]
    }

    const genConfig = ref({
       portaria: '671C',
       dateStart: padDateToToday(),
       dateEnd: padDateToToday(),
       includeHeader: true,
       includeTrailer: true,
       includeCrc: true,
       varianceMinutes: 5,
       header: {
          cnpjCpf: '12345678000199',
          razaoSocial: 'TESTE DE SOFTWARE LTDA',
          serialRep: '00000010000123456',
          cei: '123456789012',
          endereco: 'RUA TESTE, 123 - CENTRO'
       },
       employees: [
          { name: 'TESTEMILSON DE OLIVEIRA', pis: '11122233344', punches: ['08:00', '12:00', '13:00', '18:00'] }
       ]
    })

    const genModal = ref({
       show: false,
       generating: false,
       generatedPayload: '',
       recordCount: 0
    })

    const addEmployee = () => {
       genConfig.value.employees.push({
          name: 'NOVO FUNCIONÁRIO',
          pis: '99988877766',
          punches: ['08:00', '12:00', '13:00', '18:00']
       })
    }

    const removeEmployee = (idx) => {
       genConfig.value.employees.splice(idx, 1)
    }

    const addPunchToEmp = (emp) => {
       emp.punches.push('18:00')
    }

    // Utilitários de String base
    const pad = (str, len, char = '0', right = false) => {
       let s = String(str || '')
       while (s.length < len) s = right ? s + char : char + s
       return right ? s.substring(0, len) : s.slice(-len)
    }
    
    const formatDt = (d) => {
       const day = pad(d.getDate(), 2)
       const m = pad(d.getMonth() + 1, 2)
       return `${day}${m}${d.getFullYear()}`
    }
    
    const crc16Kermit = (data) => {
       let crc = 0x0000
       for (let i = 0; i < data.length; i++) {
           crc ^= data.charCodeAt(i)
           for (let j = 0; j < 8; j++) {
               crc = (crc & 1) ? (crc >>> 1) ^ 0x8408 : crc >>> 1
           }
       }
       return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
    }
    
    const appendCrcStr = (str, forceCrc) => {
       if (!forceCrc) return str
       return str + crc16Kermit(str)
    }

    const previewText = computed(() => {
       const cfg = genConfig.value
       const is1510 = cfg.portaria === '1510'
       const is671P = cfg.portaria === '671P'
       let lines = []
       let nsr = 1
       
       const dNow = new Date()
       const dtStr1510 = formatDt(dNow)
       const tmStr1510 = `${pad(dNow.getHours(), 2)}${pad(dNow.getMinutes(), 2)}`
       const dtStr671 = `${dNow.getFullYear()}-${pad(dNow.getMonth() + 1, 2)}-${pad(dNow.getDate(), 2)}`
       const dhStr671 = `${dtStr671}T${tmStr1510.slice(0, 2)}:${tmStr1510.slice(2, 4)}:00-0300`
       
       const idEmpregador = is1510 ? pad(cfg.header.cnpjCpf, 14) + pad('', 12, '0') : pad(cfg.header.cnpjCpf, 14)
       const razao = pad(cfg.header.razaoSocial, 150, ' ', true)
       const serial = pad(cfg.header.serialRep, 17)
       
       if (cfg.includeHeader) {
          let hLine = ''
          if (is1510) {
              hLine = `${pad(nsr++, 9)}1${idEmpregador}${razao}${serial}${dtStr1510}${dtStr1510}${dtStr1510}${tmStr1510}`
          } else {
              hLine = `00000000011${idEmpregador}${pad('', 14, '0')}${razao}${serial}${dtStr671}${dtStr671}${dhStr671}0031${idEmpregador}${pad('MOCK', 30, ' ', true)}`
          }
          lines.push(appendCrcStr(hLine, cfg.includeCrc))
       }
       
       const pis1510 = pad('11122233344', 12)
       const cpf671 = pad('11122233344', 12)
       const punchTimes = ['08:00', '12:00', '13:00']
       
       for (let tm of punchTimes) {
          let pLine = ''
          if (is1510) {
              const tm1510 = tm.replace(':', '')
              pLine = `${pad(nsr++, 9)}3${dtStr1510}${tm1510}${pis1510}`
          } else if (is671P) {
              const dh = `${dtStr671}T${tm}:00-0300`
              const hash = pad('A', 64, 'A')
              pLine = `${pad(nsr++, 9)}7${dh}${cpf671}${dh}050${hash}`
          } else {
              const dh = `${dtStr671}T${tm}:00-0300`
              pLine = `${pad(nsr++, 9)}3${dh}${cpf671}`
          }
          lines.push(appendCrcStr(pLine, cfg.includeCrc))
       }
       
       if (cfg.includeTrailer) {
          let trLine = ''
          if (is1510) {
              trLine = `${pad(nsr++, 9)}9${pad('', 9, '0')}${pad(3, 9)}${pad('', 9, '0')}${pad('', 9, '0')}`
          } else {
              let t3 = is671P ? pad('',9,'0') : pad('3',9)
              let t7 = is671P ? pad('3',9) : pad('',9,'0') 
              trLine = `999999999${pad('',9,'0')}${t3}${pad('',9,'0')}${pad('',9,'0')}${pad('',9,'0')}${t7}9`
          }
          lines.push(appendCrcStr(trLine, cfg.includeCrc))
       }
       
       return lines.join('\r\n')
    })

    const generateAfd = () => {
       // Abre o Modal imediatamente para mostrar responsividade
       genModal.value.show = true
       genModal.value.generating = true
       genModal.value.generatedPayload = ''
       genModal.value.recordCount = 0

       setTimeout(() => {
          try {
             const lines = []
             let nsr = 1
             const cfg = genConfig.value

             const pad = (str, len, char = '0', right = false) => {
                let s = String(str || '')
                while (s.length < len) s = right ? s + char : char + s
                return right ? s.substring(0, len) : s.slice(-len)
             }



              // Datas Ref
             const startDate = new Date(cfg.dateStart + 'T00:00:00')
             const endDate = new Date(cfg.dateEnd + 'T00:00:00')
             const now = new Date()
             
             const is1510 = cfg.portaria === '1510'
             const is671P = cfg.portaria === '671P'

             // 1. HEADER (Tipo 1)
             if (cfg.includeHeader) {
                 const nsrStr = pad(nsr++, 9)
                 
                 const dtStr1510 = formatDt(startDate)
                 const dtEnd1510 = formatDt(endDate)
                 const genDt1510 = formatDt(now)
                 const genTm1510 = `${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}`
                 
                 const genDt671 = `${now.getFullYear()}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}`
                 const genDh671 = `${genDt671}T${genTm1510.slice(0, 2)}:${genTm1510.slice(2, 4)}:00-0300`

                 const idEmpregador = is1510 ? pad(cfg.header.cnpjCpf, 14) + pad('', 12, '0') : pad(cfg.header.cnpjCpf, 14, '0')
                 const razao = pad(cfg.header.razaoSocial, 150, ' ', true)
                 const serial = pad(cfg.header.serialRep, 17, '0')
                 
                 let headerLine = ''
                 if (is1510) {
                     headerLine = `${nsrStr}1${idEmpregador}${razao}${serial}${dtStr1510}${dtEnd1510}${genDt1510}${genTm1510}`
                 } else {
                     headerLine = `00000000011${idEmpregador}${pad(cfg.header.cei, 14, '0')}${razao}${serial}${genDt671}${genDt671}${genDh671}0031${idEmpregador}${pad(cfg.header.endereco || 'LOCAL DE TRABALHO MOCK', 30, ' ', true)}`
                 }

                 lines.push(appendCrcStr(headerLine, cfg.includeCrc))
             }

             // 2. CORPO (Tipo 3/7 - Marcações)
             // Itera por dia
             let numMarcacoes = 0
             for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                 // Finais de Semana (simulação básica, skip domingo)
                 if (d.getDay() === 0) continue 
                 
                 // Para cada funcionario
                 for (const emp of cfg.employees) {
                    for (const basePunch of emp.punches) {
                       const [bH, bM] = basePunch.split(':').map(Number)
                       
                       // Variancia Realista
                       const variance = cfg.varianceMinutes
                       let randomOffset = 0
                       if (variance > 0) {
                          randomOffset = Math.floor(Math.random() * (variance * 2 + 1)) - variance
                       }
                       
                       const dateWithTime = new Date(d)
                       dateWithTime.setHours(bH, bM + randomOffset, 0)
                       
                       const punchDateStr = formatDt(dateWithTime)
                       const punchTimeStr = `${pad(dateWithTime.getHours(), 2)}${pad(dateWithTime.getMinutes(), 2)}`
                       const dtStr671 = `${dateWithTime.getFullYear()}-${pad(dateWithTime.getMonth() + 1, 2)}-${pad(dateWithTime.getDate(), 2)}`
                       
                       const nsrStr = pad(nsr++, 9)
                       
                       const pis1510 = pad(emp.pis, 12)
                       const cpf671 = pad(emp.pis, 12, '0', false)

                       let punchLine = ''
                       if (is1510) {
                           punchLine = `${nsrStr}3${punchDateStr}${punchTimeStr}${pis1510}`
                       } else if (is671P) {
                           const dh = `${dtStr671}T${punchTimeStr.slice(0,2)}:${punchTimeStr.slice(2,4)}:00-0300`
                           const hash = pad('A', 64, 'A')
                           punchLine = `${nsrStr}7${dh}${cpf671}${dh}050${hash}`
                       } else {
                           const dh = `${dtStr671}T${punchTimeStr.slice(0,2)}:${punchTimeStr.slice(2,4)}:00-0300`
                           punchLine = `${nsrStr}3${dh}${cpf671}`
                       }

                       lines.push(appendCrcStr(punchLine, cfg.includeCrc))
                       numMarcacoes++
                    }
                 }
             }

             // 3. TRAILER (Tipo 9)
             if (cfg.includeTrailer) {
                 const nsrStr = pad(nsr++, 9)
                 let trailerLine = ''
                 if (is1510) {
                     trailerLine = `${nsrStr}9${pad('', 9, '0')}${pad(numMarcacoes, 9)}${pad('', 9, '0')}${pad('', 9, '0')}`
                 } else {
                     let t3 = is671P ? pad('', 9, '0') : pad('3', 9)
                     let t7 = is671P ? pad('3', 9) : pad('', 9, '0')
                     trailerLine = `999999999${pad('', 9, '0')}${t3}${pad('', 9, '0')}${pad('', 9, '0')}${pad('', 9, '0')}${t7}9`
                 }
                 lines.push(appendCrcStr(trailerLine, cfg.includeCrc))
             }

             const finalPayload = lines.join('\r\n') + '\r\n'

             // Prepara Modals
             genModal.value.generatedPayload = finalPayload
             genModal.value.recordCount = numMarcacoes
             genModal.value.generating = false
             
          } catch(e) {
             console.error(e)
             $q.notify({ type: 'negative', message: 'Erro crítico na engine de Geração.' })
             genModal.value.show = false
          }
       }, 1500) // Timeout maior para o usuário ter tempo de ver a simulação carregando
    }

    const downloadGeneratedAfd = () => {
       const cfg = genConfig.value
       const blob = new Blob([genModal.value.generatedPayload], { type: 'text/plain;charset=utf-8' })
       const url = URL.createObjectURL(blob)
       const link = document.createElement('a')
       link.href = url
       link.download = `Sintetico_${cfg.portaria}_${Date.now()}.txt`
       document.body.appendChild(link)
       link.click()
       document.body.removeChild(link)
       URL.revokeObjectURL(url)
       genModal.value.show = false
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
       step,
       portariaOptions,
       genConfig,
       previewText,
       genModal,
       addEmployee,
       removeEmployee,
       addPunchToEmp,
       generateAfd,
       downloadGeneratedAfd
    }
  }
})
</script>

<style scoped>
/* Transforma o stepper numa coluna flexível que não cresce infinito */
.custom-scrolling-stepper {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

/* O header do Stepper (as abas) deve poder dar scroll horizontal em telas pequenas para não empurrar a tela toda! */
.custom-scrolling-stepper :deep(.q-stepper__header) {
  flex-wrap: nowrap;
  overflow-x: auto;
  min-width: 0;
  width: 100%;
}

/* O corpo do Stepper (onde os panels vivem) deve expandir para preencher a tela */
.custom-scrolling-stepper :deep(.q-stepper__content) {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Bugfix de flexbox para permitir rolagem interna em filhos */
  min-width: 0;
  width: 100%;
}

/* O painel individual deve ter a rolagem quando o conteudo estourar */
.stepper-step-body {
  flex: 1 1 0%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 24px;
  min-width: 0;
  width: 100%;
}

/* O footer dos botões fica sempre por baixo, grudado, sem rolar junto com o conteudo */
.stepper-navigation-footer {
  flex-shrink: 0;
  padding: 0 8px 8px 8px; /* Thinner vertically */
  background: var(--qm-surface);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

/* Aumentar o tamanho dos itens do Header do Stepper */
.custom-scrolling-stepper :deep(.q-stepper__title) {
  font-size: 16px; /* Aumenta o titulo */
  font-weight: 600;
}

.custom-scrolling-stepper :deep(.q-stepper__caption) {
  font-size: 13px; /* Aumenta a legenda */
}

.custom-scrolling-stepper :deep(.q-stepper__dot) {
  font-size: 28px; /* Aumenta o icone/circulo */
  width: 40px;
  height: 40px;
  min-width: 40px;
}

.custom-scrolling-stepper :deep(.q-stepper__tab) {
  padding: 16px 24px; /* Mais espaço pra clique */
}

/* Customização da linha que conecta os steps */
/* Customização da linha que conecta os steps */
.custom-scrolling-stepper :deep(.q-stepper__tab:before),
.custom-scrolling-stepper :deep(.q-stepper__tab:after) {
   display: none !important;
}

.custom-scrolling-stepper :deep(.q-stepper__line:before),
.custom-scrolling-stepper :deep(.q-stepper__line:after) {
  height: 2px !important;
  background-color: var(--qm-border-hover) !important;
  min-height: 2px !important;
}

/* Modifica diretamente a barra/trilho (rail) que o vue adiciona via flex */
.custom-scrolling-stepper :deep(.q-stepper__tab--active ~ .q-stepper__tab > .q-stepper__dot:before),
.custom-scrolling-stepper :deep(.q-stepper__tab--done + .q-stepper__tab > .q-stepper__dot:before),
.custom-scrolling-stepper :deep(.q-stepper__tab--done ~ .q-stepper__tab > .q-stepper__dot:before) {
   background-color: var(--qm-border-hover) !important;
   height: 2px !important;
}

/* Força absoluta para qualquer linha renderizada horizontalmente dentro deste Stepper */
.custom-scrolling-stepper.q-stepper--horizontal :deep(.q-stepper__line:before),
.custom-scrolling-stepper.q-stepper--horizontal :deep(.q-stepper__line:after) {
  background: var(--qm-border-hover) !important;
}
</style>
