#!/usr/bin/env bash
# start.sh
# Starts both the Python Backend and the Vite Frontend for ClientMon

echo "======================================"
echo "    Starting ClientMon Dashboard      "
echo "======================================"

# Start backend
echo "[1/2] Starting Python Backend..."
echo "      (Requires sudo to access system processes and file activity)"
sudo -v
sudo uv run main.py &
BACKEND_PID=$!

# Start frontend
echo "[2/2] Starting Vite Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Handle graceful shutdown on Ctrl+C
cleanup() {
    echo ""
    echo "Shutting down ClientMon..."
    kill $FRONTEND_PID 2>/dev/null
    sudo kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "ClientMon is running! Press Ctrl+C to stop."
wait
