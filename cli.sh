#!/usr/bin/env bash

set -e

source .env
SESSION_ID="orchestrator_$(openssl rand -hex 8)"
PATH_TO_SESSION_FILE="/tmp/$SESSION_ID.txt"

./src/prompt.js $PATH_TO_SESSION_FILE
SESSION_NAME=$(cat $PATH_TO_SESSION_FILE)
rm $PATH_TO_SESSION_FILE
tmux attach -t $SESSION_NAME
