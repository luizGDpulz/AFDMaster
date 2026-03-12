#!/usr/bin/env bash
# =============================================================================
# deploy.sh – Build and run the AFDMaster Docker container
#
# Usage:
#   ./docker/deploy.sh [PORT]
#
# Arguments:
#   PORT   Host port to expose (default: 8080)
#          The container's nginx always listens internally on port 80.
#
# Examples:
#   ./docker/deploy.sh          # starts on port 8080
#   ./docker/deploy.sh 3500     # starts on port 3500
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
PORT="${1:-8080}"               # host port exposed to the proxy
INTERNAL_PORT="80"              # nginx listens on this inside the container

# ---------------------------------------------------------------------------
# Resolve repo root regardless of where the script is called from
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

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
