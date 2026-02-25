/**
 * Parser para Portaria 671/2021 (MTE)
 * Formatos mais novos, como o REP-A, REP-C e REP-P.
 */

export function useParser671() {

    /**
     * O Cabeçalho 671 geralmente usa mais dígitos para o NSR inicial ou o tipo de registro muda.
     * Muitas vezes é muito similar ao 1510, mas para o REP-P ou REP-A os dados do tipo 3 têm CPF em vez de PIS.
     */
    const detect671 = (headerLine) => {
        // Para fins do AFDMaster, se não for 1510 exato (ou se o header disser "REP-A/P/C"), caímos aqui.
        // Esta heurística pode ser melhorada se passarmos a primeira linha e olharmos os campos específicos do REP-C/P.
        if (!headerLine || headerLine.length < 10) return false
        // Verifica alguma flag no cabeçalho ou simplesmente assumimos true se 1510 falhar.
        return true
    }

    const parseLines = (lines) => {
        const records = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimEnd()
            if (!line) continue

            // No AFD 671 (REP-C, que é retrocompativel), o NSR também tem 9 posições na maioria das linhas.
            let nsr = null
            if (line.length >= 9) {
                nsr = parseInt(line.substring(0, 9), 10)
            }

            const tipo = line.length >= 10 ? line.substring(9, 10) : ''

            const record = {
                id: i,
                tipo,
                nsr,
                cpf: null,
                pis: null,
                dataHora: null,
                evento: null,
                raw: line,
                alterado: false,
                erros: []
            }

            try {
                switch (tipo) {
                    case '1': // Cabeçalho (Tamanho 302 + CRLF)
                        if (line.length >= 250) {
                            record.dataHora = line.substring(226, 250) // Posição 227-250 (DH: AAAA-MM-ddThh:mm:00ZZZZZ)

                            // Identificador do Empregador (CNPJ/CPF) - Pos 12-25 (Tamanho 14)
                            record.empregadorCnpjCpf = line.substring(11, 25).trim()

                            // Razão Social - Pos 40-189 (Tamanho 150)
                            record.empregadorNome = line.substring(39, 189).trim()

                            if (line.length >= 302) record.crc = line.substring(298, 302) // Posição 299-302
                        }
                        break;
                    case '2': // Empregador
                        break;
                    case '3': // Marcação de Ponto
                        // Pela 671 (REP-P / REP-A), temos CPF em vez de PIS na posição do trabalhador.
                        // Estrutura REP-P / REP-A Tipo 3: NSR(9) Tipo(1) Data(8) Hora(4) CPF(11)
                        if (line.length >= 33) {
                            const dataStr = line.substring(10, 18)
                            const horaStr = line.substring(18, 22)

                            // No 671 (REP-A/P) geralmente é o CPF
                            record.cpf = line.substring(22, 33)
                            // E para compatibilidade
                            record.pis = line.substring(22, 33)

                            const day = dataStr.substring(0, 2)
                            const month = dataStr.substring(2, 4)
                            const year = dataStr.substring(4, 8)
                            const hour = horaStr.substring(0, 2)
                            const min = horaStr.substring(2, 4)

                            record.dataHora = `${year}-${month}-${day}T${hour}:${min}:00`
                            record.evento = 'Marcacao'
                        } else {
                            record.erros.push('Linha tipo 3 com tamanho curto (Portaria 671)')
                        }
                        break;
                    case '4':
                        break;
                    case '5':
                        break;
                    default:
                        if (tipo !== '9') {
                            record.erros.push(`Tipo desconhecido: ${tipo}`)
                        }
                        break;
                }
            } catch {
                record.erros.push('Falha no parse da linha')
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
