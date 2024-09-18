#!/usr/bin/env bash
set -e

ROOT=$(dirname $(python -c "import os; print(os.path.realpath('$0/..'))"))

function create_if_not_exists {
    if ! [ -f $1 ]; then
        echo "File $(basename $1) not found. Creating..."
        cp -a $2 $1
    fi
}

# Create default config files if they don't exist
create_if_not_exists $HOME/.tmux.conf $ROOT/data/.tmux.conf
create_if_not_exists $ROOT/config.toml $ROOT/data/config.toml
create_if_not_exists $ROOT/src/plugin.ts $ROOT/data/defaultPlugin.ts

mkdir -p ./out
./node_modules/.bin/tsc
