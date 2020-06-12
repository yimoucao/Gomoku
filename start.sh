#!/bin/sh

serve -s -n -l 8080 build &

python3 server/server.py