<template>
  <div class="upload-container text-center q-pa-lg">
    <div 
      class="upload-area full-width soft-card q-pa-xl cursor-pointer"
      :class="{ 'bg-grey-3': isDragging, 'bg-grey-1': !isDragging }"
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
        <q-icon name="upload_file" size="64px" :color="isDragging ? 'primary' : 'grey-4'" />
        <div class="text-subtitle1 text-grey-7 q-mt-md">Nenhum arquivo selecionado</div>
        <div class="text-caption text-grey-5">Formatos suportados: Portaria 1510 e 671 (.txt)</div>
        <div class="text-caption text-primary q-mt-sm text-weight-bold">Clique aqui para abrir ou arraste o arquivo</div>
      </div>
    </div>

    <div v-else class="upload-list q-pa-md full-width">
       <q-item class="soft-card bg-grey-1 q-mb-md">
         <q-item-section avatar>
           <q-icon name="description" color="primary" size="32px"/>
         </q-item-section>
         <q-item-section class="text-left">
           <q-item-label class="text-weight-bold ellipsis">{{ selectedFile.name }}</q-item-label>
           <q-item-label caption>{{ (selectedFile.size / 1024).toFixed(2) }} KB</q-item-label>
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
}
.upload-area.bg-grey-3 {
  border-color: var(--qm-brand);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* Let click pass through to the parent div */
}
</style>
