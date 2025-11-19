#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -f "$SCRIPT_DIR/Anchor.toml" ]]; then
  ANCHOR_DIR="$SCRIPT_DIR"
  PROJECT_ROOT="$SCRIPT_DIR"
elif [[ -d "$SCRIPT_DIR/anchor_project" ]]; then
  ANCHOR_DIR="$SCRIPT_DIR/anchor_project"
  PROJECT_ROOT="$SCRIPT_DIR"
else
  echo "❌ Could not locate Anchor project. Place run-tests.sh in the repo root or anchor_project directory."
  exit 1
fi

VALIDATOR_PORT=8899
VALIDATOR_PID=""

function cleanup() {
  if [[ -n "${VALIDATOR_PID}" ]] && ps -p "${VALIDATOR_PID}" >/dev/null 2>&1; then
    echo "🛑 Shutting down local validator (PID ${VALIDATOR_PID})..."
    kill "${VALIDATOR_PID}" >/dev/null 2>&1 || true
    wait "${VALIDATOR_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "🧹 Checking for existing solana-test-validator on port ${VALIDATOR_PORT}..."
while lsof -ti tcp:"${VALIDATOR_PORT}" >/dev/null 2>&1; do
  PID_TO_KILL="$(lsof -ti tcp:"${VALIDATOR_PORT}")"
  echo "⚠️  Port ${VALIDATOR_PORT} is in use by PID ${PID_TO_KILL}. Terminating..."
  kill "${PID_TO_KILL}" >/dev/null 2>&1 || true
  sleep 1
done

echo "🔧 Starting local validator..."
solana-test-validator --reset --quiet >/dev/null 2>&1 &
VALIDATOR_PID=$!

sleep 7
echo "✅ Local validator is running on port ${VALIDATOR_PORT} (PID ${VALIDATOR_PID})."

export ANCHOR_PROVIDER_URL="http://127.0.0.1:${VALIDATOR_PORT}"
export SOLANA_URL="${ANCHOR_PROVIDER_URL}"

cd "${ANCHOR_DIR}"

echo "🧼 Cleaning previous build artifacts..."
anchor clean

echo "📦 Installing Node dependencies..."
npm install

echo "🏗️  Building program..."
anchor build

echo "🚀 Deploying program to localnet..."
anchor deploy --provider.cluster Localnet

echo "🧪 Running tests on localnet..."
anchor test --provider.cluster Localnet --skip-local-validator

echo "✅ All tests completed successfully!"
