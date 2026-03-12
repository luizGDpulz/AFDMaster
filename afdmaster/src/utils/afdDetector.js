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
 * Utilitário para detectar o formato do arquivo AFD (Portaria 1510 vs 671)
 *
 * Estratégia principal:
 *   Busca a PRIMEIRA ocorrência do tipo de registro "3" (Marcação de Ponto)
 *   onde linha[9] === '3', e verifica linha[14] === '-'.
 *
 *   AFD 671:  NSR(9) + Tipo(1) + DH ISO (2024-06-21T...) → linha[14] = '-' (hífen da data ISO)
 *   AFD 1510: NSR(9) + Tipo(1) + DDMMAAAA + HHMM + PIS   → linha[14] = dígito numérico
 *
 * Fallback:
 *   Se o arquivo não contiver nenhuma linha tipo "3", usa a heurística
 *   anterior (verifica linha[1] — normalmente o cabeçalho não tem o hífen
 *   em [14], então retorna '1510' por padrão).
 */

export function detectAfdFormat(lines) {
    if (!lines || lines.length <= 1) {
        return '1510'; // arquivo vazio ou só cabeçalho → fallback
    }

    // ── Estratégia principal: primeira linha com tipo de registro "3" ──
    for (const line of lines) {
        if (!line || line.length < 15) continue;

        const tipo = line[9]; // coluna 010 (índice 9, base 0)

        if (tipo === '3') {
            // linha[14] é o 5º caractere do campo data/hora (início no índice 10)
            // AFD 671:  "2024-06-21T11:42:00-0300" → posição 4 da data = '-'
            // AFD 1510: "11022026"                 → posição 4 da data = dígito
            return line[14] === '-' ? '671' : '1510';
        }
    }

    // ── Fallback: nenhum tipo 3 encontrado — verifica linha 2 (índice 1) ──
    const fallbackLine = lines[1];
    if (fallbackLine && fallbackLine.length > 14 && fallbackLine[14] === '-') {
        return '671';
    }

    return '1510';
}
