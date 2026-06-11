import sys
import os
from starlette.responses import JSONResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from engine import get_all_processes, get_process_details
from websocket_manager import manager

async def api_get_processes(request):
    procs = get_all_processes()
    summaries = []
    for p in procs:
        summaries.append({
            "pid": p.pid,
            "name": p.name,
            "memory_mb": round(p.memory_mb, 1),
            "cpu_percent": round(p.cpu_percent, 1),
            "network_count": len(p.network_activities),
            "is_user_app": ".app/Contents/MacOS" in p.path
        })
    return JSONResponse(summaries)

async def api_get_process(request):
    pid = int(request.path_params['pid'])
    proc = get_process_details(pid)
    if proc:
        data = proc.__dict__.copy()
        data['network_activities'] = [n.__dict__ for n in data['network_activities']]
        data['unique_file_paths'] = [f.__dict__ for f in data['unique_file_paths']]
        return JSONResponse(data)
    return JSONResponse({"error": "Process not found"}, status_code=404)

import subprocess
import re
import socket

async def api_ignore_ip(request):
    try:
        data = await request.json()
        ip = data.get("ip")
        if ip:
            from engine import WHITELISTED_IPS
            WHITELISTED_IPS.add(ip)
            return JSONResponse({"status": "ok"})
        return JSONResponse({"error": "No IP provided"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def api_whois(request):
    ip_param = request.path_params['ip']
    match = re.search(r"ip='([^']+)'", ip_param)
    ip_to_lookup = match.group(1) if match else ip_param

    try:
        try:
            hostname, aliaslist, ipaddrlist = socket.gethostbyaddr(ip_to_lookup)
            org = hostname
        except socket.error:
            out = subprocess.check_output(['whois', ip_to_lookup], stderr=subprocess.DEVNULL, text=True)
            org = "Unknown Provider"
            for line in out.split('\\n'):
                lower = line.lower()
                if lower.startswith("orgname:") or lower.startswith("org-name:") or lower.startswith("descr:"):
                    org = line.split(':', 1)[1].strip()
                    break
        return JSONResponse({"ip": ip_to_lookup, "provider": org})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
