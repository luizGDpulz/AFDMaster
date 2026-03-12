/*
 * Copyright (C) 2026 Luiz Gustavo Dias Pulz
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable para calcular dinamicamente a altura de tabelas (q-table) do Quasar
 * para preencher exatamente o espaço restante na tela, evitando scrollbars duplos.
 *
 * @param {Object} options Configurações
 * @param {Ref<HTMLElement>} options.rootRef Ref para o elemento container raiz da tabela
 * @param {Number} [options.bottomPadding=24] Espaço extra na parte inferior (margins/paddings do app)
 * @param {String} [options.filterSelector='.q-col-gutter-sm'] Seletor CSS da barra de filtros acima da tabela (se houver)
 * @param {Number} [options.filterMargin=8] Margem extra que filtros podem ter e que afetam a altura
 * @returns {Object} { tableHeight } Ref reativa com a altura em pixels
 */
export function useTableHeight(options = {}) {
    const tableHeight = ref(600)
    let resizeObserver = null

    const {
        rootRef,
        bottomPadding = 24,
        filterSelector = '.q-col-gutter-sm',
        filterMargin = 8
    } = options

    const computeHeight = () => {
        const root = rootRef?.value
        if (!root) return

        // 1. Posição do container raíz
        const containerTop = root.getBoundingClientRect().top
        // 2. Espaço disponível
        const available = window.innerHeight - containerTop - bottomPadding

        // 3. Subtrai a altura real dos filtros se existirem
        let filtersH = 44 // fallback genérico
        if (filterSelector) {
            const filtersEl = root.querySelector(filterSelector)
            if (filtersEl && filtersEl.offsetHeight > 0) {
                filtersH = filtersEl.offsetHeight + filterMargin
            }
        }

        // Subtrai o padding top do root (16px) + filtros
        tableHeight.value = Math.max(200, Math.floor(available - 16 - filtersH))
    }

    onMounted(() => {
        resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(computeHeight)
        })

        if (rootRef?.value) resizeObserver.observe(rootRef.value)
        window.addEventListener('resize', computeHeight)

        // Fallbacks para garantir medida após renderização completa do Quasar
        setTimeout(computeHeight, 50)
        setTimeout(computeHeight, 300)
    })

    onUnmounted(() => {
        if (resizeObserver) resizeObserver.disconnect()
        window.removeEventListener('resize', computeHeight)
    })

    return { tableHeight, computeHeight }
}
