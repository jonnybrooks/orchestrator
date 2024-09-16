#!/usr/bin/env bash

set -e

ROOT=$(dirname $(python -c "import os; print(os.path.realpath('$0'))"))

function create_config_if_not_exist {
    if ! [ -f $1 ]; then
        echo "Config file $(basename $1) not found. Creating..."
        cp -a $2 $1
    fi
}

# Create default config files if they don't exist
mkdir -p $ROOT/config
create_config_if_not_exist $HOME/.tmux.conf $ROOT/config.shadow/.tmux.conf
create_config_if_not_exist $ROOT/config.toml $ROOT/config.shadow/config.toml

# Create a unique session ID and temp file path to pass to the orchestrator
# source $ROOT/.env
SESSION_ID="orchestrator_$(openssl rand -hex 8)"
PATH_TO_SESSION_FILE="/tmp/$SESSION_ID.txt"

# Execute the script
node $ROOT/out/cli.js $PATH_TO_SESSION_FILE
SESSION_NAME=$(cat $PATH_TO_SESSION_FILE)
rm $PATH_TO_SESSION_FILE

# Attach to the tmux session
tmux attach -t $SESSION_NAME
