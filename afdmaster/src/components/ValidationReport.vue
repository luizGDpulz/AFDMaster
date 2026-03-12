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
  <div class="q-pa-md">
    <div v-if="!store.hasRecords" class="text-center q-pa-xl text-grey-6">
      <q-icon name="rule" size="48px" />
      <div class="text-h6 q-mt-md">Nenhum dado para validar.</div>
    </div>

    <div v-else>
      <div class="row q-col-gutter-md">
        <!-- Overview Stats -->
        <div class="col-12 col-md-3">
          <q-card class="soft-card bg-negative text-white">
            <q-card-section>
              <div class="text-overline uppercase">Total de Erros</div>
              <div class="text-h3">{{ store.validationSummary.totalErros }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="soft-card bg-warning text-black">
            <q-card-section>
              <div class="text-overline uppercase">Total de Avisos</div>
              <div class="text-h3">{{ store.validationSummary.totalAvisos }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="soft-card bg-info text-white">
            <q-card-section>
              <div class="text-overline uppercase">Registros Alterados</div>
              <div class="text-h3">{{ store.validationSummary.totalAlterados }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="soft-card bg-primary text-white">
            <q-card-section>
              <div class="text-overline uppercase">Total Processado</div>
              <div class="text-h3">{{ store.records.length }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lista de erros consolidada -->
        <div class="col-12 q-mt-md" v-if="store.validationSummary.totalErros > 0">
           <q-card class="soft-card">
              <q-card-section class="q-pb-none">
                <div class="text-h6 text-negative">Resumo de Erros Críticos</div>
              </q-card-section>
              <q-card-section>
                <q-list separator>
                  <q-item 
                    v-for="(count, errorMsg) in store.validationSummary.aggregatedErrors" 
                    :key="errorMsg"
                    clickable
                    v-ripple
                    @click="$emit('filter-error', errorMsg)"
                  >
                     <q-item-section>
                       <q-item-label>{{ errorMsg }}</q-item-label>
                       <q-item-label caption class="text-secondary cursor-pointer row items-center q-mt-xs">
                         <q-icon name="search" size="xs" class="q-mr-xs" />
                         Visualizar os registros com este erro
                       </q-item-label>
                     </q-item-section>
                     <q-item-section side>
                       <q-badge color="negative" class="text-weight-bold" :label="count + ' ocorrência(s)'" />
                     </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
           </q-card>
        </div>

        <!-- Lista de avisos consolidada -->
        <div class="col-12 q-mt-md" v-if="store.validationSummary.totalAvisos > 0">
           <q-card class="soft-card border-warning">
              <q-card-section class="q-pb-none">
                <div class="text-h6 text-warning-dark">Resumo de Avisos</div>
              </q-card-section>
              <q-card-section>
                <q-list separator>
                  <q-item 
                    v-for="(count, warnMsg) in store.validationSummary.aggregatedWarnings" 
                    :key="warnMsg"
                    clickable
                    v-ripple
                    @click="$emit('filter-warning', warnMsg)"
                  >
                     <q-item-section>
                       <q-item-label>{{ warnMsg }}</q-item-label>
                       <q-item-label caption class="text-secondary cursor-pointer row items-center q-mt-xs">
                         <q-icon name="search" size="xs" class="q-mr-xs" />
                         Visualizar os registros com este aviso
                       </q-item-label>
                     </q-item-section>
                     <q-item-section side>
                       <q-badge color="warning" text-color="black" class="text-weight-bold" :label="count + ' ocorrência(s)'" />
                     </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
           </q-card>
        </div>

    <!-- Everything OK State -->
    <div class="col-12 q-mt-md" v-if="store.validationSummary.totalErros === 0 && store.validationSummary.totalAvisos === 0">
        <q-card class="soft-card bg-positive text-white">
          <q-card-section class="text-center">
              <q-icon name="check_circle" size="48px" />
              <div class="text-h6 q-mt-md">Arquivo sem inconsistências!</div>
              <div class="text-subtitle2">Nenhum erro ou aviso detectado. Pronto para exportação.</div>
          </q-card-section>
        </q-card>
    </div>

    <!-- Rescan Button -->
    <div class="col-12 row justify-end q-mt-lg">
      <q-btn
        unelevated
        color="primary"
        icon="refresh"
        label="Reescanear Arquivo e Atualizar"
        class="soft-btn soft-btn-primary"
        @click="rescan"
      />
    </div>
  </div>
</div>
</div>
</template>

<script>
import { defineComponent } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useValidators } from 'src/composables/useValidators'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ValidationReport',
  emits: ['filter-error', 'filter-warning'],
  setup() {
    const store = useAfdStore()
    const { validateBulk } = useValidators()
    const $q = useQuasar()

    const rescan = () => {
      // 1. Roda as validações brutas e insere os erros/avisos individuais nas linhas
      validateBulk(store.records, store.portaria, store.settings)
      // 2. Condensa tudo nos resumos para exibição limpa e leve
      store.computeValidationSummary()
      
      $q.notify({
        type: 'positive',
        message: 'Validações atualizadas com sucesso!',
        icon: 'check_circle'
      })
    }

    return {
      store,
      rescan
    }
  }
})
</script>
