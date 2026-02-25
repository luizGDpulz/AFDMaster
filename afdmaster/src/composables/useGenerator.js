/**
 * Gerador de Arquivo AFD - Portaria 1510 e 671
 */

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
        const { reindexNsr } = options

        let conteudoFinal = []
        let currentNsr = 1

        for (const rec of records) {
            // Usa a linha original caso não tenha sido alterada, para preservar 100% da integridade
            // dos dados originais que estavam corretos.
            if (!rec.alterado && !reindexNsr && rec.raw) {
                conteudoFinal.push(rec.raw)
                continue
            }

            const nsrToUse = reindexNsr ? currentNsr : rec.nsr
            let linhaGerada = ''

            if (portaria === '1510') {
                if (rec.tipo === '3') {
                    // NSR(9) + TIPO(1) + DATA(8) + HORA(4) + PIS(11)
                    const nsrPadded = padZeros(nsrToUse, 9)
                    const tipoPadded = '3'

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

                    const pisPadded = padZeros(rec.pis || rec.cpf || '0', 11)
                    linhaGerada = `${nsrPadded}${tipoPadded}${dtStr}${hrStr}${pisPadded}`

                } else {
                    // Outros tipos, como o gerador é complexo, no AFDMaster alteramos só 
                    // a Posição NSR do RAW original e mantemos o resto se for apenas reindex
                    if (rec.raw) {
                        const nsrPadded = padZeros(nsrToUse, 9)
                        linhaGerada = nsrPadded + rec.raw.substring(9)
                    } else {
                        linhaGerada = '' // fall safe (para fins de prototipo mantemos)
                    }
                }
            } else {
                // Formato 671 (muito similar, mas cpf)
                // No 3 é igual, mas cpf = 11 posicoes
                if (rec.tipo === '3') {
                    const nsrPadded = padZeros(nsrToUse, 9)
                    const tipoPadded = '3'

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

                    const cpfPadded = padZeros(rec.cpf || rec.pis || '0', 11)
                    linhaGerada = `${nsrPadded}${tipoPadded}${dtStr}${hrStr}${cpfPadded}`
                } else {
                    if (rec.raw) {
                        const nsrPadded = padZeros(nsrToUse, 9) // Pode haver formatos 671 (REP-P/A) com NSR diferente, ajustamos conforme demanda
                        linhaGerada = nsrPadded + rec.raw.substring(9)
                    }
                }
            }

            if (linhaGerada) {
                conteudoFinal.push(linhaGerada)
                currentNsr++
            }
        }

        return conteudoFinal.join('\r\n') + '\r\n' // CRLF exigido pelas portarias
    }

    return {
        generateFileContent
    }
}
