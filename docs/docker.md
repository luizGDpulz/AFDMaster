# 🐳 Deploy com Docker

Este guia descreve como construir e executar o AFDMaster em um container Docker. A imagem resultante é leve (baseada em **nginx:alpine**), servindo apenas os arquivos estáticos da SPA.

## Visão Geral da Arquitetura

O [Dockerfile](../docker/Dockerfile) utiliza um **multi-stage build**:

| Estágio | Imagem Base | Função |
|---------|-------------|--------|
| **Build** | `node:20-alpine` | Instala dependências e executa `quasar build` |
| **Serve** | `nginx:alpine` | Serve os arquivos estáticos compilados na porta 80 |

Isso garante que a imagem final contenha **apenas o Nginx e os arquivos da SPA**, sem Node.js, `node_modules` ou código-fonte.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado e rodando.
- Acesso ao terminal na raiz do repositório.

## Deploy Rápido com o Script

O repositório inclui um script pronto em [docker/deploy.sh](../docker/deploy.sh) que automatiza o build da imagem e a criação do container:

```bash
# Na raiz do repositório
chmod +x docker/deploy.sh

# Inicia na porta padrão (8080)
./docker/deploy.sh

# Ou escolha uma porta personalizada
./docker/deploy.sh 3500
```

O script irá:

1. Construir a imagem Docker (`afdmaster:latest`).
2. Remover qualquer container anterior com o mesmo nome.
3. Criar e iniciar um novo container com `--restart unless-stopped`.
4. Exibir a URL de acesso local.

## Deploy Manual (Passo a Passo)

Se preferir executar os comandos manualmente:

### 1. Build da Imagem

Na **raiz do repositório** (não na pasta `afdmaster`):

```bash
docker build -f docker/Dockerfile -t afdmaster:latest .
```

### 2. Executar o Container

```bash
docker run -d \
  --name afdmaster \
  --restart unless-stopped \
  -p 8080:80 \
  afdmaster:latest
```

A aplicação estará disponível em **http://localhost:8080**.

### 3. Comandos Úteis

```bash
# Ver logs do container
docker logs afdmaster

# Parar o container
docker stop afdmaster

# Remover o container
docker rm afdmaster

# Reconstruir sem cache (útil após mudanças no Dockerfile)
docker build --no-cache -f docker/Dockerfile -t afdmaster:latest .
```

## Usando com Reverse Proxy

O container serve HTTP puro na porta 80 internamente. Em produção, é recomendado posicionar um **reverse proxy** na frente para gerenciar TLS/HTTPS:

| Proxy | Configuração |
|-------|-------------|
| **Nginx Proxy Manager** | Aponte o domínio para `http://localhost:<PORTA>` |
| **Traefik** | Adicione labels no `docker run` ou `docker-compose.yml` |
| **Caddy** | Configure `reverse_proxy localhost:<PORTA>` no Caddyfile |

## Configuração do Nginx

O arquivo [docker/nginx.conf](../docker/nginx.conf) já vem configurado com:

- **Compressão gzip** para JS, CSS, JSON, SVG.
- **Cache de longa duração** (1 ano) para assets com hash no nome (gerados pelo Vite).
- **Headers de segurança** (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- **Fallback SPA** via `try_files` para `index.html`.

Para personalizar, edite o `nginx.conf` antes do build da imagem.

## Notas Importantes

> [!NOTE]
> O `publicPath` em `quasar.config.js` deve estar como `'/'` para o ambiente Docker, pois o Nginx serve a aplicação na raiz. Consulte a seção **Deploy em Subpasta** no [build.md](build.md) caso precise hospedar em um caminho diferente.

> [!TIP]
> Para ambientes com Docker Compose, basta criar um `docker-compose.yml` na raiz do repositório referenciando o Dockerfile existente:
> ```yaml
> services:
>   afdmaster:
>     build:
>       context: .
>       dockerfile: docker/Dockerfile
>     ports:
>       - "8080:80"
>     restart: unless-stopped
> ```
