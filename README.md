# AFDMaster

O **AFDMaster** é uma aplicação web completa, desenvolvida para analisar, editar, validar e sintetizar Arquivos Fonte de Dados (AFD) originados de Relógios Eletrônicos de Ponto (REP). Seu objetivo é facilitar a vida de profissionais de Recursos Humanos, TI e prestadores de suporte técnico em sistemas de apuração de ponto, fornecendo uma interface visual moderna, interativa e rigorosa quanto à legislação trabalhista brasileira (Portarias 1510/2009 e 671/2021).

O AFDMaster permite que arquivos de texto brutos, até então difíceis de interpretar, sejam dissecados em uma tabela interativa, possibilitando a rápida identificação de erros de preenchimento, falhas de sincronismo, inclusões manuais incorretas ou adulterações.

## Principais Funcionalidades

### 1. Análise e Visualização Interativa (Reader)
- **Importação Ágil:** Permite importar arquivos AFD `.txt` bastando arrastar e soltar (Drag and Drop) na área de upload, processando milhares de linhas em segundos.
- **Detecção Automática:** O sistema identifica automaticamente a portaria de origem do arquivo (1510 vs 671) realizando a extração dos dados do arquivo.
- **Tabela Descritiva:** Decodifica cada tipo de linha (Cabeçalho, Dados do Empregador, Trabalhador, Marcação de Ponto e Eventos) traduzindo os identificadores e convertendo as datas, horas e fusos para formatos legíveis humano-compreensíveis.
- **Filtros e Buscas Rápidas:** Permite filtrar todas as marcações de um determinado período, isolar um trabalhador específico pelo PIS/CPF ou nome, e visualizar os painéis separadamente.

### 2. Motor de Validação em Tempo Real
- O AFDMaster possui um poderoso motor que inspeciona gramaticamente e logicamente cada linha em tempo real baseando-se estritamente nos manuais do MTE.
- **Validação de Formatação:** Identifica PIS/CPFs com padding incorreto, PIS/CPFs repetidos para pessoas diferentes, ou nomes de empregados fora do padrão.
- **Detecção de Tempo e Integridade (CRC):** Alerta em caso de quebra de sequência ou buracos no identificador numérico (NSR), marcações temporalmente antes de admissões lógicas e quebras do Hash Kermit (CRC-16).
- **Sumarização Visual:** Erros críticos e avisos ("warnings") são reportados num painel consolidado ("Validation Report") agrupando as inconsistências, informando suas respectivas linhas para fácil identificação.

### 3. Gerador (Sintetizador) de AFD Mockado
- **Ambiente de Testes Realista:** Cria arquivos AFD do "zero" para fins de testes rigorosos em sistemas de folha de ponto.
- **Wizard Passo a Passo:** Permite definir qual modelo legal o arquivo pertencerá (1510, 671), o serial da máquina, o período completo da competência, além das inclusões opcionais (como obrigar ou não a geração do Trailer e/ou cabeçalho).
- **Variância Natural:** Para impedir bloqueios antifraude e de tolerância por marcação de softwares de terceiros, o construtor adota uma "Variância Matemática", injetando minutos aleatórios para mais ou para menos em torno do eixo estrito da marcação (ex. randomizando a entrada entre 07:55 e 08:05 em vez de ser todos os dias às 08:00 cravadas).
- **Colaboradores e Lote:** O usuário cadastra quantos funcionários quiser, fornecendo as chaves dos pares de batida diárias e o gerador povoa todos os registros no intervalo especificado.

### 4. Edição, Correção e Exportação
- Além de visualizar falhas, arquivos corrompidos que o sistema do ponto não quer aceitar podem ser arrumados pelo AFDMaster. O usuário consegue clicar e editar diretamente as strings vitais de PIS/CPF e Nome, garantindo que elas respeitem as travas fiscais.
- O botão exportar recompila o AFD em sua completude, recalculando dinamicamente e injetando as correspondências de chave criptográfica e totalizadores da linha final.

### 5. Documentação e Design Imersivo
- **Guias Embutidos:** Possui uma aba rica onde o profissional tem à disposição trechos completos ou consolidados da lei, auxiliando-o a consultar como deve ser estruturado o AFD no relógio ou entender um erro bizarro oriundo do cliente, tudo num só lugar.
- **Interface Premium Escura (Dark Mode Native):** Todo o sistema é dotado de uma estética de altíssimo nível. Possui Dark Mode ativado localmente e paleta *High Contrast* desenvolvida especificamente para cansar menos a vista em auditorias longas de arquivos enormes, utilizando microanimações contínuas, abas estilizadas ("soft surfaces"), botões fluidos e tipografia moderna.

---

## Tecnologias e Arquitetura

O projeto se baseia numa robusta esteira reativa do ecossistema front-end moderno:

- **Vue.js 3:** Todo o alicerce, reatividade apurada com Composition API e refatorações puramente visuais, fazendo renderização instantânea dos enormes arrays de dados com extrema agilidade.
- **Quasar Framework:** Responsável pela densidade fantástica da interface visual, oferecendo cards nativos, grids, modais customizados, notificações e inputs materializados que proporcionam a navegação veloz e elegante.
- **Pinia:** É a espinha dorsal de todo o AFDMaster gerindo o Estado Global. Ele armazena as estruturas das linhas decodificadas do AFD de forma unificada ao abrir, evitando engasgos ou releituras, além de centralizar e ditar a chave ativadora entre o *Light* / *Dark* Mode.
- **CSS / SCSS Customizado:** Arquitetura atômica mesclada a variáveis globais de CSS, conferindo transição impecável de componentes opacos, cantos polidos e efeitos hover, dando um acabamento premium sem utilizar bibliotecas carregadas de classes inúteis.

---
*Este aplicativo visa entregar tanto a excelência técnica, capaz de lidar analiticamente com um cenário arcaico (arquivos e bit a bits defasados), quanto uma experiência visual incomparável de mercado para profissionais da área fiscal/trabalhista e suporte técnico.*
