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

export default defineComponent({
  name: 'AboutPage',
  setup() {
    const store = useAfdStore()
    return { store }
  }
})
</script>

<style scoped>
.about-container {
   max-width: 600px;
   width: 100%;
   margin-top: -5vh; /* Levanta um pouco em relacao ao centro cirurgico */
}
</style>
