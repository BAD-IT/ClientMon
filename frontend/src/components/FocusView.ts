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
              ${focusedDetails.network_activities.map(n => {
                const isHighlighted = state.highlightIp && n.remote_address.includes(state.highlightIp);
                return `
                <li style="background: ${isHighlighted ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)'}; border: ${isHighlighted ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent'}; padding: 0.75rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: ${isHighlighted ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none'};">
                  <span><strong>${escapeHTML(n.protocol)}</strong>: ${escapeHTML(n.remote_address)}</span>
                  <span class="stat-badge">${escapeHTML(n.status)}</span>
                </li>
              `}).join('')}
            </ul>
          ` : '<p style="color: var(--text-muted);">No network activity detected.</p>'}
          
          ${(() => {
            const fileFilter = state.fileFilterText.toLowerCase();
            const allFiles = focusedDetails.unique_file_paths || [];
            const filteredFiles = fileFilter ? allFiles.filter(f => f.path.toLowerCase().includes(fileFilter)) : allFiles;
            
            return `
              <h3 style="margin-top: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: baseline;">
                <span>File Access (${filteredFiles.length} / ${allFiles.length})</span>
                <input type="text" id="fileSearchInput" placeholder="Filter files..." value="${escapeHTML(state.fileFilterText)}" style="font-size: 0.9rem; padding: 0.3rem 0.6rem; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--panel-border); color: var(--text-main);" />
              </h3>
              <div style="max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px solid var(--panel-border);">
                ${filteredFiles.length ? `
                  <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem; margin: 0;">
                    ${filteredFiles.map(f => `
                      <li style="background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 0.85rem;">
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 1rem; direction: rtl; text-align: left;" title="${escapeHTML(f.path)}">&lrm;${escapeHTML(f.path)}</span>
                        <span class="stat-badge" style="min-width: 3rem; text-align: center; flex-shrink: 0; ${f.mode === 'R' ? 'background: rgba(34, 197, 94, 0.2); color: #4ade80;' : f.mode === 'W' ? 'background: rgba(239, 68, 68, 0.2); color: #f87171;' : 'background: rgba(249, 115, 22, 0.2); color: #fb923c;'}">[${escapeHTML(f.mode)}]</span>
                      </li>
                    `).join('')}
                  </ul>
                ` : '<p style="color: var(--text-muted); padding: 1rem; text-align: center;">No files found.</p>'}
              </div>
            `;
          })()}
        </div>
        `
      }
    </main>
  `;
}
