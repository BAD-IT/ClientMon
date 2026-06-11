import { state } from './state';
import type { ProcessDetails } from './types';

export function setupWebSocket() {
  const ws = new WebSocket('ws://127.0.0.1:8000/ws');
  
  ws.onopen = () => {
    console.log('Connected to backend WebSocket');
  };
  
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'process_list') {
        state.setProcesses(msg.data);
      } else if (msg.type === 'alert') {
        state.addAlert(msg);
      }
    } catch (e) {
      console.error('Error parsing WebSocket message', e);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed, retrying in 3s...');
    setTimeout(setupWebSocket, 3000);
  };
}

export async function fetchProcessDetails(pid: number): Promise<ProcessDetails> {
  const res = await fetch(`http://127.0.0.1:8000/api/process/${pid}`);
  if (!res.ok) {
    throw new Error("Process not found");
  }
  return res.json();
}

export async function fetchInitialProcesses() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/processes");
    if (res.ok) {
      const data = await res.json();
      state.setProcesses(data);
    }
  } catch (e) {
    console.error("Failed to load initial processes", e);
  }
}
