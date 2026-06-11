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

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
