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
    <q-card style="min-width: 440px; max-width: 500px; border-radius: 24px; max-height: 90vh; display: flex; flex-direction: column;" 
            class="soft-card shadow-12">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center q-gutter-sm">
          <q-icon name="today" size="sm" color="primary" />
          <span class="text-h6 text-weight-bold">Marcações do Dia</span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('hide')" />
      </q-card-section>
      <q-separator class="q-mt-sm" />
      
      <q-card-section class="q-pa-md punches-body" style="max-height: 60vh; overflow-y: auto;">
         <q-list separator class="rounded-borders shadow-1 punches-list">
            <q-item v-for="(punch, idx) in punches" :key="idx" clickable v-ripple class="punches-item">
               <q-item-section avatar style="min-width: 100px; padding-right: 16px;">
                  <q-chip
                    :class="punch.ordemPar && punch.ordemPar.startsWith('Entrada') ? 'chip-entrada' : 'chip-saida'"
                    size="sm"
                    class="text-weight-bold shadow-1"
                    style="width: 85px; justify-content: center; margin: 0;"
                  >
                     {{ punch.ordemPar || '?' }}
                  </q-chip>
               </q-item-section>
               <q-item-section>
                  <q-item-label class="text-weight-bold text-mono punch-time">{{ punch.dataHora ? punch.dataHora.substring(11, 16) : '—' }}</q-item-label>
                  <q-item-label caption class="punch-caption">{{ formatDate(punch.dataHora ? punch.dataHora.substring(0, 10) : '') }} <span v-if="punch.fusoHorario">GMT{{ punch.fusoHorario }}</span></q-item-label>
               </q-item-section>
               <q-item-section side>
                  <span class="nsr-badge">NSR: {{ punch.nsr }}</span>
               </q-item-section>
            </q-item>
         </q-list>
      </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DayPunchesDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    punches: { type: Array, default: () => [] }
  },
  emits: ['hide'],
  setup() {
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '—'
      const [y, m, dd] = dateStr.split('-')
      return `${dd}/${m}/${y}`
    }

    return {
      formatDate
    }
  }
})
</script>

<style scoped>
.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

/* ── Corpo da lista ── */
.punches-body {
  background-color: var(--qm-bg-secondary);
}

.punches-list {
  background-color: var(--qm-surface);
  border: 1px solid var(--qm-border);
}

.punches-item {
  color: var(--qm-text-primary);
}

.punches-item:hover {
  background-color: var(--qm-bg-tertiary);
}

/* ── Hora ── */
.punch-time {
  color: var(--qm-text-primary);
}

.punch-caption {
  color: var(--qm-text-secondary) !important;
}

/* ── Chips Entrada / Saída ── */
.chip-entrada {
  background-color: rgba(34, 197, 94, 0.15) !important;
  color: #16a34a !important;
  border: 1px solid rgba(34, 197, 94, 0.3) !important;
}

.chip-saida {
  background-color: rgba(249, 115, 22, 0.15) !important;
  color: #ea580c !important;
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
}

[data-theme="dark"] .chip-entrada {
  background-color: rgba(34, 197, 94, 0.18) !important;
  color: #4ade80 !important;
  border-color: rgba(34, 197, 94, 0.35) !important;
}

[data-theme="dark"] .chip-saida {
  background-color: rgba(249, 115, 22, 0.18) !important;
  color: #fb923c !important;
  border-color: rgba(249, 115, 22, 0.35) !important;
}

/* ── Badge NSR ── */
.nsr-badge {
  display: inline-block;
  background-color: var(--qm-bg-tertiary);
  color: var(--qm-text-secondary);
  border: 1px solid var(--qm-border);
  border-radius: 24px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  padding: 3px 10px;
  white-space: nowrap;
}
</style>
