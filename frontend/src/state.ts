import type { ProcessSummary, Alert, ProcessDetails } from './types';

type Listener = () => void;

class State {
  processes: ProcessSummary[] = [];
  alerts: Alert[] = [];
  filterText: string = "";
  scopeFilter: string = "user_apps";
  focusedPid: number | null = null;
  focusedDetails: ProcessDetails | null = null;
  
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  setProcesses(procs: ProcessSummary[]) {
    this.processes = procs;
    if (this.focusedPid === null) this.notify();
  }

  addAlert(alert: Alert) {
    this.alerts.push(alert);
    if (this.alerts.length > 5) this.alerts.shift();
    if (this.focusedPid === null) this.notify();
  }
}

export const state = new State();
