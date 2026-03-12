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
- **Docker:** Consulte o guia [docker.md](docker.md) para instruções completas.

> [!NOTE] 
> O AFDMaster é estático e local. Hospedagem via protocolo `file://` (duplo clique direto no `.html`) pode causar bloqueios de CORS por conta dos módulos ES. Hospede em um servidor HTTP leve para rodar adequadamente.

## 5. Deploy em Subpasta (Subpath)

Por padrão, o `publicPath` em `quasar.config.js` está definido como `'/'`, o que significa que a aplicação espera ser servida na **raiz** do domínio (ex.: `http://localhost/`).

Se você precisa hospedar o AFDMaster dentro de uma **subpasta** — por exemplo, `http://localhost/afdmaster/` no XAMPP — é necessário alterar o `publicPath` antes de fazer o build.

Abra o arquivo `afdmaster/quasar.config.js` e altere a linha:

```js
publicPath: '/',
```

Para o caminho da subpasta desejada (sempre com barra no início e no final):

```js
publicPath: '/afdmaster/',
```

Em seguida, execute o build normalmente:

```bash
npm run build
```

Copie o conteúdo de `dist/spa` para a subpasta correspondente no servidor web (ex.: `htdocs/afdmaster/`).

> [!IMPORTANT]
> Lembre-se de **reverter** o `publicPath` para `'/'` caso vá fazer um build para o ambiente Docker ou para a raiz de um domínio. Caso contrário, os assets não serão encontrados e a aplicação exibirá uma tela em branco.

## 6. Modo Demo (Demo Mode)

O AFDMaster pode ser compilado em **modo demonstração**, pensado para hospedagem pública (portfólio, testes, etc.) sem gerar tráfego real de uso no servidor.

### O que muda no modo demo

| Funcionalidade | Normal | Demo |
|---|---|---|
| Importar AFD | Qualquer arquivo `.txt` | Apenas os arquivos de exemplo em `public/examples/` |
| Gerar AFD | Ilimitado | 1 funcionário, documento pré-definido, máximo 1 dia |
| Aviso visual | Nenhum | Faixa laranja no topo + badge na sidebar |
| Sobre | Normal | Explica que é um ambiente de demonstração |

### Como ativar

**Desenvolvimento local (quasar dev):**

```powershell
# PowerShell (Windows)
$env:DEMO_MODE="true"; quasar dev
```
```bash
# bash/Linux/macOS
DEMO_MODE=true quasar dev
```

**Build estático (XAMPP, nginx local):**

```powershell
# PowerShell (Windows)
$env:DEMO_MODE="true"; quasar build
```
```bash
# bash/Linux/macOS
DEMO_MODE=true quasar build
```

Sirva a pasta `dist/spa/` normalmente no XAMPP ou no seu servidor.

**Docker (via deploy.sh):**

```bash
./docker/deploy.sh 3500
# O script perguntará interativamente: "Ativar MODO DEMO? [s/N]"
```

Ou passando diretamente o `--build-arg`:

```bash
docker build --build-arg DEMO_MODE=true -t afdmaster .
```

> [!NOTE]  
> A variável é embutida em **tempo de build** pelo Vite. Não é possível alterar o modo sem recompilar a aplicação.

### Arquivos de exemplo

Os arquivos servidos no modo demo estão em `afdmaster/public/examples/`:

```
afdmaster/public/examples/
  exemplo_671.txt   ← Portaria 671
  exemplo_1510.txt  ← Portaria 1510
```

Popule esses arquivos com dados de demonstração antes de fazer o build. Eles serão copiados automaticamente para `dist/spa/examples/` pelo Quasar.
