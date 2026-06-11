import { state } from '../state';
import { escapeHTML } from '../utils';

export function renderFocusView(): string {
  const focusedDetails = state.focusedDetails;
  
  return `
    <header>
      <h1>Focus Mode: PID ${state.focusedPid}</h1>
      <div class="controls">
        <button onclick="window.closeDetails()" style="padding: 0.5rem 1rem; border-radius: 8px; background: var(--panel-bg); color: var(--text-main); border: 1px solid var(--panel-border); cursor: pointer; transition: background 0.2s;">← Back to Overview</button>
      </div>
    </header>

    <main class="glass-panel" style="animation: slideIn 0.3s ease-out;">
      ${!focusedDetails ? `<p style="text-align: center; padding: 2rem;">Loading details...</p>` : 
        focusedDetails.error ? `<p style="text-align: center; color: var(--alert-text); padding: 2rem;">${escapeHTML(focusedDetails.error)}</p>` :
        `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <h2>${escapeHTML(focusedDetails.name)}</h2>
          <p style="font-family: monospace; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; overflow-wrap: anywhere;">${escapeHTML(focusedDetails.path)}</p>
          
          <div style="display: flex; gap: 2rem; margin-top: 1rem;">
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; flex: 1;">
              <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Memory Usage</div>
              <div style="font-size: 1.5rem; font-weight: 600;">${focusedDetails.memory_mb.toFixed(1)} MB</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; flex: 1;">
              <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">CPU Usage</div>
              <div style="font-size: 1.5rem; font-weight: 600;">${focusedDetails.cpu_percent.toFixed(1)}%</div>
            </div>
          </div>
          
          <h3 style="margin-top: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--panel-border);">Network Connections (${focusedDetails.network_activities?.length || 0})</h3>
          ${focusedDetails.network_activities?.length ? `
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
              ${focusedDetails.network_activities.map(n => `
                <li style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>${escapeHTML(n.protocol)}</strong>: ${escapeHTML(n.remote_address)}</span>
                  <span class="stat-badge">${escapeHTML(n.status)}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p style="color: var(--text-muted);">No network activity detected.</p>'}
        </div>
        `
      }
    </main>
  `;
}
