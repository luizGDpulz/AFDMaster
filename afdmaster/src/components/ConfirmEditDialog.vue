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
  <q-dialog v-model="open" :dark="dark" persistent transition-show="scale" transition-hide="scale">
    <q-card class="soft-card confirm-dialog" :dark="dark">
      <!-- Ícone + Título -->
      <q-card-section class="row items-center no-wrap q-pb-none">
        <q-icon
          :name="icon"
          :color="iconColor"
          size="28px"
          class="q-mr-sm"
        />
        <div class="text-h6 text-weight-bold">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cancel" :disable="loading" />
      </q-card-section>

      <!-- Mensagem descritiva -->
      <q-card-section class="q-pt-sm">
        <div class="text-body2 text-grey-7 confirm-message">{{ message }}</div>
        <div v-if="warning" class="q-mt-sm row items-start no-wrap warn-box">
          <q-icon name="warning" color="warning" size="18px" class="q-mr-xs q-mt-xs flex-shrink-0" />
          <div class="text-caption text-warning-dark">{{ warning }}</div>
        </div>
      </q-card-section>

      <!-- Loading enquanto executa -->
      <q-card-section v-if="loading" class="text-center q-pt-none q-pb-md">
        <q-spinner-dots color="primary" size="36px" />
        <div class="text-caption text-grey-6 q-mt-xs">{{ loadingMessage }}</div>
      </q-card-section>

      <!-- Botões de ação -->
      <q-card-actions align="right" class="q-pa-md q-pt-none" v-if="!loading">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          class="soft-btn"
          @click="cancel"
        />
        <q-btn
          unelevated
          :label="actionLabel"
          :color="actionColor"
          :icon="actionIcon"
          class="soft-btn"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'ConfirmEditDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmar Ação'
    },
    message: {
      type: String,
      default: 'Deseja realmente executar esta operação?'
    },
    warning: {
      type: String,
      default: ''
    },
    actionLabel: {
      type: String,
      default: 'Confirmar'
    },
    actionColor: {
      type: String,
      default: 'primary'
    },
    actionIcon: {
      type: String,
      default: 'check'
    },
    icon: {
      type: String,
      default: 'help_outline'
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    loadingMessage: {
      type: String,
      default: 'Processando...'
    },
    dark: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirmed', 'cancelled'],
  setup(props, { emit }) {
    const open = ref(props.modelValue)
    const loading = ref(false)

    watch(() => props.modelValue, (val) => {
      open.value = val
      if (!val) loading.value = false
    })

    watch(open, (val) => {
      emit('update:modelValue', val)
    })

    const confirm = () => {
      loading.value = true
      emit('confirmed')
    }

    const cancel = () => {
      open.value = false
      emit('cancelled')
    }

    // Método exposto para o pai fechar o loading e o dialog
    const done = () => {
      loading.value = false
      open.value = false
    }

    return { open, loading, confirm, cancel, done }
  }
})
</script>

<style scoped>
.confirm-dialog {
  min-width: 380px;
  max-width: 520px;
  border-radius: 14px !important;
}

.confirm-message {
  line-height: 1.55;
}

.warn-box {
  background: rgba(255, 160, 0, 0.08);
  border: 1px solid rgba(255, 160, 0, 0.3);
  border-radius: 8px;
  padding: 8px 10px;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
