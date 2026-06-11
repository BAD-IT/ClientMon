# /// script
# dependencies = [
#   "starlette==0.41.3",
#   "uvicorn==0.32.1",
#   "websockets==14.1",
#   "psutil==6.1.0",
#   "python-dotenv==1.0.1"
# ]
# ///
import os
import asyncio
from dotenv import load_dotenv
from starlette.applications import Starlette

load_dotenv()
from starlette.routing import Route, WebSocketRoute
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from routes import api_get_processes, api_get_process, api_ignore_ip, api_whois, websocket_endpoint
from tasks import background_monitor
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from db import init_db

async def startup_event():
    init_db()
    asyncio.create_task(background_monitor())

routes = [
    Route("/api/processes", api_get_processes),
    Route("/api/process/{pid:int}", api_get_process),
    Route("/api/ignore_ip", api_ignore_ip, methods=["POST"]),
    Route("/api/whois/{ip:path}", api_whois),
    WebSocketRoute("/ws", websocket_endpoint),
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
]

app = Starlette(debug=True, routes=routes, middleware=middleware, on_startup=[startup_event])

if __name__ == "__main__":
    import uvicorn
    if os.geteuid() != 0:
        print("\n(!) WARNING: Not running as root.")
        print("You MUST run with 'sudo venv/bin/python main.py' to monitor system apps properly.\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
