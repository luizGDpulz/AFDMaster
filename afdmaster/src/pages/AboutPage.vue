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
  <q-page class="fade-in q-px-lg q-pt-sm q-pb-xs column flex-center">
    
    <div class="about-container text-center">
        <q-avatar size="140px" square class="q-mb-md">
           <img :src="store.isDark ? './app-logo-dark.svg' : './app-logo.png'" alt="Logo AFDMaster" />
        </q-avatar>

       <div class="text-h4 text-weight-bold text-primary q-mb-sm">AFDMaster</div>
       <div class="text-subtitle1 text-grey-7 q-mb-lg">
          Ferramenta avançada para validação e manutenção de Arquivos Fonte de Dados (AFD).
       </div>

       <!-- Card Demo Mode (só aparece quando compilado com DEMO_MODE=true) -->
       <q-card v-if="isDemo" class="soft-card q-mb-lg demo-about-card text-left">
          <q-card-section class="row items-center no-wrap q-pb-xs">
            <q-icon name="science" size="28px" color="orange" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold" style="color:#e65100">Ambiente de Demonstração</div>
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <p class="text-body2 text-grey-8 q-mb-sm">
              Você está acessando uma instância pública do AFDMaster compilada em <strong>modo demo</strong>, 
              hospedada como projeto de portfólio. Por isso, algumas funcionalidades estão intencionalmente 
              limitadas para não gerar tráfego desnecessário no servidor.
            </p>
            <q-list dense class="q-mb-sm">
              <q-item dense class="q-pa-none">
                <q-item-section avatar style="min-width:28px">
                  <q-icon name="block" color="negative" size="16px" />
                </q-item-section>
                <q-item-section class="text-caption text-grey-7">
                  Importão livre desabilitada — apenas arquivos de exemplo pré-carregados
                </q-item-section>
              </q-item>
              <q-item dense class="q-pa-none">
                <q-item-section avatar style="min-width:28px">
                  <q-icon name="block" color="negative" size="16px" />
                </q-item-section>
                <q-item-section class="text-caption text-grey-7">
                  Gerador limitado a 1 funcionário, 1 dia e documento fixo
                </q-item-section>
              </q-item>
              <q-item dense class="q-pa-none">
                <q-item-section avatar style="min-width:28px">
                  <q-icon name="check_circle" color="positive" size="16px" />
                </q-item-section>
                <q-item-section class="text-caption text-grey-7">
                  Análise, validação e documentação funcionam normalmente
                </q-item-section>
              </q-item>
            </q-list>
            <p class="text-caption text-grey-6 q-mb-xs">
              Quer usar sem limitações? O projeto é open-source — faça seu próprio deploy a partir do repositório.
            </p>
            <q-btn
              flat
              dense
              color="primary"
              icon="code"
              label="Repositório no GitHub"
              href="https://github.com/luizGDpulz/AFDMaster"
              target="_blank"
              size="sm"
            />
          </q-card-section>
       </q-card>

       <q-card class="soft-card q-mb-xl text-center">
          <q-card-section>
             <div class="text-h6 q-mb-md">Sobre o Desenvolvedor</div>
             <p class="text-body1 text-grey-8">
                Este projeto foi desenvolvido e idealizado por <strong>Luiz Gustavo Dias Pulz</strong> para solucionar o gargalo no atendimento técnico provocado por painéis lentos e desorganizados. A ferramenta roda inteiramente no cliente, preservando a segurança e o sigilo de dados de batidas (LGPD).
             </p>
          </q-card-section>
          
          <q-separator inset />
          
          <q-card-section class="q-pt-md">
             <div class="col q-gutter-md justify-center">
                <q-btn 
                  flat 
                  color="primary" 
                  icon="email" 
                  label="Contato por E-mail"
                  href="mailto:luizgustavodiaspulz@gmail.com"
                  target="_blank"
               />
               <q-btn 
                  flat 
                  color="grey-9" 
                  icon="code" 
                  label="GitHub do Projeto"
                  href="https://github.com/luizGDpulz/AFDMaster"
                  target="_blank"
               />
               <q-btn 
                  flat 
                  color="black" 
                  icon="person" 
                  label="Meu Perfil no GitHub"
                  href="https://github.com/luizGDpulz"
                  target="_blank"
               />
             </div>
          </q-card-section>
       </q-card>

       <div class="text-caption text-grey-5">
          Versão 1.0.0 &copy; {{ new Date().getFullYear() }}<br>
          Desenvolvido com Vue 3, Quasar Framework e Pinia.
       </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useAfdStore } from 'src/stores/afdStore'

const IS_DEMO = process.env.DEMO_MODE === 'true'

export default defineComponent({
  name: 'AboutPage',
  setup() {
    const store = useAfdStore()
    return { store, isDemo: IS_DEMO }
  }
})
</script>

<style scoped>
.about-container {
   max-width: 600px;
   width: 100%;
   margin-top: -5vh; /* Levanta um pouco em relacao ao centro cirurgico */
}

.demo-about-card {
  border: 1px solid rgba(245, 127, 23, 0.35) !important;
  background: rgba(245, 127, 23, 0.05) !important;
}
</style>
