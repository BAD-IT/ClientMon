import './style.css';
import { state } from './state';
import { setupWebSocket, fetchProcessDetails } from './api';
import { renderDashboard } from './components/Dashboard';
import { renderFocusView } from './components/FocusView';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

function render() {
  if (state.focusedPid !== null) {
    appDiv.innerHTML = renderFocusView();
    return;
  }

  appDiv.innerHTML = renderDashboard();

  // Attach event listeners for Dashboard
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
    const len = searchInput.value.length;
    searchInput.setSelectionRange(len, len);
    
    searchInput.addEventListener('input', (e) => {
      state.filterText = (e.target as HTMLInputElement).value;
      render();
    });
  }

  const scopeSelect = document.getElementById('scopeFilter') as HTMLSelectElement;
  if (scopeSelect) {
    scopeSelect.addEventListener('change', (e) => {
      state.scopeFilter = (e.target as HTMLSelectElement).value;
      render();
    });
  }
}

// Global hooks for onclick events
(window as any).viewDetails = async (pid: number) => {
  state.focusedPid = pid;
  state.focusedDetails = null;
  render();

  try {
    const details = await fetchProcessDetails(pid);
    state.focusedDetails = details;
  } catch (e: any) {
    state.focusedDetails = { error: e.message } as any;
  }
  render();
};

(window as any).closeDetails = () => {
  state.focusedPid = null;
  state.focusedDetails = null;
  render();
};

// Subscribe to state changes
state.subscribe(() => {
  render();
});

// Initialization
setupWebSocket();
render();
