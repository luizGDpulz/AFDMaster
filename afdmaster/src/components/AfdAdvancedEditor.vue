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

    <!-- ══════════════════════════════════════════════════════════════
         AVISO LEGAL
         ══════════════════════════════════════════════════════════════ -->
    <q-banner rounded class="legal-warning-banner q-mb-lg">
      <template #avatar>
        <q-icon name="gavel" color="deep-orange" size="28px" />
      </template>
      <div class="text-weight-bold text-deep-orange q-mb-xs" style="font-size:0.9rem;">
        Atenção: Esta ferramenta gera arquivos que sistemas de ponto interpretarão como batidas originais.
      </div>
      <div class="text-caption text-grey-7" style="line-height:1.55;">
        A edição de arquivos AFD pode impactar diretamente registros fiscais e trabalhistas sujeitos
        à fiscalização. Use esta funcionalidade <strong>apenas como último recurso</strong>, devidamente
        justificado e com autorização do líder de equipe respónsável.<br />
        Dúvidas? Consulte o líder de equipe ou o desenvolvedor do sistema.
      </div>
    </q-banner>

    <div class="row items-center justify-between q-mb-md" v-if="hasPassword && !isUnlocked">
      <div class="text-subtitle2 text-grey-7">Algumas funcionalidades avançadas estão protegidas.</div>
      <q-btn
        flat
        color="primary"
        icon="lock_open"
        label="Opções Técnicas"
        @click="promptPassword"
        class="soft-btn"
      />
    </div>

    <div class="row q-col-gutter-lg">

      <!-- ══════════════════════════════════════════════════════════════
           BLOCO 1 — Substituição de CPF / PIS
           ══════════════════════════════════════════════════════════════ -->
      <div class="col-12 col-md-6">
        <q-card class="soft-card full-height-card">
          <q-card-section>

            <!-- Título adaptado à portaria -->
            <div class="text-h6 text-primary row items-center q-mb-xs">
              <q-icon name="find_replace" class="q-mr-sm" />
              Substituição de {{ store.portaria === '1510' ? 'PIS' : 'CPF' }}
            </div>

            <template v-if="!hasPassword || isUnlocked">
              <div class="text-caption text-grey-7 q-mb-md">
                Troca o {{ store.portaria === '1510' ? 'PIS' : 'CPF' }} de um funcionário nas marcações.
                Útil quando o colaborador bateu ponto com o crachá errado.
              </div>

              <!-- Switch de modo — apenas 2 opções -->
              <div class="q-mb-md">
                <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Abrangência da substituição:</div>
                <q-btn-toggle
                  v-model="replaceMode"
                  spread
                  unelevated
                  :toggle-color="store.isDark ? 'white' : 'primary'"
                  :toggle-text-color="store.isDark ? 'black' : 'white'"
                  :color="store.isDark ? 'grey-10' : 'grey-2'"
                  :text-color="store.isDark ? 'grey-6' : 'grey-8'"
                  :options="replaceModeOptions"
                  class="mode-toggle"
                  :dark="store.isDark"
                />
                <div class="text-caption text-grey-6 q-mt-xs">
                  <span v-if="replaceMode === 'batch'">
                    Substitui em <strong>todos os registros</strong> onde o {{ store.portaria === '1510' ? 'PIS' : 'CPF' }} bater.
                  </span>
                  <span v-else>
                    Substitui <strong>apenas nos NSRs informados</strong> abaixo.
                  </span>
                </div>
              </div>

              <!-- Campos: documento incorreto → correto -->
              <div class="q-gutter-md">
                <q-input
                  outlined dense
                  v-model="replaceForm.from"
                  :label="`${store.portaria === '1510' ? 'PIS' : 'CPF'} incorreto (a localizar)`"
                  class="soft-input"
                  :hint="`Digite apenas os dígitos do ${store.portaria === '1510' ? 'PIS (11 dígitos)' : 'CPF (11 dígitos)'}`"
                />
                <q-input
                  outlined dense
                  v-model="replaceForm.to"
                  :label="`${store.portaria === '1510' ? 'PIS' : 'CPF'} correto (substituir por)`"
                  class="soft-input"
                  :hint="store.portaria === '1510'
                    ? 'PIS: 11 dígitos. Mais de 12 dígitos não é aceito.'
                    : 'CPF: 11 dígitos. Mais de 12 dígitos não é aceito.'"
                />


                <!-- Campo NSR - só aparece no modo Somente por NSR -->
                <div v-if="replaceMode === 'manual'" class="q-mt-md">
                  <q-input
                    outlined dense
                    v-model="replaceForm.nsrList"
                    :label="(nsrFocused || replaceForm.nsrList) ? undefined : 'NSRs dos registros a alterar'"
                    class="soft-input"
                    hint="Separe por vírgula: ex. 100, 101, 102"
                    :placeholder="(nsrFocused || replaceForm.nsrList) ? 'Ex: 100, 101, 102' : ''"
                    @focus="nsrFocused = true"
                    @blur="nsrFocused = false"
                  />
                </div>
              </div>

              <div class="text-right q-mt-md">
                <q-btn
                  color="primary"
                  icon="swap_horiz"
                  label="Aplicar Substituição"
                  unelevated
                  class="soft-btn soft-btn-primary"
                  @click="openReplaceConfirm"
                  :disable="!replaceForm.from || !replaceForm.to"
                />
              </div>
            </template>
            <div v-else class="flex flex-center q-pa-lg text-center" style="min-height: 200px;">
               <div>
                 <q-icon name="lock" size="48px" color="grey-4" />
                 <div class="text-caption text-grey-6 q-mt-sm">Protegido por senha técnica</div>
               </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           BLOCO 2 — Reindexar NSR
           ══════════════════════════════════════════════════════════════ -->
      <div class="col-12 col-md-6">
        <q-card class="soft-card full-height-card">
          <q-card-section>

            <div class="text-h6 row items-center q-mb-xs" style="color: var(--qm-warning-dark, #e65100);">
              <q-icon name="format_list_numbered" class="q-mr-sm" />
              Reindexar NSR
            </div>

            <template v-if="!hasPassword || isUnlocked">
              <!-- O que é o NSR -->
              <q-card flat bordered class="nsr-info-box q-mb-md">
                <q-card-section class="q-pa-sm">
                  <div class="text-caption text-weight-bold q-mb-xs" style="color: var(--qm-warning-dark);">O que é o NSR?</div>
                  <div class="text-caption text-grey-7">
                    O <strong>NSR (Número Sequencial de Registro)</strong> é o &ldquo;número de linha&rdquo; do arquivo AFD.
                    Cada linha tem um número único e crescente. Se o arquivo foi gerado incompleto
                    (começando no NSR 1000, por exemplo) ou tem lacunas, o REP pode rejeitar a leitura.
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="text-caption text-grey-7">
                    <b>Reindexar na exportação</b> recalcula os NSRs em sequência crescente a partir
                    do número configurado abaixo — sem alterar nada em memória.
                    Combinado com filtros de data ou NSR, o arquivo exportado 
                    já sairá com a numeração correta a partir desse ponto.
                  </div>
                </q-card-section>
              </q-card>

              <!-- Toggle + NSR inicial -->
              <div class="row items-center justify-between q-mb-sm">
                <div>
                  <div class="text-caption text-weight-bold">Reindexar NSR na exportação</div>
                  <div class="text-caption text-grey-6">Recalcula os NSRs ao baixar o arquivo</div>
                </div>
                <q-toggle
                  v-model="store.settings.reindexNsrExport"
                  color="primary"
                />
              </div>

              <!-- NSR inicial (só visível quando toggle ativo) -->
              <div v-if="store.settings.reindexNsrExport" class="q-mt-sm">
                <q-input
                  outlined dense
                  v-model.number="store.settings.reindexNsrStart"
                  type="number"
                  label="NSR inicial (começar a partir de)"
                  class="soft-input"
                  hint="O primeiro registro exportado receberá este número"
                  :rules="[v => v >= 1 || 'O NSR precisa ser maior que zero']"
                />
                <div class="text-caption text-grey-6 q-mt-xs">
                  Exemplo: filtrar de 01/03 a 31/03 + NSR inicial 500 → exporta só esse período
                  com NSRs começando em 500.
                </div>
              </div>
            </template>
            <div v-else class="flex flex-center q-pa-lg text-center" style="min-height: 200px;">
               <div>
                 <q-icon name="lock" size="48px" color="grey-4" />
                 <div class="text-caption text-grey-6 q-mt-sm">Protegido por senha técnica</div>
               </div>
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- ══════════════════════════════════════════════════════════════
           BLOCO 3 — Converter Portaria
           ══════════════════════════════════════════════════════════════ -->
      <div class="col-12 q-pb-md">
        <q-card class="soft-card">
          <q-card-section>

            <div class="text-h6 text-secondary row items-center q-mb-xs">
              <q-icon name="transform" class="q-mr-sm" />
              Trocar Portaria do Arquivo
            </div>

            <template v-if="!hasPassword || isUnlocked">
              <div class="text-caption text-grey-7 q-mb-md">
                Converte o formato inteiro do arquivo entre <strong>Portaria 1510</strong> e
                <strong>Portaria 671 (Padrão C)</strong>. Use quando o documento do funcionário foi
                enviado ao REP errado (ex: PIS enviado para REP 1510 vs CPF para REP 671).
              </div>

              <!-- Estado atual + Opções -->
              <div class="row q-col-gutter-md items-stretch">

                <!-- Painel esquerdo: estado atual -->
                <div class="col-12 col-md-4">
                  <div class="portaria-status-box">
                    <div class="text-caption text-grey-6 q-mb-xs">Arquivo atual:</div>
                    <div class="text-h5 text-weight-bold" :class="store.portaria === '1510' ? 'text-orange' : 'text-primary'">
                      {{ store.portaria === '1510' ? 'Portaria 1510' : 'Portaria 671' }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ store.portaria === '1510'
                        ? 'Data: DDMMAAAA+HHMM | Identificador: PIS | Sem fuso'
                        : 'Data: ISO DH | Identificador: CPF (12 chars) | Com fuso + CRC'
                      }}
                    </div>
                  </div>
                </div>

                <!-- Opções de conversão -->
                <div class="col-12 col-md-8">
                  <div class="row q-col-gutter-md">

                    <!-- 1510 → 671 -->
                    <div class="col-12 col-sm-6" v-if="store.portaria === '1510'">
                      <q-card flat bordered class="convert-option-card" :dark="store.isDark">
                        <q-card-section class="q-pa-md">
                          <div class="text-subtitle2 text-weight-bold text-primary q-mb-xs">
                            <q-icon name="arrow_forward" class="q-mr-xs" />
                            Converter para Portaria 671
                          </div>
                          <div class="text-caption text-grey-7 q-mb-md">
                            Converte data para formato ISO, ajusta CPF (12 chars), adiciona
                            campo de fuso (-0300) e calcula CRC-16/KERMIT em cada registro.
                          </div>
                          <div class="q-mb-sm">
                            <div class="text-caption text-grey-6 q-mb-xs">Fuso horário para usar:</div>
                            <q-select
                              outlined dense
                              v-model="conversionOptions.fuso"
                              :options="fusoOptions"
                              class="soft-input"
                              emit-value map-options
                            />
                          </div>
                          <q-btn
                            color="primary"
                            icon="transform"
                            label="Converter para 671"
                            unelevated
                            class="soft-btn soft-btn-primary full-width"
                            @click="openConvertConfirm('1510_to_671')"
                          />
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- 671 → 1510 -->
                    <div class="col-12 col-sm-6" v-if="store.portaria === '671'">
                      <q-card flat bordered class="convert-option-card" :dark="store.isDark">
                        <q-card-section class="q-pa-md">
                          <div class="text-subtitle2 text-weight-bold text-orange q-mb-xs">
                            <q-icon name="arrow_back" class="q-mr-xs" />
                            Converter para Portaria 1510
                          </div>
                          <div class="text-caption text-grey-7 q-mb-md">
                            Converte data ISO para DDMMAAAA, remove CRC, ajusta identificador
                            para PIS (12 chars).
                          </div>
                          <div class="row items-center q-mb-md">
                            <q-toggle v-model="conversionOptions.includeCrc1510" color="orange" />
                            <span class="text-caption text-grey-7 q-ml-sm">Incluir CRC no arquivo convertido</span>
                            <q-tooltip>
                              A Portaria 1510 normalmente não tem CRC, mas alguns fabricantes incluem.
                              Ative apenas se o REP de destino exigir.
                            </q-tooltip>
                          </div>
                          <q-btn
                            color="orange"
                            icon="transform"
                            label="Converter para 1510"
                            unelevated
                            class="soft-btn full-width"
                            @click="openConvertConfirm('671_to_1510')"
                          />
                        </q-card-section>
                      </q-card>
                    </div>

                  </div>
                </div>
              </div>
            </template>
            <div v-else class="flex flex-center q-pa-lg text-center" style="min-height: 200px;">
               <div>
                 <q-icon name="lock" size="48px" color="grey-4" />
                 <div class="text-caption text-grey-6 q-mt-sm">Protegido por senha técnica</div>
               </div>
            </div>

          </q-card-section>
        </q-card>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════════════════════
         MODAIS DE CONFIRMAÇÃO
         ══════════════════════════════════════════════════════════════ -->

    <ConfirmEditDialog
      v-model="confirm.replace.open"
      :title="confirm.replace.title"
      :message="confirm.replace.message"
      :warning="confirm.replace.warning"
      action-label="Aplicar Substituição"
      action-color="primary"
      action-icon="swap_horiz"
      icon="find_replace"
      icon-color="primary"
      loading-message="Substituindo documentos e revalidando..."
      ref="confirmReplaceRef"
      @confirmed="executeReplace"
    />

    <ConfirmEditDialog
      v-model="confirm.convert.open"
      :title="confirm.convert.title"
      :message="confirm.convert.message"
      warning="Esta operação reconstrói todos os registros do arquivo. É irreversível — exporte o arquivo original antes de converter."
      :action-label="confirm.convert.actionLabel"
      :action-color="confirm.convert.actionColor"
      :action-icon="confirm.convert.actionIcon"
      icon="transform"
      :icon-color="confirm.convert.actionColor"
      loading-message="Convertendo registros..."
      ref="confirmConvertRef"
      @confirmed="executeConvert"
    />

  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'
import { useQuasar } from 'quasar'
import { useValidators } from 'src/composables/useValidators'
import { appendCrc671, crc16kermitHex } from 'src/utils/crc'
import ConfirmEditDialog from 'src/components/ConfirmEditDialog.vue'

export default defineComponent({
  name: 'AfdAdvancedEditor',
  components: { ConfirmEditDialog },

  setup() {
    const store = useAfdStore()
    const $q = useQuasar()
    const { validateBulk } = useValidators()

    // ── Proteção Técnica ──────────────────────────────────────────
    const isUnlocked = ref(false)
    const hasPassword = computed(() => {
      return !!process.env.TECH_PASSWORD && process.env.TECH_PASSWORD !== ''
    })

    const promptPassword = () => {
      $q.dialog({
        title: 'Acesso Técnico',
        message: 'Informe a senha técnica para desbloquear estas opções:',
        prompt: {
          model: '',
          type: 'password'
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        if (data === process.env.TECH_PASSWORD) {
          isUnlocked.value = true
          $q.notify({ type: 'positive', message: 'Opções técnicas desbloqueadas!' })
        } else {
          $q.notify({ type: 'negative', message: 'Senha incorreta.' })
        }
      })
    }

    // ── Referências dos modais ─────────────────────────────────────
    const confirmReplaceRef = ref(null)
    const confirmConvertRef = ref(null)

    const nsrFocused = ref(false)

    // ── Estado da conversão de portaria ───────────────────────────
    let pendingConversionType = '' // '1510_to_671' | '671_to_1510'

    // ── Formulário: Substituição de documento ─────────────────────
    const replaceMode = ref('batch') // 'batch' | 'manual'
    const replaceModeOptions = [
      { label: 'Todos que encontrar', value: 'batch' },
      { label: 'Somente por NSR', value: 'manual' }
    ]

    const replaceForm = ref({ from: '', to: '', nsrList: '' })

    const fusoOptions = [
      { label: 'BRT — Brasília (GMT-03:00)', value: '-0300' },
      { label: 'AMT — Amazonas (GMT-04:00)', value: '-0400' },
      { label: 'FNT — Fernando de Noronha (GMT-02:00)', value: '-0200' },
      { label: 'ACT — Acre (GMT-05:00)', value: '-0500' },
      { label: 'UTC (GMT+00:00)', value: '+0000' }
    ]

    const conversionOptions = ref({
      fuso: '-0300',
      includeCrc1510: false
    })

    // ── Estado dos diálogos de confirmação ─────────────────────────
    const confirm = ref({
      replace: { open: false, title: '', message: '', warning: '' },
      convert: { open: false, title: '', message: '', actionLabel: '', actionColor: 'primary', actionIcon: 'transform' }
    })


    // ═══════════════════════════════════════════════════════════════
    // Helpers de validação de documento
    // ═══════════════════════════════════════════════════════════════

    /**
     * Normaliza e valida um campo de documento (PIS/CPF).
     * - 11 dígitos → adiciona zero na frente (12 chars)
     * - 12 dígitos → usa direto
     * - > 12 dígitos → retorna null (inválido)
     * @param {string} raw
     * @returns {{ value: string, warning: string|null } | null}
     */
    const parseDocumento = (raw) => {
      if (!raw) return null
      const digits = raw.replace(/\D/g, '')

      if (digits.length === 11) {
        return { value: '0' + digits, warning: null }
      }
      if (digits.length === 12) {
        return { value: digits, warning: null }
      }
      if (digits.length > 12) {
        return { value: null, warning: `Documento com ${digits.length} dígitos não pode ser processado (máximo 12).` }
      }
      // Menos de 11: mantém como está (PIS sem padding, campo de texto livre)
      return { value: digits.padStart(12, '0'), warning: null }
    }

    // ═══════════════════════════════════════════════════════════════
    // BLOCO 1 — Substituição de Documento
    // ═══════════════════════════════════════════════════════════════

    const openReplaceConfirm = () => {
      const fromRaw = replaceForm.value.from.trim()
      const toRawInput = replaceForm.value.to.trim()

      if (!fromRaw || !toRawInput) {
        $q.notify({ type: 'warning', message: 'Preencha os dois campos de documento.' })
        return
      }

      const toDoc = parseDocumento(toRawInput)
      if (toDoc && toDoc.value === null) {
        $q.notify({ type: 'negative', message: toDoc.warning })
        return
      }

      const modeLabels = {
        batch: `Todos os registros com o documento "${fromRaw}"`,
        manual: `Somente nos NSRs: ${replaceForm.value.nsrList || 'não informados'}`
      }

      const nsrListRaw = replaceForm.value.nsrList.trim()
      if (replaceMode.value === 'manual' && !nsrListRaw) {
        $q.notify({ type: 'warning', message: 'Informe ao menos um NSR para o modo Manual.' })
        return
      }

      confirm.value.replace = {
        open: true,
        title: 'Substituir Documento',
        message: `Substituir "${fromRaw}" por "${toRawInput}" — Modo: ${modeLabels[replaceMode.value]}`,
        warning: ''
      }
    }

    const executeReplace = () => {
      const fromRaw = replaceForm.value.from.trim()
      const toRawInput = replaceForm.value.to.trim()

      const toDoc = parseDocumento(toRawInput)
      if (!toDoc || toDoc.value === null) {
        confirmReplaceRef.value?.done()
        $q.notify({ type: 'negative', message: toDoc?.warning || 'Documento inválido.' })
        return
      }

      const fromDigits = fromRaw.replace(/\D/g, '')
      const toVal = toDoc.value
      if (toDoc.warning) {
        $q.notify({ type: 'warning', message: toDoc.warning })
      }

      // NSRs do modo manual
      let targetNsrs = new Set()
      if (replaceMode.value === 'manual') {
        replaceForm.value.nsrList.split(',').forEach(s => {
          const n = parseInt(s.trim(), 10)
          if (!isNaN(n)) targetNsrs.add(n)
        })
      }

      setTimeout(() => {
        let count = 0

        store.records.forEach(rec => {
          // Filtro por modo: 'batch' = onde o documento bater; 'manual' = por NSR específico
          if (replaceMode.value === 'batch') {
            const recDoc = (rec.pis || rec.cpf || '').replace(/\D/g, '')
            if (!recDoc.endsWith(fromDigits)) return
          } else if (replaceMode.value === 'manual') {
            if (!targetNsrs.has(parseInt(rec.nsr))) return
          }

          if (!rec.pis && !rec.cpf) return

          rec.pis = toVal
          rec.cpf = toVal

          // Atualização posicional do rec.raw para não quebrar colunas
          if (rec.raw) {
            if (store.portaria === '1510' && rec.tipo === '3') {
              // 1510 Tipo 3: PIS fica na pos 22 a 34 (12 chars). 
              const doc12 = toVal.padStart(12, '0').slice(-12)
              rec.raw = rec.raw.substring(0, 22) + doc12 + rec.raw.substring(34)
            } else if (store.portaria === '671') {
              if (rec.tipo === '3') {
                // 671 Tipo 3: CPF fica na pos 34 a 46 (12 chars).
                const doc12 = toVal.padStart(12, '0').slice(-12)
                rec.raw = rec.raw.substring(0, 34) + doc12 + rec.raw.substring(46)
              } else if (rec.tipo === '5') {
                // 671 Tipo 5: CPF fica na pos 34 a 45 (11 chars).
                const doc11 = toVal.padStart(12, '0').slice(-11)
                rec.raw = rec.raw.substring(0, 34) + doc11 + rec.raw.substring(45)
              }
            }
          }
          
          rec.alterado = true
          count++
        })

        validateBulk(store.records, store.portaria, store.settings)
        store.computeValidationSummary()

        confirmReplaceRef.value?.done()

        if (count > 0) {
          $q.notify({ type: 'positive', message: `${count} registro(s) tiveram o documento alterado.` })
          replaceForm.value = { from: '', to: '', nsrList: '' }
        } else {
          $q.notify({ type: 'warning', message: 'Nenhum registro encontrado com esse critério.' })
        }
      }, 50)
    }

    // ═══════════════════════════════════════════════════════════════
    // BLOCO 3 — Conversão de Portaria
    // ═══════════════════════════════════════════════════════════════

    const padZeros = (num, size) => {
      let s = String(num || 0)
      while (s.length < size) s = '0' + s
      return s
    }

    /**
     * Converte uma string ISO "AAAA-MM-DDTHH:MM:00ZZZZZ" para
     * data "DDMMAAAA" e hora "HHMM" (formato 1510).
     */
    const isoToDdmmaaaa = (iso) => {
      if (!iso || iso.length < 16) return { data: '00000000', hora: '0000' }
      const dd = iso.substring(8, 10)
      const mm = iso.substring(5, 7)
      const aaaa = iso.substring(0, 4)
      const hh = iso.substring(11, 13)
      const mi = iso.substring(14, 16)
      return { data: `${dd}${mm}${aaaa}`, hora: `${hh}${mi}` }
    }

    /**
     * Converte "DDMMAAAA" + "HHMM" para ISO "AAAA-MM-DDTHH:MM:00ZZZZZ".
     */
    const ddmmaaaaaToIso = (data, hora, fuso) => {
      if (!data || data.length < 8) return `0000-00-00T00:00:00${fuso}`
      const dd = data.substring(0, 2)
      const mm = data.substring(2, 4)
      const aaaa = data.substring(4, 8)
      const hh = hora ? hora.substring(0, 2) : '00'
      const mi = hora ? hora.substring(2, 4) : '00'
      return `${aaaa}-${mm}-${dd}T${hh}:${mi}:00${fuso}`
    }

    const openConvertConfirm = (convType) => {
      pendingConversionType = convType

      if (convType === '1510_to_671') {
        confirm.value.convert = {
          open: true,
          title: 'Converter para Portaria 671',
          message: `Todos os ${store.records.length} registros serão convertidos para o formato 671 (data ISO, CPF 12 chars, CRC-16/KERMIT). O fuso horário ${conversionOptions.value.fuso} será aplicado.`,
          actionLabel: 'Converter para 671',
          actionColor: 'primary',
          actionIcon: 'transform'
        }
      } else {
        const crcNote = conversionOptions.value.includeCrc1510
          ? ' CRC será calculado e incluído.'
          : ' Arquivo sem CRC (padrão 1510).'
        confirm.value.convert = {
          open: true,
          title: 'Converter para Portaria 1510',
          message: `Todos os ${store.records.length} registros serão convertidos para o formato 1510 (data DDMMAAAA, PIS 12 chars).${crcNote}`,
          actionLabel: 'Converter para 1510',
          actionColor: 'orange',
          actionIcon: 'transform'
        }
      }
    }

    const executeConvert = () => {
      const fuso = conversionOptions.value.fuso
      const includeCrc = conversionOptions.value.includeCrc1510

      setTimeout(() => {
        if (pendingConversionType === '1510_to_671') {
          convert1510To671(fuso)
        } else {
          convert671To1510(includeCrc)
        }
      }, 80)
    }

    /**
     * Converte todos os registros de Portaria 1510 para Portaria 671
     */
    const convert1510To671 = (fuso) => {
      store.records.forEach(rec => {
        let novaLinha = ''

        const nsrStr = padZeros(rec.nsr || 0, 9)

        switch (rec.tipo) {
          case '1': {
            // Preserva o raw mas muda as datas internas para ISO
            // Cabeçalho 1510: ddmmaaaa+hhmm na pos 221-232 → DH 671 na pos 227-250
            // Para simplificar: mantemos o raw original adaptando apenas o que sabemos
            if (rec.raw && rec.raw.length >= 232) {
              const dtStr = rec.raw.substring(220, 228)
              const hrStr = rec.raw.substring(228, 232)
              const dhIso = ddmmaaaaaToIso(dtStr, hrStr, fuso)
              // Monta linha 671 tipo 1 trocando a posição de data
              // Pos 001-206 = igual, Pos 207-216 dataInicial, 217-226 dataFinal, 227-250 DH geração
              // 251-302 extras + CRC
              // Convert dataInicial e dataFinal se existir
              let dIni = rec.dataInicial ? rec.dataInicial : (rec.raw.substring(204, 212) ? rec.raw.substring(204, 212) : '00000000')
              let dFim = rec.dataFinal ? rec.dataFinal : '00000000'
              if (dIni.length === 8 && !dIni.includes('-')) {
                dIni = `${dIni.substring(4)}-${dIni.substring(2,4)}-${dIni.substring(0,2)}`
              }
              if (dFim.length === 8 && !dFim.includes('-')) {
                dFim = `${dFim.substring(4)}-${dFim.substring(2,4)}-${dFim.substring(0,2)}`
              }
              // Preenche com espaços onde campos 671 são maiores
              const versao = '003'
              const flagFab = rec.raw.length >= 206 ? '1' : '1'
              const cnpjFab = ''.padEnd(14, '0')
              const modelo = ''.padEnd(30, ' ')
              const base = `${nsrStr}1${rec.flagCNPJ || '1'}${(rec.empregadorCnpjCpf || '').padEnd(14, '0')}${(rec.cnoCapef || '').padEnd(14, ' ')}${(rec.empregadorNome || '').padEnd(150, ' ')}${(rec.nroFabricacao || '').padEnd(17, ' ')}${dIni}${dFim}${dhIso}${versao}${flagFab}${cnpjFab}${modelo}`
              const crc = crc16kermitHex(base)
              novaLinha = base + crc
            } else {
              novaLinha = rec.raw || ''
            }
            break
          }
          case '3': {
            // 1510 tipo 3: NSR(9)+3+DATA(8)+HORA(4)+PIS(12) → 671 tipo 3: NSR(9)+3+DH(24)+CPF(12)+CRC(4)
            const raw = rec.raw || ''
            const dtStr = raw.length >= 18 ? raw.substring(10, 18) : '00000000'
            const hrStr = raw.length >= 22 ? raw.substring(18, 22) : '0000'
            const pisRaw = raw.length >= 34 ? raw.substring(22, 34) : '000000000000'

            const dhIso = ddmmaaaaaToIso(dtStr, hrStr, fuso)
            const base = `${nsrStr}3${dhIso}${pisRaw}`
            const crc = crc16kermitHex(base)
            novaLinha = base + crc

            // Atualiza os campos em memória
            rec.dataHora = dhIso.substring(0, 19) + ':' + dhIso.substring(19)
            rec.fusoHorario = fuso
            rec.cpf = pisRaw
            rec.crc = crc
            break
          }
          case '5': {
            const raw = rec.raw || ''
            const dtStr = raw.length >= 18 ? raw.substring(10, 18) : '00000000'
            const hrStr = raw.length >= 22 ? raw.substring(18, 22) : '0000'
            const dhIso = ddmmaaaaaToIso(dtStr, hrStr, fuso)
            const operacao = raw.length >= 23 ? raw.substring(22, 23) : 'I'
            const pisRaw = raw.length >= 35 ? raw.substring(23, 35) : '000000000000'
            const nome = raw.length >= 87 ? raw.substring(35, 87) : ''.padEnd(52, ' ')
            const demais = '    ' // 4 chars
            const cpfResp = '00000000000' // 11 chars
            const base = `${nsrStr}5${dhIso}${operacao}${pisRaw}${nome}${demais}${cpfResp}`
            const crc = crc16kermitHex(base)
            novaLinha = base + crc

            rec.dataHora = dhIso
            rec.fusoHorario = fuso
            rec.cpf = pisRaw
            rec.pis = pisRaw
            rec.crc = crc
            break
          }
          default:
            novaLinha = rec.raw || ''
            break
        }

        if (novaLinha) {
          rec.raw = novaLinha
          rec.alterado = true
        }
      })

      store.portaria = '671'
      validateBulk(store.records, '671', store.settings)
      store.computeValidationSummary()

      confirmConvertRef.value?.done()
      $q.notify({ type: 'positive', message: `Arquivo convertido para Portaria 671 com sucesso! ${store.records.length} registros processados.` })
    }

    /**
     * Converte todos os registros de Portaria 671 para Portaria 1510
     */
    const convert671To1510 = (includeCrc) => {
      store.records.forEach(rec => {
        let novaLinha = ''
        const nsrStr = padZeros(rec.nsr || 0, 9)

        switch (rec.tipo) {
          case '3': {
            // 671 tipo 3: NSR(9)+3+DH(24)+CPF(12)+CRC(4) → 1510: NSR(9)+3+DATA(8)+HORA(4)+PIS(12)[+CRC(4)]
            const raw = rec.raw || ''
            const dhIso = raw.length >= 34 ? raw.substring(10, 34) : '0000-00-00T00:00:00-0300'
            const cpfRaw = raw.length >= 46 ? raw.substring(34, 46) : '000000000000'
            const { data, hora } = isoToDdmmaaaa(dhIso)
            const base = `${nsrStr}3${data}${hora}${cpfRaw}`
            novaLinha = includeCrc ? appendCrc671(base) : base

            rec.dataHora = dhIso
            rec.fusoHorario = null
            rec.pis = cpfRaw
            rec.cpf = cpfRaw
            rec.crc = includeCrc ? crc16kermitHex(base) : null
            break
          }
          case '5': {
            const raw = rec.raw || ''
            const dhIso = raw.length >= 34 ? raw.substring(10, 34) : '0000-00-00T00:00:00-0300'
            const operacao = raw.length >= 35 ? raw.substring(34, 35) : 'I'
            const cpfRaw = raw.length >= 47 ? raw.substring(35, 47) : '000000000000'
            const nome = raw.length >= 99 ? raw.substring(47, 99) : ''.padEnd(52, ' ')
            const { data, hora } = isoToDdmmaaaa(dhIso)
            const base = `${nsrStr}5${data}${hora}${operacao}${cpfRaw}${nome}`
            novaLinha = includeCrc ? appendCrc671(base) : base

            rec.dataHora = dhIso
            rec.fusoHorario = null
            rec.cpf = cpfRaw
            rec.pis = cpfRaw
            rec.crc = includeCrc ? crc16kermitHex(base) : null
            break
          }
          default:
            novaLinha = rec.raw || ''
            break
        }

        if (novaLinha) {
          rec.raw = novaLinha
          rec.alterado = true
        }
      })

      store.portaria = '1510'
      validateBulk(store.records, '1510', store.settings)
      store.computeValidationSummary()

      confirmConvertRef.value?.done()
      $q.notify({
        type: 'positive',
        message: `Arquivo convertido para Portaria 1510!${includeCrc ? ' CRC incluído.' : ''}`
      })
    }

    return {
      store,
      // Substituição
      replaceMode,
      replaceModeOptions,
      replaceForm,
      openReplaceConfirm,
      executeReplace,

      // Conversão
      fusoOptions,
      conversionOptions,
      openConvertConfirm,
      executeConvert,
      // Modais
      confirm,
      nsrFocused,
      // Proteção
      isUnlocked,
      hasPassword,
      promptPassword
    }
  }
})
</script>

<style scoped>
.legal-warning-banner {
  background: rgba(255, 87, 34, 0.07) !important;
  border: 1px solid rgba(255, 87, 34, 0.25) !important;
  border-radius: 10px !important;
}

.legal-warning-banner :deep(.q-banner__content) {
  padding: 4px 0;
}

.full-height-card {
  height: 100%;
}

.mode-toggle {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--qm-border, #e0e0e0);
}

[data-theme="dark"] .mode-toggle {
  background: var(--qm-bg-secondary);
}

.mode-toggle :deep(.q-btn) {
  border-radius: 0 !important;
  font-size: 0.78rem;
  min-height: 36px;
}

.nsr-info-box {
  background: rgba(255, 160, 0, 0.05);
  border-color: rgba(255, 160, 0, 0.2) !important;
  border-radius: 8px !important;
}

.portaria-status-box {
  background: var(--qm-bg-secondary, #f5f5f5);
  border: 1px solid var(--qm-border, #e0e0e0);
  border-radius: 10px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.convert-option-card {
  border-radius: 10px !important;
  height: 100%;
}

[data-theme="dark"] .convert-option-card {
  background: var(--qm-surface-variant);
}
</style>
