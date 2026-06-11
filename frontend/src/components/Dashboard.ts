import { state } from '../state';
import { escapeHTML } from '../utils';

export function renderDashboard(): string {
  const filteredProcs = state.processes.filter(p => {
    if (state.scopeFilter === "user_apps" && !p.is_user_app) return false;
    if (state.filterText) {
      const matchName = p.name.toLowerCase().includes(state.filterText.toLowerCase());
      const matchPid = p.pid.toString().includes(state.filterText);
      if (!matchName && !matchPid) return false;
    }
    return true;
  });
  
  return `
    <header>
      <h1>ClientMon Dashboard</h1>
      <div class="controls">
        <select id="scopeFilter">
          <option value="user_apps" ${state.scopeFilter === 'user_apps' ? 'selected' : ''}>User Apps</option>
          <option value="all" ${state.scopeFilter === 'all' ? 'selected' : ''}>All Processes</option>
        </select>
        <input type="text" id="searchInput" placeholder="Search Name or PID..." value="${escapeHTML(state.filterText)}" />
      </div>
    </header>
    
    ${state.alerts.length > 0 ? `
    <div class="alerts-container">
      ${state.alerts.map(a => `
        <div class="alert-card">
          <span style="font-size: 1.2rem;">⚠️</span>
          <div>
            <strong>${escapeHTML(a.severity.toUpperCase())} ALERT:</strong> ${escapeHTML(a.message)}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <main class="glass-panel table-container">
      <table>
        <thead>
          <tr>
            <th>PID</th>
            <th>Process Name</th>
            <th>Memory</th>
            <th>CPU</th>
            <th>Network Conns</th>
          </tr>
        </thead>
        <tbody>
          ${filteredProcs.map(p => `
            <tr onclick="window.viewDetails(${p.pid})">
              <td><span class="stat-badge">${p.pid}</span></td>
              <td><strong>${escapeHTML(p.name)}</strong> ${p.is_user_app ? '<span title="User App">📱</span>' : ''}</td>
              <td><span class="stat-badge">${p.memory_mb.toFixed(1)} MB</span></td>
              <td><span class="stat-badge">${p.cpu_percent.toFixed(1)}%</span></td>
              <td>${p.network_count > 0 ? `<span class="stat-badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${p.network_count}</span>` : `<span class="stat-badge">0</span>`}</td>
            </tr>
          `).join('')}
          ${filteredProcs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No processes found.</td></tr>` : ''}
        </tbody>
      </table>
    </main>
  `;
}
