const inquirer = require('inquirer');
import * as pathUtils from 'path';
import * as fs from 'fs';
import { register } from "ts-node";
import { Service, ServiceConfig, UserData } from "./types";
import { PluginContext } from './plugin-types';
import * as tmux from './tmux';
import config, { CONFIG_ROOT } from './config';
import args from './args';
import * as utils from './utils';


const DATA_ROOT = pathUtils.join(
    process.env.XDG_DATA_HOME ?? `${process.env.HOME}/.local/share`,
    'orchestrator'
);

const LAST_CHOICES_PATH = pathUtils.join(DATA_ROOT, 'lastChoices.json');

export type PromptChoice = {
    name: string,
    checked: boolean,
    value: ServiceConfig,
};

export type PromptGroup = {
    name: string,
    message: string,
    type: string,
    choices: PromptChoice[],
};


function renamePane(label: string) {
    return `printf '\x1b]2;${label}\x07'`;
}

// Reads lastChoices.json, falling back to an empty selection if it's missing or unreadable.
// It's only a convenience cache, so a bad file should never stop the CLI from running.
function loadLastChoices(): string[] {
    let data: string;
    try {
        data = fs.readFileSync(LAST_CHOICES_PATH, 'utf8');
    }
    catch(e) {
        if((e as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`Warning: couldn't read ${LAST_CHOICES_PATH}. Starting with an empty selection.`);
        }
        return [];
    }

    try {
        const lastChoices = JSON.parse(data);
        if(!Array.isArray(lastChoices) || lastChoices.some((choice) => typeof choice !== 'string')) {
            throw new Error('expected an array of service names');
        }
        return lastChoices;
    }
    catch(e) {
        console.error(`Warning: ${LAST_CHOICES_PATH} was invalid. Starting with an empty selection.`);
        return [];
    }
}

// Re-select whatever was chosen last time, i.e. every choice already ticked by lastChoices.json.
function selectPreviousChoices(promptGroups: Record<string, PromptGroup>) {
    const ret: Record<string, ServiceConfig[]> = {};
    Object.entries(promptGroups).forEach(([group, promptGroup]) => {
        ret[group] = promptGroup.choices
            .filter(({checked}) => checked)
            .map(({value}) => value);
    });
    return ret;
}

;(async function () {
    //
    // Load the plugin.ts, lastChoices.json
    //   
    
    register({ transpileOnly: true, moduleTypes: { '*': 'cjs' } });
    const pluginPath = pathUtils.join(CONFIG_ROOT, "plugin.ts");
    const plugin: PluginInterface = await import(pluginPath);
    if(!plugin) {
        console.error(`Unable to load plugin at path: ${pluginPath}`);
        return;
    }

    const lastChoices = loadLastChoices();

    //
    // Prompt user for choices
    //
    
    const choices: Record<string, ServiceConfig[]> = {};
    const promptGroups: Record<string, PromptGroup> = {};
    
    config.services.forEach((service) => {
        const group = service.group;
        
        if(!choices[group]) choices[group] = [];
        
        if(!promptGroups[group]) promptGroups[group] = {
            name: group,
            message: `Which services in group '${group}' would you like to run?`,
            type: "checkbox",
            choices: []
        };

        const promptGroup = promptGroups[group];

        if(service.alwaysRun) {
            choices[group].push(service);
        }
        else {
            const label = pathUtils.basename(service.path);
            const checked = lastChoices.includes(label);
            promptGroup.choices.push({
                checked,
                name: label,
                value: service,
            })
        }
        
        const hideInCli = config.services
            .filter((service) => service.group === group)
            .every((service) => !!service.alwaysRun);
        
        if(hideInCli) {
            delete promptGroups[group];
        }
    });

    const promptChoices: Record<string, ServiceConfig[]> = args.runPrevious
        ? selectPreviousChoices(promptGroups)
        : await inquirer.prompt(Object.values(promptGroups).flat());
    for(const [group, services] of Object.entries(promptChoices)) {
        choices[group].push(...services);
    }

    //
    // Compose service definitions
    //
    
    const chosenServices = Object.values(choices).flat();
    if(!chosenServices.length) {
        console.error(args.runPrevious
            ? 'No previous services to run. Run `orchestrate` without --run-previous to choose some.'
            : 'No services selected. Nothing to run.');
        process.exit(1);
    }

    const chosenServiceNames = chosenServices
        .filter((service) => !service.alwaysRun)
        .map(({path}) => pathUtils.basename(path));
    try {
        fs.mkdirSync(DATA_ROOT, { recursive: true });
        fs.writeFileSync(LAST_CHOICES_PATH, JSON.stringify(chosenServiceNames));
    }
    catch(e) {
        console.error(`Warning: couldn't save your selection to ${LAST_CHOICES_PATH}.`);
    }
    
    // populate serviceDefs with base service defintions from config.toml
    const serviceDefs: Service[] = [];
    const userData: UserData = {};
    chosenServices.forEach((service) => {
        const group = config.groups?.[service.group] || {};
        const label = pathUtils.basename(service.path);
        serviceDefs.push({
            ...service,
            label: service.label || label,
            delay: service.delay || 0,
            env: service.env || {},
            alwaysRun: service.alwaysRun || false,
            commands: [
                ...(config.overwritePaneLabel ? [renamePane(label)] : []),
                ...(service.commands || group.defaultCommands || [])
            ],
        });
    });

    
    // Run 2-pass hydration
    const baseCtx: Pick<PluginContext, 'config' | 'serviceDefs' | 'utils' | 'pass'> = {
        config,
        serviceDefs,
        utils,
        pass: 0,
    };

    for(let pass = 1; pass <= 2; pass++)
    {
        serviceDefs.forEach((service) => {
            const group = config.groups?.[service.group] || {};
            const ctx: PluginContext = { ...baseCtx, group, service, pass };
            plugin.hydrateService(ctx, userData);
        });
    }

    //
    // Run services
    // 
    
    await tmux.runServices(serviceDefs);
})();
