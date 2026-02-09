#!/bin/bash

# Start the FastAPI backend server
echo "Starting Resume Optimizer Backend..."
echo "Make sure you've installed dependencies: pip install -r requirements.txt"
echo ""

cd "$(dirname "$0")"
python3 main.py

