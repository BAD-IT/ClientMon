import type { ProcessSummary, Alert, ProcessDetails } from './types';

type Listener = () => void;

class State {
  processes: ProcessSummary[] = [];
  alerts: Alert[] = [];
  filterText: string = "";
  fileFilterText: string = "";
  scopeFilter: "user_apps" | "all" | "alerts" = "user_apps";
  focusedPid: number | null = null;
  focusedDetails: ProcessDetails | null = null;
  focusedAlert: Alert | null = null;
  highlightIp: string | null = null;
  whoisCache: Record<string, string> = {};
  
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  setWhoisCache(ip: string, info: string) {
    this.whoisCache[ip] = info;
    this.notify();
  }

  setProcesses(procs: ProcessSummary[]) {
    this.processes = procs;
    if (this.focusedPid === null && this.focusedAlert === null) this.notify();
  }

  addAlert(alert: Alert) {
    this.alerts.push(alert);
    if (this.alerts.length > 5) this.alerts.shift();
    if (this.focusedPid === null && this.focusedAlert === null) this.notify();
  }
}

export const state = new State();
