import './style.css';
import { state } from './state';
import { setupWebSocket, fetchProcessDetails, fetchInitialProcesses, ignoreIp, fetchWhois } from './api';
import { renderDashboard } from './components/Dashboard';
import { renderFocusView } from './components/FocusView';
import { renderAlertView } from './components/AlertView';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]!));
}

(window as any).ignoreAlertIp = async (ip: string) => {
  await ignoreIp(ip);
  state.alerts = state.alerts.filter(a => a.remote_ip !== ip);
  (window as any).closeAlert();
};

(window as any).traceIp = async (ip: string) => {
  const container = document.getElementById('whois-container');
  if (container) {
    container.innerHTML = '<span style="color: var(--text-muted);">Tracing...</span>';
    try {
      const data = await fetchWhois(ip);
      container.innerHTML = `<strong>Provider:</strong> ${escapeHTML(data.provider)}`;
    } catch (e) {
      container.innerHTML = '<span style="color: #f87171;">Lookup failed.</span>';
    }
  }
};

(window as any).traceIpFocus = async (ip: string) => {
  state.setWhoisCache(ip, '<span style="color: var(--text-muted);">Tracing...</span>');
  try {
    const data = await fetchWhois(ip);
    state.setWhoisCache(ip, `<strong>${escapeHTML(data.provider)}</strong> (${escapeHTML(data.city)}, ${escapeHTML(data.country)})`);
  } catch (e) {
    state.setWhoisCache(ip, '<span style="color: #f87171;">Lookup failed.</span>');
  }
};

function render() {
  const activeId = document.activeElement?.id;
  const scrollY = window.scrollY;

  if (state.focusedPid !== null) {
    appDiv.innerHTML = renderFocusView();
    const fileSearchInput = document.getElementById('fileSearchInput') as HTMLInputElement;
    if (fileSearchInput) {
      if (activeId === 'fileSearchInput') {
        fileSearchInput.focus({ preventScroll: true });
        const len = fileSearchInput.value.length;
        fileSearchInput.setSelectionRange(len, len);
      }
      
      fileSearchInput.addEventListener('input', (e) => {
        state.fileFilterText = (e.target as HTMLInputElement).value;
        render();
      });
    }
    window.scrollTo(0, scrollY);
    return;
  }

  if (state.focusedAlert !== null) {
    appDiv.innerHTML = renderAlertView();
    window.scrollTo(0, scrollY);
    return;
  }

  appDiv.innerHTML = renderDashboard();

  // Attach event listeners for Dashboard
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (searchInput) {
    if (activeId === 'searchInput') {
      searchInput.focus({ preventScroll: true });
      const len = searchInput.value.length;
      searchInput.setSelectionRange(len, len);
    }
    
    searchInput.addEventListener('input', (e) => {
      state.filterText = (e.target as HTMLInputElement).value;
      render();
    });
  }

  const scopeSelect = document.getElementById('scopeFilter') as HTMLSelectElement;
  if (scopeSelect) {
    scopeSelect.addEventListener('change', (e) => {
      state.scopeFilter = (e.target as HTMLSelectElement).value as "user_apps" | "all" | "alerts";
      render();
    });
  }
  
  window.scrollTo(0, scrollY);
}

// Global hooks for onclick events
(window as any).viewDetails = async (pid: number, highlightIp?: string) => {
  state.focusedPid = pid;
  state.focusedDetails = null;
  if (highlightIp) {
    state.highlightIp = highlightIp;
  }
  render();

  const loadData = async () => {
    try {
      const details = await fetchProcessDetails(pid);
      state.focusedDetails = details;
    } catch (e: any) {
      state.focusedDetails = { error: e.message } as any;
    }
    render();
  };

  await loadData();
  
  if ((window as any).focusInterval) clearInterval((window as any).focusInterval);
  (window as any).focusInterval = setInterval(loadData, 10000);
};

(window as any).closeDetails = () => {
  state.focusedPid = null;
  state.focusedDetails = null;
  state.highlightIp = null;
  if ((window as any).focusInterval) {
    clearInterval((window as any).focusInterval);
    (window as any).focusInterval = null;
  }
  render();
};

(window as any).viewAlert = (index: number) => {
  state.focusedAlert = state.alerts[index];
  render();
};

(window as any).closeAlert = () => {
  state.focusedAlert = null;
  render();
};

// Subscribe to state changes
state.subscribe(() => {
  render();
});

// Initialization
setupWebSocket();
fetchInitialProcesses();
render();
