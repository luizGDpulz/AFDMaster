<template>
  <div class="q-pa-md">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="rule" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado para validar.</div>
    </div>

    <div v-else>
      <div class="row q-col-gutter-md">
        <!-- Overview Stats -->
        <div class="col-12 col-md-4">
          <q-card class="soft-card bg-negative text-white">
            <q-card-section>
              <div class="text-overline uppercase">Total de Erros</div>
              <div class="text-h3">{{ store.totalErros }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="soft-card bg-warning text-black">
            <q-card-section>
              <div class="text-overline uppercase">Registros Alterados</div>
              <div class="text-h3">{{ store.totalAlterados }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="soft-card bg-primary text-white">
            <q-card-section>
              <div class="text-overline uppercase">Total Processado</div>
              <div class="text-h3">{{ store.records.length }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lista de erros consolidada -->
        <div class="col-12 q-mt-md" v-if="store.totalErros > 0">
           <q-card class="soft-card">
              <q-card-section class="q-pb-none">
                <div class="text-h6 text-negative">Resumo de Inconsistências</div>
              </q-card-section>
              <q-card-section>
                <q-list separator>
                  <q-item v-for="(count, errorMsg) in aggregatedErrors" :key="errorMsg">
                     <q-item-section>
                       <q-item-label>{{ errorMsg }}</q-item-label>
                     </q-item-section>
                     <q-item-section side>
                       <q-badge color="negative" class="text-weight-bold" :label="count + ' ocorrência(s)'" />
                     </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
           </q-card>
        </div>
        <div class="col-12 q-mt-md" v-else>
           <q-card class="soft-card bg-positive text-white">
              <q-card-section class="text-center">
                 <q-icon name="check_circle" size="48px" />
                 <div class="text-h6 q-mt-md">Arquivo sem inconsistências!</div>
                 <div class="text-subtitle2">Pronto para ser exportado orginalmente ou com novas alterações.</div>
              </q-card-section>
           </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'

export default defineComponent({
  name: 'ValidationReport',
  setup() {
    const store = useAfdStore()

    const aggregatedErrors = computed(() => {
       const counts = {}
       store.records.forEach(r => {
          if (r.erros && r.erros.length > 0) {
             r.erros.forEach(err => {
                if (!counts[err]) counts[err] = 0
                counts[err]++
             })
          }
       })
       return counts
    })

    return {
      store,
      aggregatedErrors
    }
  }
})
</script>
