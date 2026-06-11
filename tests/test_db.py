import os
import tempfile
import pytest

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../src'))
import db

@pytest.fixture
def temp_db():
    fd, path = tempfile.mkstemp()
    os.close(fd)
    original_path = db.DB_PATH
    db.DB_PATH = path
    
    db.init_db()
    
    yield path
    
    db.DB_PATH = original_path
    os.remove(path)

def test_whitelist_persistence(temp_db):
    ips = db.get_whitelisted_ips()
    assert len(ips) == 0
    
    db.add_whitelisted_ip("192.168.1.1")
    db.add_whitelisted_ip("10.0.0.1")
    
    ips = db.get_whitelisted_ips()
    assert len(ips) == 2
    assert "192.168.1.1" in ips
    assert "10.0.0.1" in ips
    
    # Test deduplication / IGNORE
    db.add_whitelisted_ip("10.0.0.1")
    ips = db.get_whitelisted_ips()
    assert len(ips) == 2
