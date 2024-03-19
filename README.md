# orchestrator

`orchestrator` is a simple tool for launching your backend, graphql and frontend services locally, in parallel, in order to closely appromxiate and troubleshoot your e2e application infrastructure locally.

It utilises `tmux`, a terminal multiplexing utility, to spawn each service as a virtual window within a single navigable session, as well as automatically doing all of the environment variable plumbing necessary for the services to communicate with eachother.

This tool provides a CLI which prompts you to select which services you'd like to launch, from a list you configure yourself:

<div style="text-align: center; padding: 10px 0;">
    <img src='data/demo.webp' width='600'>
</div>

## Prerequisites
- node/npm: https://nodejs.org/en/download
- tmux: https://github.com/tmux/tmux/wiki/Installing

## Configuring
- This script will create config files from defaults in `./config.shadow` if they don't already exist
- Update `./config.json` to configure the CLI and how services are launched. `config.json` contains 3 top-level fields for configuration:
    ```json
    {
        "services": { ... },
        "defaultCommands": { ... },
        "selectedByDefault": [ ... ],
    }
    ```
    
    `services` defines every service you want to be launchable by the CLI. Each service is grouped by type into either `backends`, `graphqls` or `frontends` so that sensible defaults can be applied on service launch (which can be overridden as explained in the following section).
    
    The keys of each group are absolute paths to each service's codebase root, and each service's default config can be overidden by explicitly declaring the service object's fields here. The following fields are configurable:

    | Field | Type | Description |
    |-------|------|-------------|
    | `label` | string | The label given to the service, and to the service's window in tmux. |
    | `delay` | number | A delay (in seconds) to wait before launching the service. |
    | `env` | object | Define environment variables in the launched service, including e.g. `PORT` for backends and `CLI_SERVER_PORT` for frontends. |
    | `commands` | array | The list of commands to run when `cd`'ing to the codebase root, in order to launch the service. Specifying this field at all will prevent running any commands defined in the `defaultCommands` for this service's group. |

    `defaultCommands` allows you to define a list of default commands to run for each service group. When orchestrator launches a tmux window for each service, it will first `cd` into that service's root and then execute all of the commands defined in the default commands array for that service's group. This is useful if most of the services belonging to each group have identical launching characteristics; for any service deviating from the default, these commands can be overriden per-service by the `commands` field defined above.

    `selectedByDefault` Is a list containing absolute paths (as in `services`) to all services you'd like to be selected in the CLI by default, to save you a bit of time launching your most common workflow.

- There are some additional configuration options which can be specified by environment variables (which can be defined in `./.env`):

    | Field | Description | Default |  |
    |---|---|---|---|
    | `BASE_SERVICE_PORT` | The port to start incrementing from for use in each service. | 8000 |  |
    | `GATEWAY_PORT` | The port for the graphql gateway service. | 9000 |  |
    | `GATEWAY_PATH` | The path to the graphql gateway service's codebase root. | ~/code/graphql-gateway |  |
    | `RANDOMISE_SESSION_NAME` | If 1, the tmux session name will be randomly generated, so that multiple sessions can be generated. If 0, The session name will be `STATIC_SESSION_NAME` | 0 |  |
    | `STATIC_SESSION_NAME` | If `RANDOMISE_SESSION_NAME` is 0, the name to be used for the session. | orchestrator |  |
    | `OVERWRITE_PANE_LABEL` | If 1, use ANSI escape codes to overwrite each tmux window's label with the service's label. Only makes sense if `set -g pane-border-status top` is present in `~/.tmux.conf`. | 1 |  |
    
    

# Usage
- Run `npm ci && npm link` in the root of the directory to install the package and enable running the `orchestrate` command globally.
- This command will list the services as defined in `config.json#services` and will prompt you to select which services you'd like to run in tandem.
- Use the arrow keys to navigate choices, space to toggle a selection, and enter to proceed.
- `orchestrate` will spawn each service selected within the same tmux session in its own window.
- It will also automatically spawn a service not listed, namely the service for a graphql gateway / supergraph. This service can be specified by environment variables (as detailed later in this section).
- Finally this tool will automatically attach itself to the tmux session
    - You can navigate to prev/next windows with `<PREFIX>,p` / `<PREFIX>,n` respectively
    - The default tmux `<PREFIX>` is `ctrl+b`