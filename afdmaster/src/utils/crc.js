/**
 * CRC-16/KERMIT (também chamado CRC-16 CCITT-TRUE)
 *
 * Padrão exigido pela Portaria 671/2021 (MTE) para os tipos de registro 1 a 5 do AFD.
 *
 * Referência do manual:
 *   "Para o AFD gerado pelo REP-A ou pelo REP-P, deve ser utilizado o padrão
 *    CRC-16 CCITT-TRUE (CRC-16/KERMIT).
 *    Por exemplo, os 9 caracteres '123456789' geram o CRC-16 de valor 0x2189."
 *
 * Parâmetros do algoritmo:
 *   Width   : 16
 *   Poly    : 0x1021
 *   Init    : 0x0000
 *   RefIn   : true
 *   RefOut  : true
 *   XorOut  : 0x0000
 *   Check   : 0x2189 (resultado para "123456789")
 */

/**
 * Calcula o CRC-16/KERMIT de uma string ASCII.
 * @param {string} str - Conteúdo para calcular o CRC (encode ISO-8859-1)
 * @returns {number} Valor inteiro do CRC (0 - 65535)
 */
export function crc16kermit(str) {
    let crc = 0x0000

    for (let i = 0; i < str.length; i++) {
        let byte = str.charCodeAt(i) & 0xff

        // Reflexão do byte de entrada (RefIn = true)
        byte = reflectByte(byte)

        for (let bit = 0; bit < 8; bit++) {
            const topBit = (crc >> 15) & 1
            crc = (crc << 1) & 0xffff
            if (byte & 0x80) {
                crc ^= 0x1021
            }
            if (topBit) {
                crc ^= 0x1021
            }
            byte = (byte << 1) & 0xff
        }
    }

    // Reflexão do CRC de saída (RefOut = true)
    crc = reflectCrc(crc)

    return crc
}

function reflectByte(b) {
    let reflected = 0
    for (let i = 0; i < 8; i++) {
        if (b & (1 << i)) {
            reflected |= 1 << (7 - i)
        }
    }
    return reflected
}

function reflectCrc(crc) {
    let reflected = 0
    for (let i = 0; i < 16; i++) {
        if (crc & (1 << i)) {
            reflected |= 1 << (15 - i)
        }
    }
    return reflected
}

/**
 * Retorna o CRC-16/KERMIT como string hexadecimal maiúscula com 4 chars,
 * conforme exigido pelo manual (ex: "2189").
 * @param {string} str
 * @returns {string}
 */
export function crc16kermitHex(str) {
    return crc16kermit(str).toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Calcula e adiciona o CRC no final de uma linha AFD 671 (sem CRC).
 * A linha deve conter todos os campos EXCETO os 4 chars finais de CRC.
 * @param {string} lineWithoutCrc
 * @returns {string} Linha completa com CRC
 */
export function appendCrc671(lineWithoutCrc) {
    const crcHex = crc16kermitHex(lineWithoutCrc)
    return lineWithoutCrc + crcHex
}

/**
 * Valida se o CRC de uma linha AFD 671 está correto.
 * Considera que os últimos 4 chars são o CRC.
 * @param {string} fullLine
 * @returns {boolean}
 */
export function validateCrc671(fullLine) {
    if (!fullLine || fullLine.length < 5) return false
    const content = fullLine.substring(0, fullLine.length - 4)
    const storedCrc = fullLine.substring(fullLine.length - 4).toUpperCase()
    const computed = crc16kermitHex(content)
    return computed === storedCrc
}
