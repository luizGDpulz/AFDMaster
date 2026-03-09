import { defineStore } from 'pinia'

export const useAfdStore = defineStore('afd', {
    state: () => ({
        // '1510' or '671' or null
        portaria: null,

        // Array of parsed objects
        records: [],

        // Original raw file lines for comparison if needed
        rawLines: [],

        fileName: 'Nenhum arquivo',

        // Estado da UI
        activeTabName: '',

        // Cache estático de validações para alta performance (Evita Vue tracking freeze)
        validationSummary: {
            totalErros: 0,
            totalAvisos: 0,
            totalAlterados: 0,
            aggregatedErrors: {},
            aggregatedWarnings: {}
        },

        // App Preferences / Settings
        settings: {
            checkNsrSequential: true,
            checkOddMarks: true,
            reindexNsrExport: false,
            checkDuplicates: true,
            duplicateToleranceMinutes: 5
        },
        // Form Filters globais para cross-component routing
        filters: {
            search: '',
            status: null, // null | 'errors' | 'warnings'
            type: null,
            dateStart: '',
            dateEnd: ''
        }
    }),

    // getters (computed states) originais foram movidos para a função estática abaixo
    getters: {
        hasRecords: (state) => state.records.length > 0
    },

    // actions (methods to modify state)
    actions: {
        loadParsedRecords(records, portariaVersion, originalLines, fileName) {
            this.records = records
            this.portaria = portariaVersion
            this.rawLines = originalLines
            this.fileName = fileName
        },

        updateRecord(id, updatedFields) {
            const idx = this.records.findIndex(r => r.id === id)
            if (idx !== -1) {
                this.records[idx] = { ...this.records[idx], ...updatedFields, alterado: true }
            }
        },

        clearData() {
            this.records = []
            this.portaria = null
            this.rawLines = []
            this.fileName = 'Nenhum arquivo'
            this.validationSummary = {
                totalErros: 0, totalAvisos: 0, totalAlterados: 0,
                aggregatedErrors: {}, aggregatedWarnings: {}
            }
        },

        computeValidationSummary() {
            // Conta os totais e as agregações de forma cega em um for numérico veloz
            let erros = 0
            let avisos = 0
            let alterados = 0
            const aggErrs = {}
            const aggVw = {}

            const records = this.records
            const len = records.length
            for (let i = 0; i < len; i++) {
                const r = records[i]
                if (r.alterado) alterados++

                if (r.erros && r.erros.length > 0) {
                    erros++
                    for (let j = 0; j < r.erros.length; j++) {
                        const err = r.erros[j]
                        if (!aggErrs[err]) aggErrs[err] = 0
                        aggErrs[err]++
                    }
                }

                if (r.avisos && r.avisos.length > 0) {
                    avisos++
                    for (let j = 0; j < r.avisos.length; j++) {
                        const warnMsg = r.avisos[j].msg || r.avisos[j]
                        if (!aggVw[warnMsg]) aggVw[warnMsg] = 0
                        aggVw[warnMsg]++
                    }
                }
            }

            // Atualiza o cache do estado reativo num único set
            this.validationSummary = {
                totalErros: erros,
                totalAvisos: avisos,
                totalAlterados: alterados,
                aggregatedErrors: aggErrs,
                aggregatedWarnings: aggVw
            }
        },

        updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings }
        },

        setFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters }
        }
    }
})
