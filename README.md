# (orch)estrator

`orchestrator` is a simple tool for launching your services locally, in parallel, in order to approximate your e2e infrastructure locally for testing updates without needing to deploy.

To do this it utilises `tmux`, a terminal multiplexing utility, to spawn each service as a virtual window within a single session, as well as automatically doing all of the environment variable plumbing necessary for the services to communicate with eachother.

This tool provides a CLI which prompts you to select which services you'd like to launch, from a list you configure yourself manually:

<div style="text-align: center; padding: 10px 0;">
    <img src='data/demo.webp' width='600'>
</div>

## Prerequisites
- node/npm: https://nodejs.org/en/download
- tmux: https://github.com/tmux/tmux/wiki/Installing

## Configuring
- This script will create config files from defaults in `./data` if they don't already exist.
- Update `./config.toml` to configure the CLI and how services are launched. Take a look at the file's comments for directions on how to configure your services.
- Update the generated `src/plugin.ts` to customise the logic for defining each service's config at runtime.
    - For now all this plugin does is expose a single function called `hydrateService` which allows you to define custom logic for how each service should be spawned. This code is commented to make it clear how you might customise it yourself.
    - For example, it switches on each service's group and populates each `env` field with the variables it needs to communicate with its downstream services.

## Usage
- Run `npm install` in the root of the directory to install the package and enable running the `orchestrate` command globally.
- This command will list the services as defined in `config.toml#services` and will prompt you to select which services you'd like to run in tandem.
- Use the arrow keys to navigate choices, space to toggle a selection, and enter to proceed.
- `orchestrate` will spawn each service selected within the same tmux session in its own window.
- Finally this tool will automatically attach itself to the tmux session
    - You can navigate to prev/next windows with `<PREFIX>,p` / `<PREFIX>,n` respectively
    - The default tmux `<PREFIX>` is `ctrl+b`
