#!/usr/bin/env node
const pathUtils = require('path');
const inquirer = require('inquirer');
const config = require('./config');
const utils = require('./utils');
const tmux = require('./tmux');
const hydrateService = require('./hydrateService');

;(async function () {
    //
    // Prompt user for choices
    //
    
    const choices = {};
    const promptGroups = {};
    
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
            promptGroup.choices.push({
                name: label,
                checked: !!service.selectedByDefault,
                value: service,
            })
        }
        
        if(config.groups[group]?.hideInCli) {
            delete promptGroups[group];
        }
    });

    const promptChoices = await inquirer.prompt(Object.values(promptGroups).flat());
    for(const [group, services] of Object.entries(promptChoices)) {
        choices[group].push(...services);
    }

    //
    // Compose service definitions
    //
    
    const serviceDefs = [];
    const context = {};

    Object.values(choices).flat().forEach((service) => {
        const group = config.groups[service.group] || {};
        const def = utils.defineBaseService(context, group, service, serviceDefs);
        serviceDefs.push(def);
    });
    
    serviceDefs.forEach((service) => {
        const group = config.groups[service.group] || {};
        hydrateService(context, group, service, serviceDefs);
    });

    //
    // Run services
    // 
    
    await tmux.runServices(serviceDefs);
})();
