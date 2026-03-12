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
  <q-page padding class="fade-in flex flex-center">
    <div class="full-width" style="max-width: 600px">
        <q-card class="soft-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Preferências e Regras</div>
            <div class="text-caption text-grey-7">Configure como o AFDMaster deve lidar com dados durante o parsing e validação.</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-list separator>
              <!-- Config 1 -->
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Validar NSR Sequencial</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    Irá exibir um erro se detectar falhas na sequência de Numeração de Registro.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="primary" v-model="store.settings.checkNsrSequential" />
                </q-item-section>
              </q-item>

              <!-- Config 2 -->
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Alerta de Marcação Impar</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    Avisa quando há um número ímpar de batidas por funcionário em um único dia.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="primary" v-model="store.settings.checkOddMarks" />
                </q-item-section>
              </q-item>

              <!-- Config: Validação de Duplicatas -->
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Aviso de Marcação Duplicada</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    Aponta um alerta caso um funcionário bata o ponto em um intervalo de tempo muito curto (dentro da tolerância).
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="primary" v-model="store.settings.checkDuplicates" />
                </q-item-section>
              </q-item>

              <!-- Sub-Config: Tolerância em Minutos (só exibe se duplicatas = true) -->
              <q-item v-if="store.settings.checkDuplicates" class="q-pl-xl">
                <q-item-section>
                  <q-item-label>Minutos de Tolerância</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    Tempo máximo (em minutos) entre batidas para serem consideradas duplicadas da mesma ocorrência.
                  </q-item-label>
                </q-item-section>
                <q-item-section side style="min-width: 100px;">
                  <q-input 
                     v-model.number="store.settings.duplicateToleranceMinutes" 
                     type="number" 
                     dense 
                     outlined 
                     min="0" 
                     max="60"
                     suffix="min"
                     class="soft-input"
                  />
                </q-item-section>
              </q-item>

              <!-- Config 3 -->
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Sempre Reindexar NSR ao Exportar</q-item-label>
                  <q-item-label caption class="text-grey-6">
                    Recalcula do 1 até o fim (isso pode ser alterado pontualmente na tela de exportação também).
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="primary" v-model="store.settings.reindexNsrExport" />
                </q-item-section>
              </q-item>

              <!-- Ação destrutiva -->
              <q-item>
                 <q-item-section>
                    <q-item-label class="text-negative">Zerar Memória (Limpar Registros)</q-item-label>
                    <q-item-label caption class="text-grey-6">Apaga todo o arquivo lido no momento da aplicação sem salvar.</q-item-label>
                 </q-item-section>
                 <q-item-section side>
                     <q-btn unelevated color="negative" class="soft-btn" label="Limpar Dados" @click="confirmClear" />
                 </q-item-section>
              </q-item>

            </q-list>
          </q-card-section>
        </q-card>
    </div>
    <ConfirmEditDialog
      v-model="clearModal.open"
      title="Zerar Memória"
      message="Tem certeza que deseja apagar todos os registros da memória? Esta ação não pode ser desfeita."
      warning="Todos os dados importados serão perdidos."
      action-label="Limpar Tudo"
      action-color="negative"
      action-icon="delete_sweep"
      icon="warning"
      icon-color="negative"
      :dark="store.isDark"
      ref="confirmClearRef"
      @confirmed="executeClear"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useQuasar } from 'quasar'
import ConfirmEditDialog from 'src/components/ConfirmEditDialog.vue'

export default defineComponent({
  name: 'SettingsPage',
  components: { ConfirmEditDialog },
  setup() {
    const store = useAfdStore()
    const $q = useQuasar()
    const confirmClearRef = ref(null)

    const clearModal = ref({
      open: false
    })

    const confirmClear = () => {
      clearModal.value.open = true
    }

    const executeClear = () => {
      setTimeout(() => {
        store.clearData()
        confirmClearRef.value?.done()
        $q.notify({ type: 'positive', message: 'Dados da sessão foram apagados.' })
      }, 500)
    }

    return {
      store,
      clearModal,
      confirmClear,
      executeClear,
      confirmClearRef
    }
  }
})
</script>
