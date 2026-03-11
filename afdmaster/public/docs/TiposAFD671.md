# Tipos de REP na Portaria 671

A **Portaria 671/2021** (MTP) modernizou as regras de registro de ponto no Brasil, unificando as antigas portarias (como a 1510) e classificando os Relógios Eletrônicos de Ponto (REP) em três categorias distintas. O preenchimento e a exigência de certificações do Arquivo Fonte de Dados (AFD) muda completamente dependendo do tipo do REP.

## 1. REP-C (Convencional)
O REP-C é o modelo clássico de "relógio de parede", herdeiro direto da antiga Portaria 1510. 
- **Características**: É um equipamento físico, blindado e dedicado exclusivamente para o registro de jornada.
- **Segurança**: Conta com uma memória fiscal interna inviolável (MRP) e emite aquele famoso comprovante em papel térmico.
- **Certificação**: Exige certificação rigorosa do Inmetro e do Ministério do Trabalho.
- **Geração do AFD**: O layout no AFD do REP-C mantém 100% das raízes originais, sem chaves criptográficas avançadas por linha.

## 2. REP-A (Alternativo)
O REP-A engloba os softwares, aplicativos móveis e soluções de "ponto web" autorizados mediante **Acordo ou Convenção Coletiva de Trabalho**.
- **Características**: O equipamento usado não precisa ser certificado pelo Inmetro (o registro ocorre pelo celular, tablet ou computador do funcionário).
- **Exigências**: O registro precisa ser gerado eletronicamente num AFD unificado, porém **requer assinatura eletrônica** no momento da geração para garantir que o espelho/banco de dados não foi corrompido ou manipulado pela empresa.

## 3. REP-P (Programa ou Sistema)
Esta é a maior novidade tecnológica da Portaria. O REP-P é um software centralizado (em nuvem ou servidor local) que executa tanto o registro de ponto quanto o Tratamento do Ponto (PTRP) no mesmo ecossistema.
- **Características**: Permite marcação de qualquer lugar através de coletores (celular/web), sem blindagem física.
- **Segurança**: Para ser classificado como REP-P, o sistema emissor **exige obrigatoriamente** registro e certificado no INPI (Instituto Nacional de Propriedade Industrial), atestando controle absoluto da cadeia lógica e da imutabilidade dos dados através de fortíssima criptografia assimétrica de hash.

---

> [!NOTE]
> **No AFDMaster**, ao importar arquivos ou gerar mock-ups, levamos em consideração que cada sistema injeta variâncias matemáticas sutis no log do AFD. Um AFD perfeitamente assíncrono vindo de um REP-P possui complexas trilhas de auditoria nos cabeçalhos que os validadores (MTE) utilizam para atestar sua veracidade durante as inspeções fiscais.
