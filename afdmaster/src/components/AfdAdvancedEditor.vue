<template>
  <div class="q-pa-md">
    
    <div class="row q-col-gutter-lg">
      
      <!-- Bloco: Localizar e Substituir PIS/CPF -->
      <div class="col-12 col-md-6">
        <q-card class="soft-card">
          <q-card-section>
            <div class="text-h6 text-primary row items-center">
               <q-icon name="find_replace" class="q-mr-sm" /> 
               Substituição em Lote (PIS / CPF)
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">
               Troca rapidamente a identificação de um funcionário em todas as suas batidas. Útil quando um colaborador registrou o ponto com o crachá/identificação incorreta.
            </div>
            
            <q-form @submit.prevent="applyReplace" class="q-gutter-md q-mt-md">
              <q-input 
                outlined dense 
                v-model="replaceForm.from" 
                label="PIS/CPF Incorreto (Localizar)" 
                class="soft-input" 
                :rules="[val => !!val || 'Campo obrigatório']"
                mask="###############"
                unmasked-value
              />
              <q-input 
                outlined dense 
                v-model="replaceForm.to" 
                label="PIS/CPF Correto (Substituir por)" 
                class="soft-input"
                :rules="[val => !!val || 'Campo obrigatório']"
                mask="###############"
                unmasked-value
              />
              <div class="text-right">
                <q-btn 
                   type="submit" 
                   color="primary" 
                   icon="swap_horiz" 
                   label="Aplicar Substituição" 
                   unelevated 
                   class="soft-btn soft-btn-primary" 
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Bloco: Recalcular NSR -->
      <div class="col-12 col-md-6">
        <q-card class="soft-card">
          <q-card-section>
            <div class="text-h6 text-warning-dark row items-center">
               <q-icon name="format_list_numbered" class="q-mr-sm" /> 
               Gerenciamento de NSR
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">
               Invalide ou recalcule o Número Sequencial de Registro (NSR). O recálculo afeta a linha selecionada em diante na exportação, caso a "Reindexação" esteja ativa. Remove o NSR fisicamente da linha atual.
            </div>

            <q-form @submit.prevent="applyNsrAction" class="q-gutter-md q-mt-md">
               <q-input 
                outlined dense 
                v-model.number="nsrForm.target" 
                type="number"
                label="NSR Alvo" 
                class="soft-input" 
                :rules="[val => !!val || 'Campo obrigatório']"
              />
              
              <div class="row q-gutter-sm justify-end">
                 <q-btn 
                   color="negative" 
                   icon="delete_sweep" 
                   label="Omitir NSR (Apagar)" 
                   unelevated 
                   class="soft-btn"
                   @click="nsrActionType = 'remove'; applyNsrAction()"
                />
              </div>
            </q-form>

          </q-card-section>
        </q-card>
      </div>

    </div>

  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useQuasar } from 'quasar'
import { useValidators } from 'src/composables/useValidators'

export default defineComponent({
  name: 'AfdAdvancedEditor',
  setup() {
    const store = useAfdStore()
    const $q = useQuasar()
    const { validateBulk } = useValidators()

    const replaceForm = ref({ from: '', to: '' })
    const nsrForm = ref({ target: null })
    const nsrActionType = ref('')

    const applyReplace = () => {
        let count = 0
        const fromVal = replaceForm.value.from.trim()
        const toVal = replaceForm.value.to.trim()
        
        $q.loading.show({ message: 'Substituindo PIS/CPF em lote...' })

        setTimeout(() => {
            // Varre a array inteira
            store.records.forEach(rec => {
               if (rec.pisCpf && rec.pisCpf.endsWith(fromVal)) {
                  rec.pisCpf = toVal // O setter reativo ou estático? 
                  // Em arrays gigantes evitamos reatividade pura num foreach, 
                  // mas aqui afeta poucas linhas ou as views precisam atualizar
                  if (rec.originalText) {
                     // Substituição bruta na string para refletir no Editor ou Export
                     rec.originalText = rec.originalText.replace(fromVal, toVal)
                  }
                  rec.alterado = true
                  count++
               }
            })

            if (count > 0) {
               // Reavalia validacoes globais como NSR Duplicado se PIS mudou, 
               // ou CPF invalido etc.
               validateBulk(store.records, store.portaria, store.settings.checkNsrSequential)
               store.computeValidationSummary()
               
               $q.notify({ type: 'positive', message: `${count} batida(s) tiveram o PIS/CPF alterado(s).` })
               replaceForm.value.from = ''
               replaceForm.value.to = ''
            } else {
               $q.notify({ type: 'warning', message: 'Nenhum registro encontrado com este PIS/CPF.' })
            }
            $q.loading.hide()
        }, 50)
    }

    const applyNsrAction = () => {
       if (nsrActionType.value === 'remove') {
          const target = nsrForm.value.target
          const record = store.records.find(r => parseInt(r.nsr) === target)
          
          if (!record) {
             return $q.notify({ type: 'negative', message: 'NSR não encontrado na base.' })
          }

          record.nsr = ''
          if (record.originalText) {
             // Remove os 9 digitos iniciais da linha
             record.originalText = '000000000' + record.originalText.substring(9)
          }
          record.alterado = true

          $q.loading.show({ message: 'Re-validando...' })
          setTimeout(() => {
             validateBulk(store.records, store.portaria, store.settings.checkNsrSequential)
             store.computeValidationSummary()
             $q.notify({ type: 'positive', message: `NSR ${target} anulado do registro.` })
             $q.loading.hide()
          }, 50)
       }
    }

    return {
       replaceForm,
       applyReplace,
       nsrForm,
       nsrActionType,
       applyNsrAction
    }
  }
})
</script>

<style scoped>
/* Scoped styles para a ferramenta avançada */
</style>
