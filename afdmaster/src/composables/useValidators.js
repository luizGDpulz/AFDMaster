export function useValidators() {
    /**
     * Revalida um array inteiro de registros (usado na carga do arquivo).
     */
    const validateBulk = (records, portaria, checkNsrSequential = true) => {
        let lastNsr = 0
        let lastDateByEmploee = {} // para verificar cronologia
        // Config limit de data
        const minDate = new Date('1900-01-01T00:00:00')
        const maxDate = new Date('2029-01-01T00:00:00')

        // Rastreia duplicatas { cpf_dataHora_tipo : true }
        const hashDuplicatas = {}

        // Rastreia eventos em par (Entrada/Saida)
        const paresEmploee = {}

        records.forEach(rec => {
            rec.erros = [] // zera

            // Validação de NSR
            if (!rec.nsr || isNaN(rec.nsr)) {
                rec.erros.push('NSR não numérico ou inexistente')
            } else {
                if (checkNsrSequential && rec.tipo !== '1') {
                    if (rec.nsr <= lastNsr) {
                        rec.erros.push('NSR fora de ordem ou duplicado')
                    }
                    lastNsr = rec.nsr
                }
            }

            // Validação Data/Hora
            if (rec.dataHora) {
                const dt = new Date(rec.dataHora)
                if (isNaN(dt.getTime())) {
                    rec.erros.push('Data ou hora inválida')
                } else if (dt < minDate || dt > maxDate) {
                    rec.erros.push('Data fora do limite permitido (1900 a 2029)')
                }

                // Validação Cronológica por funcionário (só marcacoes)
                if (rec.tipo === '3' && (rec.cpf || rec.pis)) {
                    const empId = rec.cpf || rec.pis
                    if (lastDateByEmploee[empId]) {
                        if (dt < lastDateByEmploee[empId]) {
                            rec.erros.push('Marcação fora de ordem cronológica para este funcionário')
                        }
                    }
                    lastDateByEmploee[empId] = dt

                    // Pares
                    if (!paresEmploee[empId]) paresEmploee[empId] = []
                    paresEmploee[empId].push(rec)
                }
            }

            // Validações de duplicação
            if (rec.tipo === '3' && rec.dataHora) {
                const empId = rec.cpf || rec.pis
                const hash = `${empId}_${rec.dataHora}_${rec.tipo}`
                if (hashDuplicatas[hash]) {
                    rec.erros.push('Possível marcação duplicada identificada')
                }
                hashDuplicatas[hash] = true
            }

            // Validação CPF / PIS (Tamanho e numérico)
            if (rec.cpf && (rec.cpf.length !== 11 || isNaN(rec.cpf))) {
                rec.erros.push('Aviso: CPF parece inválido ou tamanho incorreto')
            }
            if (rec.pis && (rec.pis.length !== 11 || isNaN(rec.pis))) {
                rec.erros.push('Aviso: PIS parece inválido ou tamanho incorreto')
            }
        })

        // Checagem de ímpares (entradas sem saídas lógicas em um dia) - Muito básico
        // Pode se basear no número de batidas no mesmo dia (ímpar indica que esqueceu de bater)
        for (const emp in paresEmploee) {
            const batidas = paresEmploee[emp]
            // Agrupa por dia "YYYY-MM-DD"
            const porDia = {}
            batidas.forEach(b => {
                const bDate = b.dataHora.substring(0, 10)
                if (!porDia[bDate]) porDia[bDate] = []
                porDia[bDate].push(b)
            })

            // Verifica ímpar
            for (const d in porDia) {
                if (porDia[d].length % 2 !== 0) {
                    // Marca warning no último evento do dia
                    const ultimoEvento = porDia[d][porDia[d].length - 1]
                    ultimoEvento.erros.push('Aviso: Número ímpar de marcações neste dia. Pode indicar falha na batida.')
                }
            }
        }
    }

    /**
     * Valida uma única alteração de registro no Modal
     */
    const validateSingle = (record) => {
        const errs = []

        // NSR
        if (isNaN(record.nsr) || record.nsr <= 0) {
            errs.push('NSR deve ser um número válido')
        }

        if (record.tipo === '3') {
            if (!record.dataHora) {
                errs.push('Data/Hora é obrigatório')
            } else {
                const dt = new Date(record.dataHora)
                if (isNaN(dt.getTime())) {
                    errs.push('Data/Hora tem formato inválido')
                }
            }
        }

        return errs
    }

    return {
        validateBulk,
        validateSingle
    }
}
