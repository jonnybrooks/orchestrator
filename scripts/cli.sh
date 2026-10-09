#!/usr/bin/env bash
set -e

APP_ROOT=$(dirname $(python -c "import os; print(os.path.realpath('$0/..'))"))

# Create a unique session ID and temp file path to pass to the orchestrator
# source $APP_ROOT/.env
SESSION_ID="orchestrator_$(openssl rand -hex 8)"
PATH_TO_SESSION_FILE="/tmp/$SESSION_ID.txt"

# Execute the script, forwarding any user-supplied options (e.g. -p/--run-previous)
node $APP_ROOT/out/cli.js $PATH_TO_SESSION_FILE "$@"

# The session file only exists if services were launched, so there's nothing to attach to otherwise
if [ -f $PATH_TO_SESSION_FILE ]; then
    SESSION_NAME=$(cat $PATH_TO_SESSION_FILE)
    rm $PATH_TO_SESSION_FILE

    # Attach to the tmux session
    tmux attach -t $SESSION_NAME
fi
