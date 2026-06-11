from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class NetworkActivity:
    remote_address: str
    port: int
    status: str  # e.g., "ESTABLISHED", "LISTEN"
    protocol: str  # e.g., "TCP", "UDP"

@dataclass
class ProcessInfo:
    pid: int
    name: str
    path: str
    cpu_percent: float
    memory_mb: float
    network_activities: List[NetworkActivity] = field(default_factory=list)
    unique_file_paths: set = field(default_factory=set)

    def to_summary(self):
        """Provides the 'not too long, not too short' summary view."""
        return {
            "name": self.name,
            "pid": self.pid,
            "status": "Running",
            "network_count": len(self.network_activities),
            "activity_summary": list(self.unique_file_paths) if self.unique_file_paths else "No file activity detected."
        }
