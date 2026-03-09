# CRC-16 no AFD — Cálculo e Validação

## 1. O que é o CRC-16/KERMIT?

O **CRC-16/KERMIT** (também chamado de **CRC-16/CCITT-TRUE** ou **CRC-16/IBM-SDLC**) é o algoritmo de verificação de integridade exigido pela **Portaria MTE 671/2021** para os registros do AFD dos tipos **1, 2, 3, 4 e 5**.

Parâmetros do algoritmo:

| Parâmetro       | Valor      |
|-----------------|------------|
| Polinômio       | `0x1021`   |
| Valor inicial   | `0x0000`   |
| XOR final       | `0x0000`   |
| Reflect Input   | `true`     |
| Reflect Output  | `true`     |
| Nome canônico   | CRC-16/KERMIT |

> **Referência oficial (manual):** "Registros tipo '1' a '5' devem conter CRC-16 (CRC-16 CCITT-TRUE / KERMIT). Exemplo: '123456789' → 0x2189 → gravar '2189'."

---

## 2. Quais Registros Utilizam CRC?

| Tipo | Descrição                        | Posição CRC |
|------|----------------------------------|-------------|
| 1    | Cabeçalho                        | 299–302     |
| 2    | Inclusão/Alteração Empresa       | 328–331     |
| 3    | Marcação REP-C / REP-A           | 047–050     |
| 4    | Ajuste de Relógio                | 070–073     |
| 5    | Inclusão/Alteração/Excl. Empregado | 115–118   |

O CRC é gravado como **4 caracteres hexadecimais em maiúsculas** (sem o prefixo `0x`). Ex.: `2189`, `4948`.

> O **Tipo 7** (Marcação REP-P) usa **SHA-256**, não CRC-16.

---

## 3. Base de Cálculo — Quais Bytes Entram no CRC?

O CRC é calculado sobre **todos os caracteres ASCII da linha, exceto os últimos 4** (que são o próprio CRC).

Para uma linha de `N` caracteres:

```
CRC = crc16_kermit( linha[0 .. N-5] )
```

Ou seja, tudo antes do campo CRC. A quebra de linha (`\r\n`) **não** entra no cálculo.

### Exemplo com Cabeçalho (Tipo 1)

A linha tem 302 chars. O CRC está nos últimos 4 (`[298..301]`).

```
base_de_calculo = linha[0..297]  (298 bytes)
crc_calculado   = crc16_kermit(base_de_calculo)
crc_armazenado  = linha[298..301]   // ex: "4948"
```

---

## 4. O Algoritmo Passo a Passo

O CRC-16/KERMIT processa cada byte de forma refletida (LSB first):

```javascript
function crc16Kermit(data) {
    let crc = 0x0000
    for (let i = 0; i < data.length; i++) {
        let byte = data.charCodeAt(i)
        // Reflect do byte de entrada (8 bits)
        byte = reflectByte(byte)
        crc ^= byte << 8
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021
            } else {
                crc <<= 1
            }
            crc &= 0xFFFF
        }
    }
    // Reflect do resultado (16 bits)
    return reflect16(crc) ^ 0x0000
}

function reflectByte(b) {
    let r = 0
    for (let i = 0; i < 8; i++) {
        if (b & (1 << i)) r |= (1 << (7 - i))
    }
    return r
}

function reflect16(val) {
    let r = 0
    for (let i = 0; i < 16; i++) {
        if (val & (1 << i)) r |= (1 << (15 - i))
    }
    return r
}
```

### Versão Simplificada (sem reflect manual)

Na prática, a reflexão pode ser absorvida usando o polinômio refletido `0x8408` e processando bit a bit de forma invertida:

```javascript
function crc16Kermit(data) {
    let crc = 0x0000
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i)
        for (let j = 0; j < 8; j++) {
            if (crc & 0x0001) {
                crc = (crc >>> 1) ^ 0x8408  // poly refletido de 0x1021
            } else {
                crc >>>= 1
            }
        }
    }
    return crc
}
```

Esta segunda versão é mais eficiente e produz o mesmo resultado.

---

## 5. Beispiel / Exemplo Canônico

```
Entrada: "123456789"  (9 bytes ASCII)
CRC-16/KERMIT = 0x2189
Gravado no AFD: "2189"
```

Verificação em JavaScript:

```javascript
const resultado = crc16Kermit("123456789")
console.log(resultado.toString(16).toUpperCase().padStart(4, '0'))
// → "2189" ✅
```

---

## 6. Exemplo Real com AFD 671

Usando a linha de cabeçalho do arquivo `ExemploAFD671.txt`:

```
Linha completa (302 chars):
000000000113806339200010000000000000000L JIL INCUBADORA LTDA ... 00014003750331604...iDClass Bio Prox              4948

Campos-chave da linha:
  - CNPJ empregador: 38063392000100 → 38.063.392/0001-00
  - Razão social:    L JIL INCUBADORA LTDA
  - Nº fabricação:   00014003750331604
  - Data inicial:    2001-01-01
  - Data final:      2026-02-23
  - DH geração:      2026-02-23T10:06:00-0300
  - CNPJ fabricante: 08238299000129 → 08.238.299/0001-29
  - Modelo:          iDClass Bio Prox
  - CRC armazenado:  4948

Base de cálculo = linha[0..297]  (298 primeiros caracteres)
CRC calculado   = crc16Kermit(base) → deve resultar em 0x4948
```

Para validar:

```javascript
const linha = /* conteúdo da linha sem \r\n */
const base = linha.substring(0, linha.length - 4)
const calculado = crc16Kermit(base).toString(16).toUpperCase().padStart(4, '0')
const armazenado = linha.substring(linha.length - 4)
const valido = calculado === armazenado
console.log(`CRC calculado: ${calculado} | Armazenado: ${armazenado} | Válido: ${valido}`)
```

---

## 7. Validação em Lote

Para validar todos os registros de um arquivo AFD 671:

```javascript
import { crc16Kermit } from './crc16.js'

// Tipos que possuem CRC
const TIPOS_COM_CRC = new Set(['1', '2', '3', '4', '5'])

function validarCrcLinhas(lines) {
    return lines.map((line, idx) => {
        const tipo = line.length >= 10 ? line[9] : '?'
        if (!TIPOS_COM_CRC.has(tipo)) return { idx, tipo, valido: null }

        const base = line.substring(0, line.length - 4)
        const armazenado = line.substring(line.length - 4).toUpperCase()
        const calculado = crc16Kermit(base).toString(16).toUpperCase().padStart(4, '0')

        return {
            idx,
            nsr: line.substring(0, 9),
            tipo,
            calculado,
            armazenado,
            valido: calculado === armazenado
        }
    })
}
```

---

## 8. Implementação de Referência (crc16.js)

```javascript
/**
 * CRC-16/KERMIT (CCITT-TRUE)
 * Poly refletido: 0x8408 (equivale ao polinômio 0x1021 com reflect in/out = true)
 * Init: 0x0000 | XorOut: 0x0000
 *
 * @param {string} data - String ASCII (a linha do AFD sem os últimos 4 chars)
 * @returns {number} CRC de 16 bits (0-65535)
 */
export function crc16Kermit(data) {
    let crc = 0x0000
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i)
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? (crc >>> 1) ^ 0x8408 : crc >>> 1
        }
    }
    return crc & 0xFFFF
}
```

---

## 9. Referências

- Manual oficial: `AFD_leiaute_convertido_v2.md` (raiz do projeto)
- Portaria MTE 671/2021
- [CRC Catalogue — CRC-16/KERMIT](https://crccalc.com/) — parâmetros para verificação online
- [Wikipedia — CRC computation](https://en.wikipedia.org/wiki/Cyclic_redundancy_check)
