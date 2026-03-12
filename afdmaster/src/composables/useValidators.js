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

export function useValidators() {
    /**
     * Revalida um array inteiro de registros (usado na carga do arquivo).
     */
    const validateBulk = (records, portaria, settings = {}) => {
        let lastNsr = 0
        let expectedNsr = 0
        let lastDateByEmploee = {} // para verificar cronologia
        // Config limit de data
        const minDate = new Date('1900-01-01T00:00:00')
        const maxDate = new Date('2029-01-01T00:00:00')

        // Configurações
        const checkNsrSequential = settings.checkNsrSequential !== false
        const checkDuplicates = settings.checkDuplicates !== false
        const toleranceMs = (settings.duplicateToleranceMinutes || 0) * 60 * 1000

        // Rastreia duplicatas: guarda as datas(ms) de batidas por cpf
        const marcacoesPorFuncionario = {}

        // Rastreia eventos em par (Entrada/Saida)
        const paresEmploee = {}

        records.forEach(rec => {
            rec.erros = [] // zera
            rec.avisos = [] // zera

            // Validação de NSR (ignorada para o Cabeçalho - tipo 1 e Trailer - tipo 9)
            if (rec.tipo !== '1' && rec.tipo !== '9') {
                if (!rec.nsr || isNaN(rec.nsr)) {
                    rec.erros.push('NSR não numérico ou inexistente')
                } else {
                    if (checkNsrSequential) {
                        if (expectedNsr > 0) {
                            if (rec.nsr === expectedNsr) {
                                // Voltou para a sequência base esperada
                                lastNsr = rec.nsr
                                expectedNsr = rec.nsr + 1
                            } else if (rec.nsr === lastNsr + 1) {
                                // Continuou a partir de um pulo anterior
                                lastNsr = rec.nsr
                                expectedNsr = expectedNsr + 1
                            } else {
                                // Deu um pulo (quebra de sequência)
                                rec.erros.push('Quebra de sequência (salto no NSR)')
                                rec.isNsrBreak = true
                                lastNsr = rec.nsr
                                expectedNsr = expectedNsr + 1
                            }
                        } else {
                            // Primeira linha com NSR válido
                            lastNsr = rec.nsr
                            expectedNsr = rec.nsr + 1
                        }
                    }
                }
            }

            // Validação Data/Hora
            if (rec.dataHora) {
                const dt = new Date(rec.dataHora)
                if (isNaN(dt.getTime())) {
                    rec.erros.push('Data ou hora inválida')
                } else if (dt < minDate || dt > maxDate) {
                    rec.erros.push('Data fora do limite permitido (1900 a 2029)')
                }

                // Validação Cronológica por funcionário (só marcacoes)
                if (rec.tipo === '3' && (rec.cpf || rec.pis)) {
                    const empId = rec.cpf || rec.pis
                    if (lastDateByEmploee[empId]) {
                        if (dt < lastDateByEmploee[empId]) {
                            rec.erros.push('Marcação fora de ordem cronológica para este funcionário')
                        }
                    }
                    lastDateByEmploee[empId] = dt

                    // Pares
                    if (!paresEmploee[empId]) paresEmploee[empId] = []
                    paresEmploee[empId].push(rec)
                }
            }

            // Validações de duplicação por tempo (tolerância)
            if (checkDuplicates && rec.tipo === '3' && rec.dataHora) {
                const empId = rec.cpf || rec.pis
                const dtTime = new Date(rec.dataHora).getTime()

                if (empId && !isNaN(dtTime)) {
                    if (!marcacoesPorFuncionario[empId]) {
                        marcacoesPorFuncionario[empId] = []
                    }

                    // Verifica se já existe batida dentro da janela de tolerância para o mesmo func
                    const conflito = marcacoesPorFuncionario[empId].find(
                        (entry) => Math.abs(entry.ms - dtTime) <= toleranceMs
                    )

                    if (conflito) {
                        rec.avisos.push({
                            msg: `Possível marcação duplicada (intervalo ≤ ${settings.duplicateToleranceMinutes} min)`,
                            conflitoNsr: conflito.nsr
                        })
                    }

                    marcacoesPorFuncionario[empId].push({ ms: dtTime, nsr: rec.nsr })
                }
            }

            // Validação CPF / PIS baseada na Portaria
            const isValidNumber = (str) => typeof str === 'string' && /^\d+$/.test(str.trim()) && str.trim() !== '00000000000'

            if (portaria === '671') {
                if (rec.cpf && !isValidNumber(rec.cpf)) {
                    rec.erros.push('Erro: CPF apresenta formato inválido')
                }
            } else if (portaria === '1510') {
                if (rec.pis && !isValidNumber(rec.pis)) {
                    rec.erros.push('Erro: PIS apresenta formato inválido')
                }
            }
        })

        // Checagem de ímpares (entradas sem saídas lógicas em um dia) - Muito básico
        // Pode se basear no número de batidas no mesmo dia (ímpar indica que esqueceu de bater)
        for (const emp in paresEmploee) {
            const batidas = paresEmploee[emp]
            // Agrupa por dia "YYYY-MM-DD"
            const porDia = {}
            batidas.forEach(b => {
                const bDate = b.dataHora.substring(0, 10)
                if (!porDia[bDate]) porDia[bDate] = []
                porDia[bDate].push(b)
            })

            // Ordena cronologicamente por via das dúvidas
            for (const d in porDia) {
                porDia[d].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))

                // Marca pares Entrada/Saída
                porDia[d].forEach((b, index) => {
                    const number = Math.floor(index / 2) + 1
                    const tipoMovimento = index % 2 === 0 ? 'Entrada' : 'Saída'
                    b.ordemPar = `${tipoMovimento} ${number}`
                })

                if (porDia[d].length % 2 !== 0) {
                    // Marca warning no último evento do dia
                    const ultimoEvento = porDia[d][porDia[d].length - 1]
                    ultimoEvento.avisos.push({
                        msg: 'Número ímpar de marcações neste dia. Pode indicar falha na batida.'
                    })
                }
            }
        }
    }

    /**
     * Valida uma única alteração de registro no Modal
     */
    const validateSingle = (record) => {
        const errs = []

        // NSR
        if (isNaN(record.nsr) || record.nsr <= 0) {
            errs.push('NSR deve ser um número válido')
        }

        if (record.tipo === '3') {
            if (!record.dataHora) {
                errs.push('Data/Hora é obrigatório')
            } else {
                const dt = new Date(record.dataHora)
                if (isNaN(dt.getTime())) {
                    errs.push('Data/Hora tem formato inválido')
                }
            }
        }

        return errs
    }

    return {
        validateBulk,
        validateSingle
    }
}
