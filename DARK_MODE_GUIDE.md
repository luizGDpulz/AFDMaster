# Guia do Modo Escuro (AFDMaster)

Este guia explica como o Modo Escuro está sendo aplicado no projeto e como você pode editar os atributos de cor e estilo nas telas e componentes.

O modo escuro no AFDMaster foi construído usando **Variáveis CSS (Custom Properties)** integradas em conjunto com o gerenciamento de estado do Quasar (via Pinia). Isso significa que não precisamos criar duas folhas de estilos separadas; usamos as mesmas variáveis que trocam de valor automaticamente dependendo do tema ativo na tag HTML (`data-theme="dark"`).

---

## 1. O Ponto Central das Cores: `src/css/app.scss`

Toda a paleta de cores base do sistema está definida neste arquivo. Se você abrir `app.scss`, verá duas sessões principais no topo:

### A. Tema Claro (Padrão)
```scss
:root {
    --qm-bg-primary: #ffffff;
    --qm-bg-secondary: #f5f5f5;
    --qm-surface: #ffffff;
    --qm-text-primary: #171717;
    // ... outras variáveis claras
}
```

### B. Tema Escuro (O que você quer editar)
Logo abaixo do bloco `:root`, você encontrará o seletor `[data-theme="dark"]`. É aqui que a mágica acontece. No modo escuro, o aplicativo aplica esse atributo na tag HTML `<html>`, forçando o navegador a substituir as variáveis da `:root` pelos valores daqui:
```scss
[data-theme="dark"] {
    // Fundo geral do app (Body)
    --qm-bg-secondary: #1e2021; 
    
    // Fundo dos cards, tabelas ("main content") e modais
    --qm-surface: #181a1b; 
    --qm-bg-primary: #181a1b;
    
    // Textos
    --qm-text-primary: #fafafa; // Textos principais (títulos, corpo principal)
    --qm-text-secondary: #aaaaaa; // Textos secundários (legendas, hints e textos de utilidade)
    
    // Bordas e Inputs
    --qm-border-light: #2a2d2f; // Contornos dos inputs e divisórias sutis
    --qm-input-bg: #141617;     // Fundo das caixas de texto (inputs)
}
```
**👉 Como editar:** Para mudar os tons de preto/cinza, basta alterar as cores hexadecimais (ex: `#1e2021`) dentro desse bloco `[data-theme="dark"]` no `app.scss`. O sistema inteiro vai refletir essa alteração na hora se você estiver rodando o servidor de desenvolvimento (HMR).

---

## 2. Sobrescritura Forçada do Quasar (Também no `app.scss`)

O Quasar possui estilos nativos fortes (com classes fixas) que, por padrão, as vezes ignoram nossas variáveis (por exemplo, dentro dos miolos imutáveis do `q-table` ou do `q-stepper`). 

Para lidar com isso globalmente, logo abaixo das variáveis no bloco `[data-theme="dark"]`, adicionamos regras de CSS forçando componentes específicos a respeitar as nossas cores.

Exemplo:
```scss
[data-theme="dark"] {
    /* ... declação das variáveis acima ... */

    // Sobrescritas globais para tabelas e steppers
    .q-table, .q-table tbody tr, .q-stepper, .q-stepper__header {
        background-color: var(--qm-surface) !important; // Força usar o tom escuro de Superfície
        color: var(--qm-text-primary) !important;       // Força texto branco no conteúdo
    }
}
```
Se você incluir um componente novo do Quasar (como um DatePicker num `<q-popup-proxy>`) e ele ficar branco e ilegível no modo escuro, o jeito mais consistente de corrigir de forma global é vir neste arquivo (`app.scss`) e adicionar a classe nativa do componente nas regras de sobrescritura listadas acima.

---

## 3. Editando Cores Específicas nos Componentes (Páginas `.vue`)

O que causava problemas de contraste e ilegibilidade (textos escuros em fundos escuros, ou áreas brancas "queimando" os olhos) eram as chamadas classes "chumbadas" (*hardcoded*) no HTML.

O template não deve conter códigos assim:
```html
❌ Errado:
<div class="bg-white text-grey-8"> ... </div>
```
Se você usar `bg-white`, o Quasar interpretará que aquele item SEMPRE deve ser branco (#FFF), independente do tema global (`isDark`).

**✅ A Regra de Ouro para fazer o HTML respeitar o Dark Mode:**
Quando você for montar as telas, em vez de usar `bg-white` ou `bg-grey-1` da paleta de cores cruas do Quasar, defina sua marcação utilizando os nomes semânticos criados no CSS, definindo-os na tag `style` do seu `.vue`:

```css
/* No fim da sua página .vue */
<style scoped>
.meu-card-adaptavel {
   /* Usa as CSS Variables (var) ao invés do código hexadecimal direto */
   background: var(--qm-surface);
   border: 1px solid var(--qm-border-light);
   color: var(--qm-text-primary);
}
</style>
```

```html
<!-- No seu HTML dentro do vue -->
<div class="meu-card-adaptavel q-pa-md"> 
  Conteúdo textado
</div>
```
Ou, se preferir usar utilitários atômicos, nós configuramos o `app.scss` para injetar algumas classes diretas como `bg-surface` e `text-primary`, por isso usar `<div class="bg-surface">` também funciona nos nossos componentes recentes.

---

## 4. Usar a Propriedade Nativa `:dark=` do Quasar

A API do Quasar prevê a integração nativa com o modo escuro sem depender só de CSS. Componentes complexos como `q-table`, `q-stepper`, ou formulários possuem a propriedade embutida `:dark`.

Por exemplo (em `GeneratorPage.vue`):
```html
<q-stepper 
    v-model="step" 
    :dark="store.isDark" <!-- Propriedade booleana controlada pelo pinia -->
    animated
>
```

Sempre que a `store.isDark` for `true`, isso sinaliza ao Quasar para carregar seus conjuntos visuais subjacentes em sua faceta noturna (ícones alternativos, placeholders menos contrastados, opacidade de setas ajustada, etc). 

Certifique-se sempre de invocar o setup da `store` do AFD em sua página para gerenciar a flag e passar a referência aos componentes Quasar.

```javascript
import { useAfdStore } from 'src/stores/afdStore'

setup() {
   const store = useAfdStore()
   return { store }
}
```

### Resumo 🛠️
Se você notar algum lugar estranho, siga esse checklist rápido:
1. Pressione **F12** (Inspecionar) no elemento indesejado.
2. Veja se no HTML ele tem uma classe como `bg-white`, `bg-grey-1` ou cor de texto forçada. Se encontrar, remova-a no painel do `.vue` respectivo e substitua por um estilo com as CSS tags `var(--qm-XXXXX)`.
3. Valide se componentes blocados do Quasar (cards, tables, modais) estão portando o prop `:dark="store.isDark"`.
4. Ajuste matizes e tons diretamente em `src/css/app.scss` em `[data-theme="dark"]`.
