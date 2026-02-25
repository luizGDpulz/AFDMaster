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
                  <q-item-label caption>
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
                  <q-item-label caption>
                    Avisa quando há um número ímpar de batidas por funcionário em um único dia.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle color="primary" v-model="store.settings.checkOddMarks" />
                </q-item-section>
              </q-item>

              <!-- Config 3 -->
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Sempre Reindexar NSR ao Exportar</q-item-label>
                  <q-item-label caption>
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
                    <q-item-label caption>Apaga todo o arquivo lido no momento da aplicação sem salvar.</q-item-label>
                 </q-item-section>
                 <q-item-section side>
                    <q-btn flat class="soft-btn text-negative bg-red-1" label="Limpar Dados" @click="confirmClear" />
                 </q-item-section>
              </q-item>

            </q-list>
          </q-card-section>
        </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    const store = useAfdStore()
    const $q = useQuasar()

    const confirmClear = () => {
      $q.dialog({
        title: 'Confirmação',
        message: 'Tem certeza que deseja apagar todos os registros da memória?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        store.clearData()
        $q.notify({ type: 'positive', message: 'Dados da sessão foram apagados.' })
      })
    }

    return {
      store,
      confirmClear
    }
  }
})
</script>
