# orchestrator

## Prerequisites
- node/npm: 
- tmux: https://github.com/tmux/tmux/wiki/Installing

## Configuring
- This script will copy files from `./config.shadow` to `./config` if they don't already exist there
- Update `config/services.json` to list the paths to the services you want to launch
- Update `config/selectedByDefault.json` to select which services get selected by default (makes common case easier)
- Update `config/defaultCommands.json` if you want to specify a list of default commands for a given service group

# Usage
- Run `npm ci && npm link` in the root of the directory to install the package and enable running the `orchestrate` command globally
- This command will list the services as defined in `config/services.json` and will prompt you to select which services you'd like to run in tandem
- This will spawn each service in its own tmux window
    - You can navigate to prev/next windows with `<PREFIX>,p` / `<PREFIX>,n` respectively
    - The default tmux `<PREFIX>` is `ctrl+b`
