#!/usr/bin/env python3
import os
import subprocess
import sys
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent
    env = os.environ.copy()
    node_path = root / 'index.js'
    subprocess.check_call(['node', str(node_path)], env=env)

if __name__ == '__main__':
    main()
