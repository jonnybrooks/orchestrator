const inquirer = require('inquirer');
import * as path from 'path';
import { Service, PromptGroup, ServiceConfig } from "./types";
import * as utils from './utils';
import * as tmux from './tmux';
import config from './config';

;(async function () {
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
            const label = path.basename(service.path);
            promptGroup.choices.push({
                name: label,
                checked: !!service.selectedByDefault,
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

    const promptChoices: Record<string, Service[]> = await inquirer.prompt(Object.values(promptGroups).flat());
    for(const [group, services] of Object.entries(promptChoices)) {
        choices[group].push(...services);
    }

    //
    // Compose service definitions
    //
    
    const serviceDefs: Service[] = [];
    const context = {};

    Object.values(choices).flat().forEach((service) => {
        const group = config.groups?.[service.group] || {};
        const def = utils.defineBaseService(context, group, service);
        serviceDefs.push(def);
    });

    const plugin = await import(path.resolve(__dirname, 'plugin'));
    serviceDefs.forEach((service) => {
        const group = config.groups?.[service.group] || {};
        plugin.hydrateService(context, group, service, serviceDefs);
    });

    //
    // Run services
    // 
    
    await tmux.runServices(serviceDefs);
})();
