import psutil
import subprocess
from typing import List, Optional
from models import NetworkActivity, ProcessInfo, FileAccess

def format_addr(addr) -> str:
    if not addr: return ""
    return f"{addr.ip}:{addr.port}"

def get_all_processes() -> List[ProcessInfo]:
    processes = []
    
    # Gather all connections in a single pass (O(N) optimization)
    conn_map = {}
    try:
        all_conns = psutil.net_connections(kind='inet')
        for conn in all_conns:
            if conn.pid is not None:
                if conn.pid not in conn_map:
                    conn_map[conn.pid] = []
                
                dest_ip = conn.raddr.ip if conn.raddr else None
                dest_port = conn.raddr.port if conn.raddr else None
                remote_str = f"{format_addr(conn.laddr)} -> {format_addr(conn.raddr)}" if conn.raddr else f"{format_addr(conn.laddr)} (Listening)"
                
                conn_map[conn.pid].append(NetworkActivity(
                    remote_address=remote_str,
                    port=conn.laddr.port if conn.laddr else 0, 
                    status=conn.status,
                    protocol="TCP" if conn.type == 1 else "UDP",
                    dest_ip=dest_ip,
                    dest_port=dest_port
                ))
    except (psutil.AccessDenied, PermissionError):
        pass
        
    for proc in psutil.process_iter(['pid', 'name', 'exe', 'cpu_percent', 'memory_info']):
        try:
            p_info = proc.info
            pid = p_info['pid']
            mem_mb = p_info['memory_info'].rss / (1024 * 1024) if p_info['memory_info'] else 0

            connections = conn_map.get(pid, [])
            exe_path = p_info.get('exe') or ""

            processes.append(ProcessInfo(
                pid=pid,
                name=p_info['name'] or "Unknown",
                path=exe_path,
                cpu_percent=p_info['cpu_percent'] or 0.0,
                memory_mb=mem_mb,
                network_activities=connections,
                unique_file_paths=[]
            ))
        except (psutil.NoSuchProcess, psutil.AccessDenied, PermissionError):
            continue
    return processes

def get_process_details(pid: int) -> Optional[ProcessInfo]:
    try:
        proc = psutil.Process(pid)
        mem_mb = proc.memory_info().rss / (1024 * 1024)
        
        connections = []
        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.pid == pid:
                    dest_ip = conn.raddr.ip if conn.raddr else None
                    dest_port = conn.raddr.port if conn.raddr else None
                    remote_str = f"{format_addr(conn.laddr)} -> {format_addr(conn.raddr)}" if conn.raddr else f"{format_addr(conn.laddr)} (Listening)"
                    
                    connections.append(NetworkActivity(
                        remote_address=remote_str,
                        port=conn.laddr.port if conn.laddr else 0,
                        status=conn.status,
                        protocol="TCP" if conn.type == 1 else "UDP",
                        dest_ip=dest_ip,
                        dest_port=dest_port
                    ))
        except (psutil.AccessDenied, PermissionError):
            pass
                
        unique_file_paths = []
        try:
            out = subprocess.check_output(['lsof', '-p', str(pid), '-F', 'fn'], stderr=subprocess.DEVNULL, text=True)
            lines = out.split('\\n')
            current_mode = "R"
            
            for line in lines:
                if not line:
                    continue
                type_char = line[0]
                val = line[1:]
                
                if type_char == 'f':
                    if val.endswith('r'):
                        current_mode = "R"
                    elif val.endswith('w'):
                        current_mode = "W"
                    elif val.endswith('u'):
                        current_mode = "R/W"
                    else:
                        current_mode = "R"
                elif type_char == 'n':
                    if val.startswith('/'):
                        unique_file_paths.append(FileAccess(path=val, mode=current_mode))
        except Exception:
            pass
            
        seen = set()
        deduped_files = []
        for fa in unique_file_paths:
            if fa.path not in seen:
                seen.add(fa.path)
                deduped_files.append(fa)

        return ProcessInfo(
            pid=pid, 
            name=proc.name(), 
            path=proc.exe() if getattr(proc, 'exe', None) else "", 
            cpu_percent=proc.cpu_percent(), 
            memory_mb=mem_mb,
            network_activities=connections,
            unique_file_paths=deduped_files
        )
    except (psutil.NoSuchProcess, psutil.AccessDenied, PermissionError):
        return None
