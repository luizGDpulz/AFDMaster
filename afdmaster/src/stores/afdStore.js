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
            onlyErrors: false,
            type: null,
            dateStart: '',
            dateEnd: ''
        }
    }),

    // getters (computed states)
    getters: {
        hasRecords: (state) => state.records.length > 0,

        totalErros: (state) => {
            let count = 0
            state.records.forEach(r => {
                if (r.erros && r.erros.length > 0) count++
            })
            return count
        },

        totalAlterados: (state) => {
            return state.records.filter(r => r.alterado).length
        }
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
        },

        updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings }
        },

        setFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters }
        }
    }
})
