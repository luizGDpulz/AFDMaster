# 🏗️ Build de Produção (Deploy)

Este pequeno manual destina-se a orientar o processo de compilação do AFDMaster para o seu formato estático e otimizado (HTML, CSS e JS puros), pronto para ser hospedado em qualquer servidor web (Apache, Nginx, Vercel, Netlify, etc).

## 1. Preparando o Ambiente

Certifique-se de que todas as dependências do projeto estejam instaladas. Navegue até a pasta da aplicação (`afdmaster`):

```bash
cd afdmaster
npm install
```

*(Se você já executou `npm run dev` na sua máquina local, esta etapa já está concluída).*

## 2. Invocando o Build

O motor do Vite aliado ao Quasar fará a transpilação, o minnification do código (JS/CSS) e injeção do hash nas chaves de roteamento. Execute:

```bash
npm run build
```

## 3. Acessando os Arquivos de Produção

Após a conclusão bem-sucedida do comando anterior, o CLI do Quasar gerará uma pasta chamada `dist` na raiz do seu projeto `afdmaster`.

A estrutura ficará assim:
📋 `afdmaster/dist/spa`

**Tudo o que você precisa está dentro da pasta `spa`**. 
Esses arquivos representam a sua Single Page Application compilada.

## 4. Como Hospedar (Deploy)

Como o AFDMaster roda **100% Client-Side** (sem backend NodeJS/PHP), o deploy é extremamente simples.

Basta copiar o conteúdo integral da pasta `dist/spa` e colar no diretório público do seu servidor web.
- **NGINX:** Copie para `/var/www/html/` (Lembre-se de configurar o fallback para `index.html` em caso de navegação no History Mode).
- **GitHub Pages / Vercel:** Basta apontar o diretório de saída automático para `afdmaster/dist/spa`. 

> [!NOTE] 
> O AFDMaster é estático e local. Hospedagem via protocolo `file://` (duplo clique direto no `.html`) pode causar bloqueios de CORS por conta dos módulos ES. Hospede em um servidor HTTP leve para rodar adequadamente.
