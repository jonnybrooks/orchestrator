#!/usr/bin/env bash

set -e

ROOT=$(dirname $(realpath "$0"))

if ! [ -f $HOME/.tmux.conf ]; then
    echo "No tmux config found. Creating..."
    cp -a $ROOT/config/.tmux.conf.shadow $HOME/.tmux.conf
fi

source $ROOT/.env
SESSION_ID="orchestrator_$(openssl rand -hex 8)"
PATH_TO_SESSION_FILE="/tmp/$SESSION_ID.txt"

$ROOT/src/prompt.js $PATH_TO_SESSION_FILE
SESSION_NAME=$(cat $PATH_TO_SESSION_FILE)
rm $PATH_TO_SESSION_FILE
tmux attach -t $SESSION_NAME
