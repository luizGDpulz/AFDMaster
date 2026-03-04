/**
 * Parser para Portaria 1510/2009 (MTE)
 * O formato 1510 possui registros com tamanhos fixos.
 * Exemplo prático de Parsing básico das linhas principais.
 * O retorno deve ser um array de Registros unificados.
 */

export function useParser1510() {
    /**
     * Verifica se o arquivo parece ser formato 1510 
     * (Geralmente começa com 0000000001 e tem "1" na posição 10 indicando cabeçalho)
     */
    const detect1510 = (headerLine) => {
        if (!headerLine || headerLine.length < 10) return false
        return headerLine.substring(9, 10) === '1' // Tipo 1 = Cabeçalho no 1510
    }

    const parseLines = (lines) => {
        const records = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimEnd()
            if (!line) continue

            // O AFD 1510 usa os primeiros 9 dígitos para o NSR
            let nsr = null
            if (line.length >= 9) {
                nsr = parseInt(line.substring(0, 9), 10)
            }

            const tipo = line.length >= 10 ? line.substring(9, 10) : ''

            // Objeto base unificado
            const record = {
                id: i, // ID interno (linha do arquivo)
                tipo,
                nsr,
                cpf: null,
                pis: null,
                dataHora: null,
                evento: null, // "E", "S", etc, ou codigo especifico
                raw: line,
                alterado: false,
                erros: []
            }

            try {
                // REP Hardware Trailer Check (MTE 1510/671 standard)
                if (line.startsWith('999999999')) {
                    record.tipo = '9' // Força o tipo para o padrão visual
                    records.push(record)
                    return records // Interrompe a leitura ignorando lixo abaixo do trailer
                }

                switch (tipo) {
                    case '1': // Cabeçalho
                        if (line.length >= 21) {
                            // Data e Hora de geração: Posição 20-33 (AAAAMMDDHHMMSS) no 1510 original (ou em volta disso)
                            // Segundo a Portaria 1510 formato antigo:
                            // CNPJ/CPF Empregador: Pos 12-25
                            // Razao Social: Pos 36-185
                            record.empregadorCnpjCpf = line.substring(11, 25).trim()

                            // Extração da razão social (Tamanho 150)
                            if (line.length >= 185) {
                                record.empregadorNome = line.substring(35, 185).trim()
                            }

                            // Localizando data e hora no cabeçalho 1510: Variável baseada na posição do número REP, Data Início etc.
                            // Pos 203 a 210 = Data emissão (DDMMAAAA), 211 a 214 = Hora (HHMM)
                            if (line.length >= 214) {
                                const dtStr = line.substring(202, 210)
                                const hrStr = line.substring(210, 214)
                                const day = dtStr.substring(0, 2)
                                const mon = dtStr.substring(2, 4)
                                const yr = dtStr.substring(4, 8)
                                const hh = hrStr.substring(0, 2)
                                const mi = hrStr.substring(2, 4)
                                record.dataHora = `${yr}-${mon}-${day}T${hh}:${mi}:00`
                            }
                        }
                        break;
                    case '2': // Empregador
                        break;
                    case '3': // Registro de Marcação de Ponto
                        // Formato: NSR(9) Tipo(1) Data(8 - DDMMAAAA) Hora(4 - HHMM) PIS(11)
                        if (line.length >= 33) {
                            const dataStr = line.substring(10, 18) // DDMMAAAA
                            const horaStr = line.substring(18, 22) // HHMM
                            record.pis = line.substring(22, 33)

                            const day = dataStr.substring(0, 2)
                            const month = dataStr.substring(2, 4)
                            const year = dataStr.substring(4, 8)
                            const hour = horaStr.substring(0, 2)
                            const min = horaStr.substring(2, 4)

                            record.dataHora = `${year}-${month}-${day}T${hour}:${min}:00`
                            record.evento = 'Marcacao' // No 1510 originário n tem "E" e "S" na linha 3 de forma binária, é só marcação
                        } else {
                            record.erros.push('Linha tipo 3 com tamanho inferior ao esperado')
                        }
                        break;
                    case '4': // Ajuste de Relógio
                        break;
                    case '5': // Inclusão/Exclusão Funcionario
                        break;
                    default:
                        record.erros.push(`Tipo de registro desconhecido: ${tipo}`)
                        break;
                }
            } catch {
                record.erros.push('Erro ao interpretar posições da linha')
            }

            records.push(record)
        }

        return records
    }

    return {
        detect1510,
        parseLines
    }
}
