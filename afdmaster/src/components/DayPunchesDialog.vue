<template>
    <q-card style="min-width: 440px; max-width: 500px; border-radius: 24px; max-height: 90vh; display: flex; flex-direction: column;" 
            class="soft-card shadow-12">
      <q-card-section class="row items-center q-pb-none">
        <div class="row items-center q-gutter-sm">
          <q-icon name="today" size="sm" color="primary" />
          <span class="text-h6 text-weight-bold">Marcações do Dia</span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('hide')" />
      </q-card-section>
      <q-separator class="q-mt-sm" />
      
      <q-card-section class="q-pa-md bg-grey-1" style="max-height: 60vh; overflow-y: auto;">
         <q-list separator class="bg-white rounded-borders shadow-1">
            <q-item v-for="(punch, idx) in punches" :key="idx" clickable v-ripple>
               <q-item-section avatar style="min-width: 100px; padding-right: 16px;">
                  <q-chip :color="punch.ordemPar && punch.ordemPar.startsWith('Entrada') ? 'green-2' : 'orange-2'" text-color="black" size="sm" class="text-weight-bold shadow-1" style="width: 85px; justify-content: center; margin: 0;">
                     {{ punch.ordemPar || '?' }}
                  </q-chip>
               </q-item-section>
               <q-item-section>
                  <q-item-label class="text-weight-bold text-mono">{{ punch.dataHora ? punch.dataHora.substring(11, 16) : '—' }}</q-item-label>
                  <q-item-label caption>{{ formatDate(punch.dataHora ? punch.dataHora.substring(0, 10) : '') }} <span v-if="punch.fusoHorario">GMT{{ punch.fusoHorario }}</span></q-item-label>
               </q-item-section>
               <q-item-section side>
                  <q-badge color="grey-3" text-color="grey-8">NSR: {{ punch.nsr }}</q-badge>
               </q-item-section>
            </q-item>
         </q-list>
      </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DayPunchesDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    punches: { type: Array, default: () => [] }
  },
  emits: ['hide'],
  setup() {
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '—'
      const [y, m, dd] = dateStr.split('-')
      return `${dd}/${m}/${y}`
    }

    return {
      formatDate
    }
  }
})
</script>

<style scoped>
.text-mono {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}
</style>
