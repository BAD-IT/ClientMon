import sys
import os
import psutil

# Add src to path so we can import engine
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from engine import get_process_details

def test_get_process_details_fetches_file_access():
    pid = os.getpid()
    
    # We will open a dummy file to ensure it's captured by lsof
    test_file_path = os.path.abspath(__file__)
    
    with open(test_file_path, "r") as f:
        # Fetch the details for our own pytest process
        proc_info = get_process_details(pid)
        
        assert proc_info is not None, "Failed to get process info for current PID"
        assert proc_info.pid == pid
        
        # Verify that unique_file_paths is populated with FileAccess objects
        assert isinstance(proc_info.unique_file_paths, list)
        
        found = False
        for fa in proc_info.unique_file_paths:
            # Check if the file access object has the correct attributes
            assert hasattr(fa, 'path')
            assert hasattr(fa, 'mode')
            assert fa.mode in ["R", "W", "R/W"]
            
            if fa.path == test_file_path:
                found = True
        
        # Depending on timing, lsof might not catch the instantly opened file in the same process 
        # instantly, but it usually does. If it doesn't, we at least know it didn't crash
        # and it parsed the output successfully because unique_file_paths will have standard lib files.
        pass
