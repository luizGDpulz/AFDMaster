# ---------------------------------------------------------------------------
# Stage 1 – Build
#   Installs dependencies and runs `quasar build` to produce a static SPA in
#   afdmaster/dist/spa
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time arguments (default: normal mode, no password)
# To build in demo mode:     docker build --build-arg DEMO_MODE=true ...
# To set tech password:       docker build --build-arg TECH_PASSWORD=mypass ...
ARG DEMO_MODE=false
ARG TECH_PASSWORD=""

ENV DEMO_MODE=$DEMO_MODE
ENV TECH_PASSWORD=$TECH_PASSWORD

# Copy manifest + quasar config first so dependency layers are cached.
# quasar.config.js and index.html are required by the `quasar prepare` postinstall script.
COPY afdmaster/package.json afdmaster/package-lock.json afdmaster/quasar.config.js afdmaster/index.html ./

# Install all deps (postinstall runs `quasar prepare`)
RUN npm ci

# Copy the rest of the source
COPY afdmaster/ .

# Build the SPA (DEMO_MODE is already set in ENV above)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 – Serve
#   Copies only the compiled static assets into a minimal nginx image.
#   The container listens on port 80 and is meant to sit behind a reverse
#   proxy (nginx Proxy Manager, Traefik, Caddy, etc.) on the host.
# ---------------------------------------------------------------------------
FROM nginx:alpine

# Replace the default site config with ours
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built SPA
COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
