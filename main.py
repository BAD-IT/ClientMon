# /// script
# dependencies = [
#   "starlette==0.41.3",
#   "uvicorn==0.32.1",
#   "websockets==14.1",
#   "psutil==6.1.0"
# ]
# ///
import os
import asyncio
from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from routes import api_get_processes, api_get_process, websocket_endpoint
from tasks import background_monitor

async def startup_event():
    asyncio.create_task(background_monitor())

routes = [
    Route("/api/processes", api_get_processes),
    Route("/api/process/{pid:int}", api_get_process),
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
