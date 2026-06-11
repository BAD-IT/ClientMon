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
            
            for p in procs:
                for net in p.network_activities:
                    from db import get_whitelisted_ips
                    whitelist = get_whitelisted_ips()
                    # Very simple alert logic: "New IP Detected"
                    if net.remote_address != "Local/Listening" and net.remote_address not in known_ips and net.remote_address not in whitelist:
                        known_ips.add(net.remote_address)
                        alerts.append({
                            "type": "alert",
                            "severity": "high",
                            "message": f"Process {p.name} (PID: {p.pid}) connected to new IP: {net.remote_address}",
                            "pid": p.pid,
                            "process_name": p.name,
                            "remote_ip": net.remote_address
                        })
            
            for alert in alerts:
                await manager.broadcast(json.dumps(alert))
                
        await asyncio.sleep(60)
