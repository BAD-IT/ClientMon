import { state } from '../state';
import { escapeHTML } from '../utils';

export function renderAlertView(): string {
  const alert = state.focusedAlert;
  if (!alert) return '';

  let displayPid = alert.pid;
  let displayName = alert.process_name;
  let displayIp = alert.remote_ip;

  if (!displayPid || !displayName) {
    const match = alert.message.match(/Process (.+) \(PID: (\d+)\) connected to new IP: (.+)/);
    if (match) {
      displayName = match[1];
      displayPid = parseInt(match[2], 10);
      displayIp = match[3];
    }
  }

  return `
    <header>
      <h1>Security Alert Analysis</h1>
      <div class="controls">
        <button onclick="window.closeAlert()" style="padding: 0.5rem 1rem; border-radius: 8px; background: var(--panel-bg); color: var(--text-main); border: 1px solid var(--panel-border); cursor: pointer; transition: background 0.2s;">← Back to Dashboard</button>
      </div>
    </header>

    <main class="glass-panel" style="animation: slideIn 0.3s ease-out; display: flex; flex-direction: column; gap: 1.5rem;">
      
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1.5rem;">
        <h2 style="color: #ef4444; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">⚠️</span> ${escapeHTML(alert.severity.toUpperCase())} ALERT
        </h2>
        <p style="font-size: 1.1rem; margin-bottom: 0;">${escapeHTML(alert.message)}</p>
      </div>

      <div>
        <h3>Analysis & Context</h3>
        <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 8px; margin-top: 0.5rem; line-height: 1.6;">
          <p style="margin-top: 0;">The process <strong>${escapeHTML(displayName || 'Unknown')}</strong> (PID: ${displayPid || 'Unknown'}) has initiated a connection to an external IP address: <code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">${escapeHTML(displayIp || 'Unknown')}</code>.</p>
          <p><strong>Is this dangerous?</strong></p>
          <p style="color: var(--text-muted);">Not necessarily. Modern applications and even Python scripts frequently connect to Content Delivery Networks (CDNs), telemetry servers, and cloud infrastructure. This alert is triggered simply because our monitor hasn't seen this specific IP address since it started tracking.</p>
        </div>
      </div>
      
      <div>
        <h3>Recommended Actions</h3>
        <div style="display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap;">
          ${displayPid ? `
          <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.03); border: 1px solid var(--panel-border); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column;">
            <h4 style="margin-top: 0;">1. Inspect the Process</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1;">View all active connections and resource usage for this application to determine if it is behaving abnormally.</p>
            <button onclick="window.viewDetails(${displayPid}, '${escapeHTML(displayIp || '')}')" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); cursor: pointer; font-weight: 600; transition: background 0.2s;">View in Focus Mode</button>
          </div>
          ` : ''}
          
          <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.03); border: 1px solid var(--panel-border); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column;">
            <h4 style="margin-top: 0;">${displayPid ? '2' : '1'}. Investigate the IP</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1;">Automatically lookup the provider for this IP to see if it is a known Cloud or CDN provider.</p>
            <div id="whois-container" style="font-family: monospace; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 4px; text-align: center; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.5rem; min-height: 40px; display: flex; align-items: center; justify-content: center;">
              <span style="color: var(--text-muted);">Ready to trace...</span>
            </div>
            <button onclick="window.traceIp('${escapeHTML(displayIp || '')}')" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); cursor: pointer; font-weight: 600; transition: background 0.2s;">Auto-Trace IP</button>
          </div>

          <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.03); border: 1px solid var(--panel-border); padding: 1.5rem; border-radius: 8px; display: flex; flex-direction: column;">
            <h4 style="margin-top: 0;">${displayPid ? '3' : '2'}. Ignore IP</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-grow: 1;">If you determine this connection is legitimate, you can mark the IP as safe. It will no longer trigger alerts.</p>
            <button onclick="window.ignoreAlertIp('${escapeHTML(displayIp || '')}')" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); cursor: pointer; font-weight: 600; transition: background 0.2s;">Mark as Safe</button>
          </div>
        </div>
      </div>

    </main>
  `;
}
