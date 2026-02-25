/**
 * Utilitário para detectar o formato do arquivo AFD (Portaria 1510 vs 671)
 */

export function detectAfdFormat(lines) {
    // Um arquivo AFD válido tem pelo menos Cabeçalho (linha 1) e Trailer (última linha)
    if (!lines || lines.length <= 2) {
        return '1510'; // Fallback padrão se não houver linhas de dados suficientes
    }

    let is671 = true;
    let hasDataLines = false;

    // Analisa apenas a linha 2 (índice 1) para ser instantâneo
    const line = lines[1];

    // Pula se por acaso a linha 2 for completamente vazia (improvável num AFD real)
    if (line !== undefined && line.trim() !== '') {
        hasDataLines = true;
        // No AFD 671, a coluna 15 (índice 14) dos registros de dados sempre contém um hífen '-'
        if (line.length <= 14 || line[14] !== '-') {
            is671 = false;
        }
    }

    if (hasDataLines && is671) {
        return '671';
    }

    // Se falhar na verificação do hífen, assume 1510
    return '1510';
}
