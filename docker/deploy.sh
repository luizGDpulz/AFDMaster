#!/usr/bin/env bash
# =============================================================================
# deploy.sh – Build and run the AFDMaster Docker container
#
# Usage:
#   ./docker/deploy.sh [--rebuild] [PORT]
#
# Arguments:
#   --rebuild  Force rebuild: removes container and image before building
#   PORT       Host port to expose (default: 8080)
#              The container's nginx always listens internally on port 80.
#
# Examples:
#   ./docker/deploy.sh          # normal deploy on port 8080
#   ./docker/deploy.sh 3500     # normal deploy on port 3500
#   ./docker/deploy.sh --rebuild     # clean rebuild on port 8080
#   ./docker/deploy.sh --rebuild 3500 # clean rebuild on port 3500
#
# Typical reverse-proxy setup (nginx Proxy Manager / Caddy / Traefik):
#   Point the proxy to  http://localhost:<PORT>
#   The proxy handles TLS; this container serves plain HTTP internally.
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration – feel free to change defaults here
# ---------------------------------------------------------------------------
IMAGE_NAME="afdmaster"
CONTAINER_NAME="afdmaster"
INTERNAL_PORT="80"              # nginx listens on this inside the container

# ---------------------------------------------------------------------------
# Parse arguments: --rebuild, PORT
# ---------------------------------------------------------------------------
REBUILD=false
PORT="8080"

if [[ ${1:-} == "--rebuild" ]]; then
  REBUILD=true
  PORT="${2:-8080}"
else
  PORT="${1:-8080}"
fi

# ---------------------------------------------------------------------------
# Resolve repo root regardless of where the script is called from
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Cleanup (if --rebuild was specified)
# ---------------------------------------------------------------------------
if [[ "${REBUILD}" == "true" ]]; then
  echo ""
  echo "==> REBUILD MODE: Cleaning up existing container and image"
  echo ""

  # Stop and remove container
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "    Stopping and removing container: ${CONTAINER_NAME}"
    docker rm -f "${CONTAINER_NAME}"
  else
    echo "    No existing container found"
  fi

  # Remove image
  if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}:latest$"; then
    echo "    Removing image: ${IMAGE_NAME}:latest"
    docker rmi "${IMAGE_NAME}:latest"
  else
    echo "    No existing image found"
  fi

  echo ""
fi

# ---------------------------------------------------------------------------
# Prompt: Demo Mode
# ---------------------------------------------------------------------------
DEMO_BUILD_ARG="--build-arg DEMO_MODE=false"
# `read` can return exit code 1 on EOF (non-interactive pipe); `|| true` keeps set -e happy
read -rp "==> Ativar MODO DEMO? (exibe aviso, só permite arquivos de exemplo) [s/N] " _demo_ans || true
if [[ "${_demo_ans,,}" == "s" || "${_demo_ans,,}" == "y" ]]; then
  DEMO_BUILD_ARG="--build-arg DEMO_MODE=true"
  echo "    Demo Mode: ATIVADO"
else
  echo "    Demo Mode: desativado"
fi

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
echo ""
echo "==> Building image: ${IMAGE_NAME}"
echo "    Build context : ${REPO_ROOT}"
echo ""

docker build \
  --file "${REPO_ROOT}/docker/Dockerfile" \
  --tag  "${IMAGE_NAME}:latest" \
  ${DEMO_BUILD_ARG} \
  "${REPO_ROOT}"

# ---------------------------------------------------------------------------
# Replace any existing container with the same name
# ---------------------------------------------------------------------------
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo ""
  echo "==> Stopping and removing existing container: ${CONTAINER_NAME}"
  docker rm -f "${CONTAINER_NAME}"
fi

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
echo ""
echo "==> Starting container: ${CONTAINER_NAME}"
echo "    Host port     : ${PORT}  -->  container port: ${INTERNAL_PORT}"
echo ""

docker run \
  --detach \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --publish "${PORT}:${INTERNAL_PORT}" \
  "${IMAGE_NAME}:latest"

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "✓  AFDMaster is running."
echo "   Local :  http://localhost:${PORT}"
echo ""
echo "   Configure your reverse proxy to forward requests to port ${PORT}."
echo "   The container will restart automatically unless you stop it manually:"
echo "     docker rm -f ${CONTAINER_NAME}"
echo ""
