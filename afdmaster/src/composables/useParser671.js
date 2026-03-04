/**
 * Parser para Portaria 671/2021 (MTE)
 * Layout baseado no manual oficial AFD_leiaute_convertido_v2.md
 *
 * Todos os campos usam posições 1-based no manual → convertidas para
 * substring(start-1, end) em JavaScript (índice base-0).
 *
 * Formato DH: AAAA-MM-ddThh:mm:00ZZZZZ  (24 chars)
 * Formato D:  AAAA-MM-dd                 (10 chars)
 */

export function useParser671() {

    const detect671 = (headerLine) => {
        if (!headerLine || headerLine.length < 10) return false
        return true
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Retorna a string DH ISO como está se válida, null caso contrário.
     * A string "AAAA-MM-ddThh:mm:00ZZZZZ" (24 chars) já é compatível com new Date().
     */
    const dhToISO = (dhStr) => {
        if (!dhStr) return null
        const trimmed = dhStr.trim()
        if (trimmed.length >= 20 && trimmed.includes('T')) return trimmed
        return null
    }

    // ── Parser principal ─────────────────────────────────────────────────────

    const parseLines = (lines) => {
        const records = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimEnd()
            if (!line) continue

            // NSR: posição 001-009 (9 chars)
            let nsr = null
            if (line.length >= 9) {
                nsr = parseInt(line.substring(0, 9), 10)
            }

            // Tipo: posição 010-010 (1 char)
            const tipo = line.length >= 10 ? line.substring(9, 10) : ''

            const record = {
                id: i,
                tipo,
                nsr,
                cpf: null,
                pis: null,
                dataHora: null,           // campo principal exibido na tabela
                fusoHorario: null,        // ZZZZZ extraído do DH
                crc: null,
                evento: null,
                raw: line,
                alterado: false,
                erros: []
            }

            try {
                // REP Hardware Trailer Check (MTE 1510/671 standard)
                if (line.startsWith('999999999')) {
                    record.tipo = '9' // Força o tipo para visualização

                    if (line.length >= 18) record.qtdTipo2 = parseInt(line.substring(9, 18), 10) || 0
                    if (line.length >= 27) record.qtdTipo3 = parseInt(line.substring(18, 27), 10) || 0
                    if (line.length >= 36) record.qtdTipo4 = parseInt(line.substring(27, 36), 10) || 0
                    if (line.length >= 45) record.qtdTipo5 = parseInt(line.substring(36, 45), 10) || 0
                    if (line.length >= 54) record.qtdTipo6 = parseInt(line.substring(45, 54), 10) || 0
                    if (line.length >= 63) record.qtdTipo7 = parseInt(line.substring(54, 63), 10) || 0

                    records.push(record)
                    return records // Corta a leitura para ignorar assinatura digital lixo no fim do arquivo
                }

                switch (tipo) {

                    // ── Tipo 1: Cabeçalho ─────────────────────────────────
                    // Pos 001-009 NSR | 010 Tipo | 011 flag CNPJ/CPF
                    // 012-025 CNPJ/CPF (14) | 026-039 CNO/CAEPF (14)
                    // 040-189 Razão Social (150) | 190-206 Nº fabricação (17)
                    // 207-216 Data inicial D (10) | 217-226 Data final D (10)
                    // 227-250 DH geração (24) | 251-253 "003"
                    // 254 flag fabricante | 255-268 CNPJ/CPF fab (14)
                    // 269-298 Modelo (30) | 299-302 CRC (4)
                    case '1':
                        // pos 011 – Flag CNPJ(1) / CPF(2) do empregador
                        record.flagCNPJ = line.substring(10, 11)
                        // pos 012-025 – CNPJ ou CPF do empregador (14 chars)
                        record.empregadorCnpjCpf = line.substring(11, 25).trim()
                        // pos 026-039 – CNO ou CAEPF (14 chars)
                        if (line.length >= 39) record.cnoCapef = line.substring(25, 39).trim()
                        // pos 040-189 – Razão social / nome do empregador (150 chars)
                        record.empregadorNome = line.substring(39, 189).trim()
                        // pos 190-206 – Número de fabricação REP-C / Nº acordo coletivo / Nº INPI (17 chars)
                        if (line.length >= 206) record.nroFabricacao = line.substring(189, 206).trim()
                        // pos 207-216 – Data inicial dos registros (10 chars, formato AAAA-MM-dd)
                        if (line.length >= 216) record.dataInicial = line.substring(206, 216).trim()
                        // pos 217-226 – Data final dos registros (10 chars, formato AAAA-MM-dd)
                        if (line.length >= 226) record.dataFinal = line.substring(216, 226).trim()
                        // pos 227-250 – Data e hora da geração (24 chars, DH)
                        if (line.length >= 250) {
                            const dh = line.substring(226, 250)
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                        }
                        // pos 251-253 – Campo fixo "003"
                        // pos 254 – Flag CNPJ(1) / CPF(2) do fabricante
                        if (line.length >= 254) record.flagFabricante = line.substring(253, 254)
                        // pos 255-268 – CNPJ ou CPF do fabricante/desenvolvedor (14 chars)
                        if (line.length >= 268) record.cnpjFabricante = line.substring(254, 268).trim()
                        // pos 269-298 – Modelo do REP-C (30 chars)
                        if (line.length >= 298) record.modelo = line.substring(268, 298).trim()
                        // pos 299-302 – CRC-16 (4 chars hexa)
                        if (line.length >= 302) record.crc = line.substring(298, 302)
                        break

                    // ── Tipo 2: Inclusão/Alteração Empresa ────────────────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH gravação (24) | 035-048 CPF responsável (14)
                    // 049 flag | 050-063 CNPJ/CPF emp (14) | 064-077 CNO/CAEPF (14)
                    // 078-227 Razão social (150) | 228-327 Local (100)
                    // 328-331 CRC (4)
                    case '2':
                        if (line.length >= 34) {
                            const dh = line.substring(10, 34)                        // pos 011-034
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                        }
                        if (line.length >= 48) record.cpf = line.substring(34, 48).trim()  // CPF responsável
                        if (line.length >= 49) record.flagCNPJ = line.substring(48, 49)    // flag CNPJ/CPF
                        if (line.length >= 63) record.empregadorCnpjCpf = line.substring(49, 63).trim() // pos 050-063
                        if (line.length >= 77) record.cnoCapef = line.substring(63, 77).trim() // pos 064-077
                        if (line.length >= 227) record.empregadorNome = line.substring(77, 227).trim() // pos 078-227
                        if (line.length >= 327) record.local = line.substring(227, 327).trim() // pos 228-327
                        if (line.length >= 331) record.crc = line.substring(327, 331)
                        break

                    // ── Tipo 3: Marcação REP-C / REP-A ────────────────────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH marcação (24) | 035-046 CPF empregado (12)
                    // 047-050 CRC (4)
                    case '3':
                        if (line.length >= 46) {
                            const dh = line.substring(10, 34)                        // pos 011-034
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                            record.cpf = line.substring(34, 46).trim()       // pos 035-046 (12 chars)
                            record.pis = record.cpf                          // alias para compatibilidade
                            record.evento = 'Marcacao'
                            if (line.length >= 50) record.crc = line.substring(46, 50)
                        } else {
                            record.erros.push(`Tipo 3 com tamanho insuficiente: ${line.length} chars (esperado ≥46)`)
                        }
                        break

                    // ── Tipo 4: Ajuste de Relógio ─────────────────────────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH antes ajuste (24) | 035-058 DH ajustada (24)
                    // 059-069 CPF responsável (11) | 070-073 CRC (4)
                    case '4':
                        if (line.length >= 58) {
                            const dhAntes = line.substring(10, 34)                 // pos 011-034
                            const dhAjuste = line.substring(34, 58)                 // pos 035-058
                            record.dataHora = dhToISO(dhAntes)
                            record.dataHoraAjuste = dhToISO(dhAjuste)
                            record.fusoHorario = dhAntes.length >= 24 ? dhAntes.substring(19) : null
                        }
                        if (line.length >= 69) record.cpf = line.substring(58, 69).trim()  // pos 059-069
                        if (line.length >= 73) record.crc = line.substring(69, 73)
                        break

                    // ── Tipo 5: Inclusão/Alteração/Exclusão Empregado ─────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH gravação (24) | 035 Operação I/A/E (1)
                    // 036-047 CPF empregado (12) | 048-099 Nome (52)
                    // 100-103 Demais dados (4) | 104-114 CPF responsável (11)
                    // 115-118 CRC (4)
                    case '5':
                        if (line.length >= 34) {
                            const dh = line.substring(10, 34)                        // pos 011-034
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                        }
                        if (line.length >= 35) record.operacao = line.substring(34, 35)           // 'I','A','E'
                        if (line.length >= 47) {
                            record.cpf = line.substring(35, 47).trim()                                  // pos 036-047 (12 chars)
                            record.pis = record.cpf
                        }
                        if (line.length >= 99) record.nomeEmpregado = line.substring(47, 99).trim()   // pos 048-099 (52 chars)
                        if (line.length >= 103) record.demaisDados = line.substring(99, 103).trim() // pos 100-103 (4 chars)
                        if (line.length >= 114) record.cpfResponsavel = line.substring(103, 114).trim()// pos 104-114 (11 chars)
                        if (line.length >= 118) record.crc = line.substring(114, 118)       // pos 115-118 (4 chars)
                        break

                    // ── Tipo 6: Eventos Sensíveis ─────────────────────────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH gravação (24) | 035-036 Tipo evento (2)
                    case '6':
                        if (line.length >= 34) {
                            const dh = line.substring(10, 34)
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                        }
                        if (line.length >= 36) record.tipoEvento = line.substring(34, 36).trim()
                        break

                    // ── Tipo 7: Marcação REP-P ────────────────────────────
                    // Pos 001-009 NSR | 010 Tipo
                    // 011-034 DH marcação (24) | 035-046 CPF empregado (12)
                    // 047-070 DH gravação (24) | 071-072 Identificador coletor (2)
                    // 073 Online/offline (1) | 074-137 SHA-256 (64)
                    case '7':
                        if (line.length >= 34) {
                            const dh = line.substring(10, 34)                        // pos 011-034
                            record.dataHora = dhToISO(dh)
                            record.fusoHorario = dh.length >= 24 ? dh.substring(19) : null
                        }
                        if (line.length >= 46) {
                            record.cpf = line.substring(34, 46).trim()               // pos 035-046 (12 chars)
                            record.pis = record.cpf
                            record.evento = 'Marcacao'
                        }
                        if (line.length >= 70) record.dataHoraGravacao = dhToISO(line.substring(46, 70))
                        if (line.length >= 72) record.idColetor = line.substring(70, 72).trim()
                        if (line.length >= 73) record.online = line.substring(72, 73) === '0' ? 'Online' : 'Offline'
                        if (line.length >= 137) record.hashSHA256 = line.substring(73, 137).trim()
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
        detect671,
        parseLines
    }
}
