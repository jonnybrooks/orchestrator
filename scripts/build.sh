#!/usr/bin/env bash
set -e

APP_ROOT=$(dirname $(python -c "import os; print(os.path.realpath('$0/..'))"))
CONFIG_ROOT="${XDG_CONFIG_HOME:-$HOME/.config}/orchestrator"
DATA_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/orchestrator"

mkdir -p $CONFIG_ROOT
mkdir -p $DATA_ROOT
mkdir -p ./out

function create_if_not_exists {
    if ! [ -f $1 ]; then
        echo "File $(basename $1) not found. Creating..."
        cp -a $2 $1
    fi
}

# Create default config files if they don't exist
create_if_not_exists $HOME/.tmux.conf $APP_ROOT/data/.tmux.conf
create_if_not_exists $CONFIG_ROOT/config.toml $APP_ROOT/data/config.toml
create_if_not_exists $CONFIG_ROOT/plugin.ts $APP_ROOT/data/plugin.ts
create_if_not_exists $DATA_ROOT/lastChoices.json $APP_ROOT/data/lastChoices.json

./node_modules/.bin/tsc
./node_modules/.bin/dts-bundle-generator \
    src/exports.ts \
    -o out/exports.d.ts  \
    --external-inlines zod \
    --inline-declare-global \
    --no-banner \
    --no-check

cp -a out/exports.d.ts $CONFIG_ROOT/exports.d.ts
cp -a out/exports.d.ts data/exports.d.ts
