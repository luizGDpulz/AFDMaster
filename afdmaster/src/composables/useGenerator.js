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

/**
 * Gerador de Arquivo AFD - Portaria 1510 e 671
 *
 * Estratégia de geração:
 *   1. Registro NÃO alterado + sem reindexação → usa rec.raw original integralmente (preservação total)
 *   2. Registro ALTERADO com rec.raw disponível → usa rec.raw atualizado + ajusta NSR se reindexando
 *   3. Registro ALTERADO sem rec.raw → reconstrói a linha a partir dos campos em memória (fallback)
 */

import { appendCrc671 } from 'src/utils/crc'

export function useGenerator() {

    // Padding Left (Preenche com zeros)
    const padZeros = (num, size) => {
        let s = String(num || '')
        while (s.length < size) s = '0' + s
        return s
    }

    /**
     * Gera o conteúdo final do arquivo considerando a portaria.
     */
    const generateFileContent = (records, portaria, options = {}) => {
        const { reindexNsr, reindexNsrStart } = options

        let conteudoFinal = []
        let currentNsr = reindexNsr ? (parseInt(reindexNsrStart) || 1) : 1

        for (const rec of records) {
            // ── Caso 1: Não alterado e sem reindexação ──────────────────────────────
            // Usa a linha original para preservar 100% da integridade do arquivo original.
            if (!rec.alterado && !reindexNsr && rec.raw) {
                conteudoFinal.push(rec.raw)
                currentNsr++
                continue
            }

            // ── Caso 2: Alterado com rec.raw disponível ─────────────────────────────
            // O editor já atualizou rec.raw (substituição, conversão de portaria, omissão de NSR).
            // Apenas ajustamos o NSR no início da linha se reindexando e recalculamos o CRC se portaria 671.
            if (rec.raw) {
                const nsrToUse = reindexNsr ? currentNsr : (rec.nsr || currentNsr)
                const nsrPadded = padZeros(nsrToUse, 9)
                let modifiedRaw = nsrPadded + rec.raw.substring(9)

                // No formato 671, se a linha foi alterada, o CRC antigo que está no final 
                // da string precisa ser refeito.
                if (portaria === '671' && modifiedRaw.length >= 5) {
                    const withoutCrc = modifiedRaw.substring(0, modifiedRaw.length - 4)
                    modifiedRaw = appendCrc671(withoutCrc)
                }

                conteudoFinal.push(modifiedRaw)
                currentNsr++
                continue
            }

            // ── Caso 3: Fallback — sem rec.raw (registro criado programaticamente) ──
            const nsrToUse = reindexNsr ? currentNsr : rec.nsr
            let linhaGerada = ''

            if (portaria === '1510') {
                if (rec.tipo === '3') {
                    const nsrPadded = padZeros(nsrToUse, 9)

                    let dtStr = '00000000'
                    let hrStr = '0000'

                    if (rec.dataHora) {
                        const dt = new Date(rec.dataHora)
                        if (!isNaN(dt.getTime())) {
                            const day = padZeros(dt.getDate(), 2)
                            const mon = padZeros(dt.getMonth() + 1, 2)
                            const yyyy = padZeros(dt.getFullYear(), 4)
                            dtStr = `${day}${mon}${yyyy}`
                            const hh = padZeros(dt.getHours(), 2)
                            const mi = padZeros(dt.getMinutes(), 2)
                            hrStr = `${hh}${mi}`
                        }
                    }

                    const pisPadded = padZeros(rec.pis || rec.cpf || '0', 12)
                    linhaGerada = `${nsrPadded}3${dtStr}${hrStr}${pisPadded}`
                }
            } else {
                // Portaria 671
                if (rec.tipo === '3') {
                    const nsrPadded = padZeros(nsrToUse, 9)
                    let dhStr671 = '0000-00-00T00:00:00-0300'

                    if (rec.dataHora) {
                        const dt = new Date(rec.dataHora)
                        if (!isNaN(dt.getTime())) {
                            const day = padZeros(dt.getDate(), 2)
                            const mon = padZeros(dt.getMonth() + 1, 2)
                            const yyyy = padZeros(dt.getFullYear(), 4)
                            const hh = padZeros(dt.getHours(), 2)
                            const mi = padZeros(dt.getMinutes(), 2)
                            dhStr671 = `${yyyy}-${mon}-${day}T${hh}:${mi}:00-0300`
                        }
                    }

                    const cpfPadded = padZeros(rec.cpf || rec.pis || '0', 12)
                    linhaGerada = `${nsrPadded}3${dhStr671}${cpfPadded}`
                }
            }

            if (linhaGerada) {
                conteudoFinal.push(linhaGerada)
                currentNsr++
            }
        }

        return conteudoFinal.join('\r\n') + '\r\n' // CRLF exigido pelas portarias
    }

    /**
     * Gera conteúdo para exportação de batidas (layout personalizado)
     * @param {Array} records 
     * @param {Object} options { layout: 'fixed'|'delimited', delimiter: ';', fields: { cpf: 11, date: 8, time: 4 } }
     */
    const generateBatidasContent = (records, options = {}) => {
        const { layout = 'delimited', delimiter = ';', fields = { cpf: 11, date: 8, time: 4 } } = options
        
        let lines = []
        for (const rec of records) {
            if (rec.tipo !== '3') continue // Apenas marcações

            let cpfVal = (rec.cpf || rec.pis || '').replace(/\D/g, '')
            let dtStr = ''
            let hrStr = ''

            if (rec.dataHora) {
                const dt = new Date(rec.dataHora)
                if (!isNaN(dt.getTime())) {
                    const day = padZeros(dt.getDate(), 2)
                    const mon = padZeros(dt.getMonth() + 1, 2)
                    const yyyy = padZeros(dt.getFullYear(), 4)
                    dtStr = `${day}${mon}${yyyy}`
                    
                    const hh = padZeros(dt.getHours(), 2)
                    const mi = padZeros(dt.getMinutes(), 2)
                    hrStr = `${hh}${mi}`
                }
            }

            if (layout === 'fixed') {
                const cpfPadded = padZeros(cpfVal, fields.cpf || 11).slice(-(fields.cpf || 11))
                const dtPadded = padZeros(dtStr, fields.date || 8).slice(-(fields.date || 8))
                const hrPadded = padZeros(hrStr, fields.time || 4).slice(-(fields.time || 4))
                lines.push(`${cpfPadded}${dtPadded}${hrPadded}`)
            } else {
                lines.push(`${cpfVal}${delimiter}${dtStr}${delimiter}${hrStr}${delimiter}`)
            }
        }
        return lines.join('\r\n') + '\r\n'
    }

    return {
        generateFileContent,
        generateBatidasContent
    }
}
