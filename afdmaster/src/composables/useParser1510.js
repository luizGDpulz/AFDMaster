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
 * Parser para Portaria 1510/2009 (MTE) — Implementação Completa
 *
 * Layout conforme Anexo I da Portaria 1510/2009 (com alterações da Portaria 2233/2009).
 *
 * Principais diferenças em relação à Portaria 671:
 *   - Datas no formato DDMMAAAA (8 chars) + hora HHMM (4 chars) → sem fuso horário
 *   - Identificador de funcionário é o PIS (campo de 12 chars, mas PIS tem 11 dígitos)
 *   - Sem CRC por registro individual (sem campo CRC nas linhas tipo 2, 3, 4, 5)
 *   - Trailer (tipo 9) contém apenas qtd de tipos 2, 3, 4 e 5
 *
 * Todos os campos usam posições 1-based no manual → substring(start-1, end) em JS.
 */

export function useParser1510() {

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Converte data DDMMAAAA + hora HHMM para string ISO parcial AAAA-MM-DDTHH:MM:00
     * Retorna null se a data for claramente inválida (ex: zeros puros ou tamanho errado).
     */
    const ddmmaaaahhmm = (dataStr, horaStr) => {
        if (!dataStr || dataStr.length < 8) return null
        const dd = dataStr.substring(0, 2)
        const mm = dataStr.substring(2, 4)
        const aaaa = dataStr.substring(4, 8)
        const hh = horaStr ? horaStr.substring(0, 2) : '00'
        const mi = horaStr ? horaStr.substring(2, 4) : '00'

        // Sanidade: ano não pode ser 0000, mês não pode ser 00 ou > 12
        const year = parseInt(aaaa, 10)
        const month = parseInt(mm, 10)
        if (year === 0 || month === 0 || month > 12) return null

        return `${aaaa}-${mm}-${dd}T${hh}:${mi}:00`
    }

    /**
     * Converte data DDMMAAAA → string AAAA-MM-DD (para campos de data sem hora).
     */
    const ddmmaaaa = (dataStr) => {
        if (!dataStr || dataStr.length < 8) return null
        const dd = dataStr.substring(0, 2)
        const mm = dataStr.substring(2, 4)
        const aaaa = dataStr.substring(4, 8)
        const year = parseInt(aaaa, 10)
        const month = parseInt(mm, 10)
        if (year === 0 || month === 0 || month > 12) return null
        return `${aaaa}-${mm}-${dd}`
    }

    // ── Parser principal ─────────────────────────────────────────────────────

    const parseLines = (lines) => {
        const records = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimEnd()
            if (!line) continue

            // NSR: posições 001-009 (9 chars)
            let nsr = null
            if (line.length >= 9) {
                nsr = parseInt(line.substring(0, 9), 10)
            }

            // Tipo: posição 010 (1 char)
            const tipo = line.length >= 10 ? line.substring(9, 10) : ''

            const record = {
                id: i,             // índice interno (linha do arquivo)
                tipo,
                nsr,
                pis: null,         // PIS do funcionário (tipos 3 e 5)
                cpf: null,         // alias — mesmo valor que pis para compatibilidade com o restante da UI
                dataHora: null,    // ISO parcial AAAA-MM-DDTHH:MM:00 (campo principal da tabela)
                fusoHorario: null, // sempre null na 1510 (sem fuso)
                crc: null,         // sempre null na 1510 (sem CRC por linha)
                evento: null,
                raw: line,
                alterado: false,
                erros: []
            }

            try {
                // ── Trailer ────────────────────────────────────────────────
                // Pos 001-009 = "999999999" | 010-018 qtdTipo2 (9) | 019-027 qtdTipo3 (9)
                // 028-036 qtdTipo4 (9) | 037-045 qtdTipo5 (9) | 046 Tipo "9"
                if (line.startsWith('999999999')) {
                    record.tipo = '9'
                    if (line.length >= 18) record.qtdTipo2 = parseInt(line.substring(9, 18), 10) || 0
                    if (line.length >= 27) record.qtdTipo3 = parseInt(line.substring(18, 27), 10) || 0
                    if (line.length >= 36) record.qtdTipo4 = parseInt(line.substring(27, 36), 10) || 0
                    if (line.length >= 45) record.qtdTipo5 = parseInt(line.substring(36, 45), 10) || 0
                    records.push(record)
                    return records // Interrompe: nada mais deve existir após o trailer
                }

                switch (tipo) {

                    // ── Tipo 1: Cabeçalho ──────────────────────────────────
                    // Pos 001-009 NSR="000000000" | 010 Tipo="1"
                    // 011     flag CNPJ(1)/CPF(2) do empregador
                    // 012-025 CNPJ ou CPF do empregador (14 chars)
                    // 026-037 CEI do empregador (12 chars)
                    // 038-187 Razão Social / Nome (150 chars)
                    // 188-204 Número de fabricação REP (17 chars)
                    // 205-212 Data inicial dos registros DDMMAAAA (8 chars)
                    // 213-220 Data final dos registros DDMMAAAA (8 chars)
                    // 221-228 Data de geração do arquivo DDMMAAAA (8 chars)
                    // 229-232 Hora da geração do arquivo HHMM (4 chars)
                    case '1':
                        record.flagCNPJ = line.length >= 11 ? line.substring(10, 11) : null
                        record.empregadorCnpjCpf = line.length >= 25 ? line.substring(11, 25).trim() : null
                        record.cei = line.length >= 37 ? line.substring(25, 37).trim() : null
                        record.empregadorNome = line.length >= 187 ? line.substring(37, 187).trim() : null
                        record.nroFabricacao = line.length >= 204 ? line.substring(187, 204).trim() : null
                        if (line.length >= 212) {
                            record.dataInicial = ddmmaaaa(line.substring(204, 212))
                        }
                        if (line.length >= 220) {
                            record.dataFinal = ddmmaaaa(line.substring(212, 220))
                        }
                        if (line.length >= 232) {
                            const dtGer = line.substring(220, 228)
                            const hrGer = line.substring(228, 232)
                            record.dataHora = ddmmaaaahhmm(dtGer, hrGer)
                        }
                        break

                    // ── Tipo 2: Inclusão/Alteração da empresa ─────────────
                    // Pos 001-009 NSR | 010 Tipo="2"
                    // 011-018 Data da gravação DDMMAAAA (8)
                    // 019-022 Hora da gravação HHMM (4)
                    // 023     flag CNPJ(1)/CPF(2)
                    // 024-037 CNPJ ou CPF do empregador (14)
                    // 038-049 CEI (12)
                    // 050-199 Razão Social / Nome (150)
                    // 200-299 Local de prestação de serviços (100)
                    case '2':
                        if (line.length >= 22) {
                            const dtStr = line.substring(10, 18)  // pos 011-018
                            const hrStr = line.substring(18, 22)  // pos 019-022
                            record.dataHora = ddmmaaaahhmm(dtStr, hrStr)
                        } else {
                            record.erros.push('Tipo 2: linha com tamanho insuficiente para data/hora')
                        }
                        record.flagCNPJ = line.length >= 23 ? line.substring(22, 23) : null
                        record.empregadorCnpjCpf = line.length >= 37 ? line.substring(23, 37).trim() : null
                        record.cei = line.length >= 49 ? line.substring(37, 49).trim() : null
                        record.empregadorNome = line.length >= 199 ? line.substring(49, 199).trim() : null
                        record.local = line.length >= 299 ? line.substring(199, 299).trim() : null
                        break

                    // ── Tipo 3: Marcação de Ponto ──────────────────────────
                    // Pos 001-009 NSR | 010 Tipo="3"
                    // 011-018 Data da marcação DDMMAAAA (8)
                    // 019-022 Hora da marcação HHMM (4)
                    // 023-034 PIS do empregado (12) — 11 dígitos PIS, padded com zero à esquerda
                    // 035-038 CRC hex (4) — presente nas implementações reais de REP 1510
                    case '3':
                        if (line.length >= 22) {
                            const dtStr = line.substring(10, 18)  // pos 011-018
                            const hrStr = line.substring(18, 22)  // pos 019-022
                            record.dataHora = ddmmaaaahhmm(dtStr, hrStr)

                            if (!record.dataHora) {
                                record.erros.push('Tipo 3: data ou hora com valor inválido')
                            }
                        } else {
                            record.erros.push(`Tipo 3: linha com tamanho insuficiente (${line.length} chars, esperado ≥22)`)
                        }

                        if (line.length >= 34) {
                            const pisRaw = line.substring(22, 34) // pos 023-034 (12 chars)
                            record.pis = pisRaw.trim()
                            record.cpf = record.pis  // alias de compatibilidade
                        } else {
                            record.erros.push(`Tipo 3: campo PIS com tamanho insuficiente (${line.length} chars)`)
                        }

                        // CRC hex presente nos REPs reais (4 chars após o PIS)
                        if (line.length >= 38) record.crc = line.substring(34, 38)

                        record.evento = 'Marcacao'
                        break

                    // ── Tipo 4: Ajuste do Relógio do REP ──────────────────
                    // Pos 001-009 NSR | 010 Tipo="4"
                    // 011-018 Data antes do ajuste DDMMAAAA (8)
                    // 019-022 Hora antes do ajuste HHMM (4)
                    // 023-030 Data ajustada DDMMAAAA (8)
                    // 031-034 Hora ajustada HHMM (4)
                    case '4':
                        if (line.length >= 22) {
                            record.dataHora = ddmmaaaahhmm(line.substring(10, 18), line.substring(18, 22))
                        } else {
                            record.erros.push('Tipo 4: linha com tamanho insuficiente para data/hora antes do ajuste')
                        }
                        if (line.length >= 34) {
                            record.dataHoraAjuste = ddmmaaaahhmm(line.substring(22, 30), line.substring(30, 34))
                        }
                        break

                    // ── Tipo 5: Empregado (inclusão/alteração/exclusão) ────
                    // Pos 001-009 NSR | 010 Tipo="5"
                    // 011-018 Data da gravação DDMMAAAA (8)
                    // 019-022 Hora da gravação HHMM (4)
                    // 023     Tipo de operação: "I"=Inclusão, "A"=Alteração, "E"=Exclusão
                    // 024-035 PIS do empregado (12)
                    // 036-087 Nome do empregado (52)
                    // 088+    Campos adicionais do fabricante + CRC hex (últimos 4 chars)
                    case '5':
                        if (line.length >= 22) {
                            record.dataHora = ddmmaaaahhmm(line.substring(10, 18), line.substring(18, 22))
                        } else {
                            record.erros.push('Tipo 5: linha com tamanho insuficiente para data/hora')
                        }
                        record.operacao = line.length >= 23 ? line.substring(22, 23) : null
                        if (line.length >= 35) {
                            const pisRaw = line.substring(23, 35) // pos 024-035 (12 chars)
                            record.pis = pisRaw.trim()
                            record.cpf = record.pis  // alias de compatibilidade
                        }
                        record.nomeEmpregado = line.length >= 87 ? line.substring(35, 87).trim() : null
                        // CRC hex nos REPs reais (últimos 4 chars, após campos do fabricante)
                        if (line.length >= 91) record.crc = line.substring(line.length - 4)
                        break

                    default:
                        record.erros.push(`Tipo de registro desconhecido: "${tipo}"`)
                        break
                }
            } catch (err) {
                record.erros.push(`Falha no parse da linha: ${err.message}`)
            }

            records.push(record)
        }

        return records
    }

    return {
        parseLines
    }
}
