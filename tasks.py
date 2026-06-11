import asyncio
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from engine import get_all_processes
from websocket_manager import manager

async def background_monitor():
    """
    Background task to monitor processes and send updates/alerts to connected WebSockets.
    """
    known_ips = set()
    
    while True:
        if manager.active_connections:
            procs = get_all_processes()
            alerts = []
            
            # Broadcast the latest process list summary
            summary = []
            for p in procs:
                summary.append({
                    "pid": p.pid,
                    "name": p.name,
                    "memory_mb": round(p.memory_mb, 1),
                    "cpu_percent": round(p.cpu_percent, 1),
                    "network_count": len(p.network_activities),
                    "is_user_app": ".app/Contents/MacOS" in p.path
                })
            
            await manager.broadcast(json.dumps({"type": "process_list", "data": summary}))
            
            alerts_to_process = []
            for p in procs:
                for net in p.network_activities:
                    from db import get_whitelisted_ips
                    whitelist = get_whitelisted_ips()
                    
                    if net.dest_ip and net.dest_ip not in known_ips and net.dest_ip not in whitelist:
                        known_ips.add(net.dest_ip)
                        alerts_to_process.append((p, net))

            def sync_check_virustotal(ip: str) -> bool:
                import os
                import urllib.request
                import json
                
                vt_key = os.environ.get("VT_API_KEY")
                if not vt_key:
                    return False
                    
                try:
                    req = urllib.request.Request(
                        f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                        headers={"x-apikey": vt_key}
                    )
                    with urllib.request.urlopen(req, timeout=5) as response:
                        data = json.loads(response.read().decode())
                        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                        return stats.get("malicious", 0) > 0
                except Exception:
                    return False

            async def resolve_and_format(p, net):
                severity = "high"
                
                if net.dest_ip in ("127.0.0.1", "::1", "0.0.0.0"):
                    target_proc = None
                    for other_p in procs:
                        if other_p.pid == p.pid: continue
                        for other_net in other_p.network_activities:
                            if other_net.status == "LISTEN" and getattr(other_net, 'port', 0) == net.dest_port:
                                target_proc = other_p.name
                                break
                        if target_proc: break
                    
                    if target_proc:
                        alert_msg = f"Process {p.name} (PID: {p.pid}) connected to local process {target_proc} on port {net.dest_port}"
                    else:
                        alert_msg = f"Process {p.name} (PID: {p.pid}) connected to local port {net.dest_port} (Unknown process)"
                else:
                    import socket
                    loop = asyncio.get_running_loop()
                    try:
                        hostname, _, _ = await loop.run_in_executor(None, socket.gethostbyaddr, net.dest_ip)
                        alert_msg = f"Process {p.name} (PID: {p.pid}) connected to {hostname} ({net.dest_ip})"
                    except Exception:
                        alert_msg = f"Process {p.name} (PID: {p.pid}) connected to new IP: {net.dest_ip}"
                        
                    is_malicious = await loop.run_in_executor(None, sync_check_virustotal, net.dest_ip)
                    if is_malicious:
                        severity = "critical"
                        alert_msg = f"[MALICIOUS IP DETECTED by VirusTotal] {alert_msg}"

                return {
                    "type": "alert",
                    "severity": severity,
                    "message": alert_msg,
                    "pid": p.pid,
                    "process_name": p.name,
                    "remote_ip": net.dest_ip
                }

            if alerts_to_process:
                alerts = await asyncio.gather(*(resolve_and_format(p, net) for p, net in alerts_to_process))
            
            for alert in alerts:
                await manager.broadcast(json.dumps(alert))
                
        await asyncio.sleep(60)
