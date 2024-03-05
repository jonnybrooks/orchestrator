# orchestrator

## Prerequisites
- Install tmux: https://github.com/tmux/tmux/wiki/Installing
- Update `config/services.json` to list the paths to the services you want to launch
- Update `config/selectedByDefault.json` to select which services get selected by default (makes common case easier)
- Update `config/defaultCommands.json` if you want to specify a list of default commands for a given service group
- If you want to configure tmux, create `$HOME/.tmux.conf` and define your commands there

## Using
- Run `npm link` in the root of the directory to enable running the `orchestrate` command globally
- This command will list the services as defined in services.json and will allow you to select which to run in parallel
- This will create each service in its own tmux window, rather than in split panes
    - You can navigate to prev/next windows with `ctrl+b,p` / `ctrl+b,n` respectively
