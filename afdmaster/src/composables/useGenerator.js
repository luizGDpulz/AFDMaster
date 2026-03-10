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

                    const pisPadded = padZeros(rec.pis || rec.cpf || '0', 12)
                    linhaGerada = `${nsrPadded}${tipoPadded}${dtStr}${hrStr}${pisPadded}`

                } else {
                    // Outros tipos, como o gerador é complexo, no AFDMaster alteramos só 
                    // a Posição NSR do RAW original e mantemos o resto se for apenas reindex
                    if (rec.raw) {
                        const nsrPadded = padZeros(nsrToUse, 9)
                        linhaGerada = nsrPadded + rec.raw.substring(9)
                    } else {
                        // fallback se o RAW foi extirpado
                        linhaGerada = ''
                    }
                }
            } else {
                // Formato 671 (muito similar, mas cpf e com ISO dates)
                // No 3 é igual, mas cpf = 12 posicoes e data é YYYY-MM-DDTHH:mm:00-0300
                if (rec.tipo === '3' || rec.tipo === '7') {
                    const nsrPadded = padZeros(nsrToUse, 9)
                    const tipoPadded = rec.tipo

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

                    if (rec.tipo === '7') {
                        // REP-P punch: nsr(9) + 7 + dh(24) + cpf(12) + dh_utc(24) + timezone(3) + hash(64)
                        // Simplification since usually we just reindex, but if missing we fallback string:
                        const hash = ''.padStart(64, 'A')
                        linhaGerada = `${nsrPadded}${tipoPadded}${dhStr671}${cpfPadded}${dhStr671}050${hash}`
                    } else {
                        linhaGerada = `${nsrPadded}${tipoPadded}${dhStr671}${cpfPadded}`
                    }
                } else {
                    if (rec.raw) {
                        const nsrPadded = padZeros(nsrToUse, 9)
                        // Preserve original line but update NSR
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
