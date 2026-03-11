<div align="center">
  <img src=".\afdmaster\src\assets\app-logo.png" width="180" alt="AFDMaster Logo" />
  <h1>⌚ AFDMaster</h1>
  <p><b>Análise, Edição, Validação e Síntese de Arquivos AFD (Relógios de Ponto)</b></p>
  
  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js" />
    <img src="https://img.shields.io/badge/Quasar-2.x-1976D2?style=for-the-badge&logo=quasar&logoColor=white" alt="Quasar" />
    <img src="https://img.shields.io/badge/Vite-Ready-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Pinia-State-F6D365?style=for-the-badge&logo=vue.js&logoColor=white" alt="Pinia" />
  </p>
</div>

---

## 📖 Visão Geral

O **AFDMaster** é uma aplicação web moderna, desenvolvida para destrinchar e manipular Arquivos Fonte de Dados (AFD) originados de Relógios Eletrônicos de Ponto (REP). Ele foi projetado para analistas de RH, TI e suporte técnico que lidam diariamente com as complexidades das **Portarias 1510/2009 e 671/2021 do MTE**.

O aplicativo rodando 100% no navegador (Client-Side) consegue processar arquivos incrivelmente grandes (megabytes de TXT) em segundos, mapeando quebras de integridade e permitindo a correção direta de CPF/PIS preservando estruturalmente o documento original.

👉 *Para um mergulho funcional completo na plataforma, leia nossa [Proposta Oficial (PROPOSE.md)](./docs/PROPOSE.md).*

---

## 🎯 Abordagens do Sistema

A arquitetura do AFDMaster prioriza a **segurança fiscal**, a **performance** e a **experiência do usuário (UX)** no trato de arquivos sensíveis:

- 🛡️ **Zero Backend (Privacy-First):** Nenhum arquivo AFD jamais toca um servidor externo. Todo processamento, conversão, Hash CRC e cálculo de datas é feito através da V8/Browser Engine do cliente. Garantia total contra vazamento de CPFs e senhas.
- ⚡ **Performance Massiva com Vue 3:** Manipula facilmente arrays com milhares de registros de leitura de ponto simultaneamente através do sistema de reatividade super ágil (Proxy) nativo do Vue.
- 🛠️ **Recálculo de Hashes (CRC-16/KERMIT):** Abordagens de edição direta invalidariam o checksum fiscal em arquivos de *Portaria 671*. O software recompila ativamente e injeta as validações de segurança da assinatura do arquivo para assegurar compatibilidade absoluta natural com ERPs de folha de pagamento.
- 🌗 **Estética Premium Nativa:** Cansar os olhos analisando linhas de texto é o passado. Interface munida de Contrastes balanceados (Dark/Light Native), micro-interações para guiar a atenção e uso extensivo de "glassmorphism" e componentes escaláveis com *Quasar*.

---

## 💻 Tech Stack

- **[Vue 3 (Composition API)](https://vuejs.org/)**: Motor de reatividade UI.
- **[Quasar Framework](https://quasar.dev/)**: Fornece os super-componentes visuais, modais fluidos, gerenciamento inteligente de scroll e responsividade out-of-the-box.
- **[Pinia](https://pinia.vuejs.org/)**: Gere todo do fluxo de estado global (`store.records`, configurações de tolerância, abas ativas, portarias detectadas).
- **[Vite](https://vitejs.dev/)**: Ferramenta ultrarrápida de tooling e empacotamento.
- **Vanilla SCSS/CSS**: Arquitetura padronizada de estilos para transições polidas sem dependência extensiva de bibliotecas puramente utilitárias.

---

## 🚀 Como Executar Localmente e Publicar (Build)

As instruções detalhadas de como preparar o seu ambiente, instalar as dependências de roteamento e como compilar os arquivos estáticos para o seu servidor web estão na nossa área de documentação focada ao desenvolvedor.

👉 **[Acessar o Manual de Build do App e Uso Local](./docs/build.md)**

---

## 💼 Contribuições e Guias
Verifique o arquivo [PROPOSE.md](./docs/PROPOSE.md) para entender a fundo todos os módulos (Visualizador, Motor de Validação Sintático, Sintetizador Mock de testes, e Editor Avançado).