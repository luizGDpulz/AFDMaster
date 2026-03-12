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
  <q-badge
    :style="badgeStyle"
    class="record-type-badge"
  >
    {{ resolvedLabel }}
  </q-badge>
</template>

<script>
import { defineComponent, computed } from 'vue'

/**
 * Mapeamento de tipos de registro AFD → { label, color }
 * Baseado no manual oficial Portaria 671/2021
 */
const TIPO_MAP = {
  '1': { label: '1 - Cabeçalho',         color: '#1565C0' }, // blue darken-3
  '2': { label: '2 - Empresa',            color: '#6A1B9A' }, // purple darken-4
  '3': { label: '3 - Marcação',           color: '#00695C' }, // teal darken-3
  '4': { label: '4 - Ajuste Relógio',     color: '#E65100' }, // deep-orange darken-4
  '5': { label: '5 - Trabalhador',        color: '#283593' }, // indigo darken-4
  '6': { label: '6 - Evento Sensível',    color: '#B71C1C' }, // red darken-4
  '7': { label: '7 - Marcação REP-P',     color: '#006064' }, // cyan darken-4
  '9': { label: '9 - Trailer',            color: '#546E7A' }, // blue-grey darken-1
}

const DEFAULT_COLOR = '#4E342E' // brown darken-2

export default defineComponent({
  name: 'RecordTypeBadge',

  props: {
    /** Código do tipo de registro: '1' a '9' */
    tipo: {
      type: String,
      required: true,
    },
    /** Sobrescreve a cor automática (CSS color ou hex) */
    color: {
      type: String,
      default: null,
    },
    /** Sobrescreve o texto automático */
    label: {
      type: String,
      default: null,
    },
  },

  setup(props) {
    const tipoInfo = computed(() => TIPO_MAP[props.tipo] ?? null)

    const resolvedLabel = computed(() => {
      if (props.label) return props.label
      return tipoInfo.value?.label ?? `Tipo ${props.tipo}`
    })

    const resolvedColor = computed(() => {
      if (props.color) return props.color
      return tipoInfo.value?.color ?? DEFAULT_COLOR
    })

    const badgeStyle = computed(() => ({
      backgroundColor: resolvedColor.value,
      color: '#ffffff',
      borderRadius: '999px',    // pill shape
      padding: '5px 13px',      // ← tamanho vertical / horizontal
      fontSize: '0.80rem',      // ← tamanho da fonte
      fontWeight: '600',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }))

    return {
      resolvedLabel,
      badgeStyle,
    }
  },
})
</script>

<style scoped>
.record-type-badge {
  display: inline-flex;
  align-items: center;
  line-height: 1.4;
  transition: opacity 0.15s ease;
}
.record-type-badge:hover {
  opacity: 0.85;
}
</style>
