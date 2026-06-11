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
import urllib.request
import json

async def api_ignore_ip(request):
    try:
        data = await request.json()
        ip = data.get("ip")
        if ip:
            from db import add_whitelisted_ip
            add_whitelisted_ip(ip)
            return JSONResponse({"status": "ok"})
        return JSONResponse({"error": "No IP provided"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def api_whois(request):
    ip_param = request.path_params['ip']
    match = re.search(r"ip='([^']+)'", ip_param)
    ip_to_lookup = match.group(1) if match else ip_param

    try:
        req = urllib.request.Request(f"http://ipinfo.io/{ip_to_lookup}/json", headers={'User-Agent': 'curl/7.68.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
        
        provider = data.get("org", "Unknown Provider")
        city = data.get("city", "Unknown City")
        region = data.get("region", "")
        country = data.get("country", "")
        
        return JSONResponse({
            "ip": ip_to_lookup, 
            "provider": provider,
            "city": city,
            "region": region,
            "country": country
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
