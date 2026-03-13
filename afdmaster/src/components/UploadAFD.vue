<!--
  Copyright (C) 2026 Luiz Gustavo Dias Pulz
  SPDX-License-Identifier: GPL-3.0-or-later

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see https://www.gnu.org/licenses/.
-->

<template>
  <div class="upload-container text-center q-pa-lg">

    <!-- =========================================================
         MODO DEMO: só arquivos de exemplo
         ========================================================= -->
    <template v-if="isDemoMode">
      <div class="soft-card q-pa-lg full-width">
        <q-icon name="science" size="48px" color="orange" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm q-mb-xs">Modo Demonstração</div>
        <div class="text-caption text-grey-6 q-mb-lg">
          Neste ambiente apenas os arquivos de exemplo abaixo podem ser carregados.
        </div>
        <div class="row q-gutter-md justify-center">
          <q-btn
            icon="description"
            label="Exemplo Portaria 671"
            color="primary"
            unelevated
            class="soft-btn"
            :loading="loadingDemo === '671'"
            @click="loadDemoFile('671')"
          />
          <q-btn
            icon="description"
            label="Exemplo Portaria 1510"
            color="primary"
            unelevated
            class="soft-btn"
            :loading="loadingDemo === '1510'"
            @click="loadDemoFile('1510')"
          />
        </div>
      </div>
    </template>

    <!-- =========================================================
         MODO NORMAL: picker / drag-and-drop
         ========================================================= -->
    <template v-else>
    <div 
      class="upload-area full-width soft-card q-pa-xl cursor-pointer"
      :class="{ 'dragging': isDragging }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
      v-if="!selectedFile"
    >
      <input 
        type="file" 
        ref="fileInputRef" 
        class="hidden" 
        accept=".txt" 
        @change="onFileSelected" 
      />
      <div class="empty-state">
        <q-icon name="upload_file" size="64px" :color="isDragging ? 'primary' : 'grey-6'" />
        <div class="text-subtitle1 text-grey-6 q-mt-md">Nenhum arquivo selecionado</div>
        <div class="text-caption text-grey-5">Formatos suportados: Portaria 1510 e 671 (.txt)</div>
        <div class="text-caption text-primary q-mt-sm text-weight-bold">Clique aqui para abrir ou arraste o arquivo</div>
      </div>
    </div>

    <div v-else class="upload-list q-pa-md full-width">
       <q-item class="soft-card q-mb-md">
         <q-item-section avatar>
           <q-icon name="description" color="primary" size="32px"/>
         </q-item-section>
         <q-item-section class="text-left">
           <q-item-label class="text-weight-bold ellipsis">{{ selectedFile.name }}</q-item-label>
           <q-item-label caption class="text-grey-6">
             {{ (selectedFile.size / 1024).toFixed(2) }} KB
           </q-item-label>
         </q-item-section>
         <q-item-section side>
           <q-btn icon="close" flat round dense color="negative" @click="clearFile" :disable="isProcessing || isFinished" />
         </q-item-section>
       </q-item>
       
       <q-btn 
           :label="isFinished ? 'Leitura Concluída!' : 'Processar Arquivo'" 
           :color="isFinished ? 'positive' : 'primary'" 
           @click="processFile" 
           unelevated 
           class="soft-btn full-width" 
           size="md"
           :loading="isProcessing" 
           :icon="isFinished ? 'check_circle' : 'play_arrow'"
           :disable="isFinished"
       />
    </div>
    </template>

  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAfdStore } from 'src/stores/afdStore'
import { useParser1510 } from 'src/composables/useParser1510'
import { useParser671 } from 'src/composables/useParser671'
import { useValidators } from 'src/composables/useValidators'
import { detectAfdFormat } from 'src/utils/afdDetector'

const DEMO_MODE = process.env.DEMO_MODE === 'true'

export default defineComponent({
  name: 'UploadAFD',
  emits: ['file-processing', 'file-processed'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const store = useAfdStore()
    
    const parser1510 = useParser1510()
    const parser671 = useParser671()
    const validators = useValidators()

    const isProcessing = ref(false)
    const isFinished = ref(false)
    const isDragging = ref(false)
    const selectedFile = ref(null)
    const fileInputRef = ref(null)
    const isDemoMode = ref(DEMO_MODE)
    const loadingDemo = ref(null)

    const triggerFileInput = () => {
       if (fileInputRef.value) {
           fileInputRef.value.click()
       }
    }

    const onFileSelected = (event) => {
      const files = event.target.files
      if (files && files.length > 0) {
         handleFile(files[0])
      }
    }

    const onDragOver = () => {
       isDragging.value = true
    }

    const onDragLeave = () => {
       isDragging.value = false
    }

    const onDrop = (event) => {
       isDragging.value = false
       const files = event.dataTransfer.files
       if (files && files.length > 0) {
          handleFile(files[0])
       }
    }
    
    const handleFile = (file) => {
        if (!file.name.toLowerCase().endsWith('.txt')) {
             $q.notify({ type: 'negative', message: 'Selecione apenas arquivos .txt' })
             return
        }
        selectedFile.value = file
        isFinished.value = false
    }
    
    const clearFile = () => {
        selectedFile.value = null
        isFinished.value = false
        if (fileInputRef.value) fileInputRef.value.value = ''
    }

    // -----------------------------------------------------------------
    // Demo mode: fetch example file from /examples/ and parse it
    // -----------------------------------------------------------------
    const loadDemoFile = async (type) => {
      const url = type === '671'
        ? '/examples/exemplo_671.txt'
        : '/examples/exemplo_1510.txt'
      const fileName = type === '671' ? 'exemplo_671.txt' : 'exemplo_1510.txt'

      loadingDemo.value = type
      emit('file-processing')
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const content = await response.text()
        parseContent(content, fileName)
      } catch (err) {
        $q.notify({ type: 'negative', message: 'Erro ao carregar arquivo de exemplo: ' + err.message })
      } finally {
        loadingDemo.value = null
      }
    }

    const parseContent = (content, fileName) => {
      const lines = content.split(/\r?\n/)
      if (lines.length === 0) {
        $q.notify({ type: 'negative', message: 'O arquivo está vazio.' })
        isProcessing.value = false
        return
      }

      let portaria = 'Desconhecida'
      let records = []
      
      try {
        portaria = detectAfdFormat(lines)
        
        if (portaria === '1510') {
          records = parser1510.parseLines(lines)
        } else if (portaria === '671') {
          records = parser671.parseLines(lines)
        } else {
          throw new Error('Formato de arquivo não reconhecido pelas portarias suportadas.')
        }

        // Validação em Bulk
        validators.validateBulk(records, portaria, store.settings)

        // Salva na Store inicial para que a agregação possa iterar
        store.loadParsedRecords(records, portaria, lines, fileName)
        
        // Agora calcula e slva os resumos cegos
        store.computeValidationSummary()
        
        $q.notify({ 
          type: 'positive', 
          message: `Arquivo processado com sucesso! Portaria detectada: ${portaria} com ${records.length} registros.` 
        })
        
        isProcessing.value = false
        isFinished.value = true
        
        // Mantém a mensagem de sucesso visível por 800ms antes de emitir a conclusão
        setTimeout(() => {
           emit('file-processed')
           // Limpa o arquivo *depois* do modal fechar
           setTimeout(() => {
              clearFile()
           }, 400)
        }, 800)
        
      } catch (err) {
        isProcessing.value = false
        $q.notify({ type: 'negative', message: 'Erro ao processar arquivo: ' + err.message })
      }
    }

    const processFile = () => {
      if (!selectedFile.value) return
      
      emit('file-processing')
      isProcessing.value = true
      isFinished.value = false
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target.result
        // Quebra assíncrona p/ permitir render do spinner antes de travar no JS pesado
        setTimeout(() => parseContent(content, selectedFile.value.name), 50)
      }
      
      reader.onerror = () => {
         $q.notify({ type: 'negative', message: 'Erro ao ler o arquivo no navegador.' })
         isProcessing.value = false
      }

      // FileReader.readAsText() é assíncrono e dispara `onload` SOMENTE após
      // o arquivo inteiro ter sido lido (EOF garantido pelo browser).
      // O setTimeout(50ms) abaixo apenas libera o event loop para renderizar o
      // spinner antes do JS pesado de parsing travar a thread.
      reader.readAsText(selectedFile.value)
    }

    return {
      isProcessing,
      isFinished,
      isDragging,
      selectedFile,
      fileInputRef,
      isDemoMode,
      loadingDemo,
      loadDemoFile,
      triggerFileInput,
      onFileSelected,
      onDragOver,
      onDragLeave,
      onDrop,
      clearFile,
      processFile
    }
  }
})
</script>

<style scoped>
.upload-area {
  transition: background-color 0.2s ease;
  border: 2px dashed transparent;
  background-color: var(--qm-surface);
}
.upload-area.dragging {
  border-color: var(--qm-primary);
  background-color: var(--qm-hover-bg, rgba(0,0,0,0.05));
}
[data-theme="dark"] .upload-area.dragging {
  background-color: rgba(255,255,255,0.05);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Let click pass through to the parent div */
}
</style>
