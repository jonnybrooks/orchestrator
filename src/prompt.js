#!/usr/bin/env node

require('dotenv').config();
const pathUtils = require('path');
const inquirer = require('inquirer');
const config = require('./config');
const utils = require('./utils');
const tmux = require('./tmux');

const services = require('../config/services.json');
const selectedByDefault = require('../config/selectedByDefault.json');

;(async function () {
    //
    // Prompt
    // 
    
    const selectedByDefaultSet = new Set(selectedByDefault);
    const prompts = [];
    if(typeof services.backends === 'object' && Object.keys(services.backends).length > 0) {
        prompts.push({
            name: "backends",
            message: "Which backends would you like to run?",
            type: "checkbox",
            choices: Object.keys(services.backends).map((path) => ({
                name: pathUtils.basename(path),
                value: path,
                checked: selectedByDefaultSet.has(path)
            })),
        });
    }
        
    if(typeof services.graphqls === 'object' && Object.keys(services.graphqls).length > 0) {
        prompts.push({
            name: "graphqls",
            message: "Which graphql servers would you like to run?",
            type: "checkbox",
            choices: Object.keys(services.graphqls).map((path) => ({
                name: pathUtils.basename(path),
                value: path,
                checked: selectedByDefaultSet.has(path)
            })),
        });
    }
    
    if(typeof services.frontends === 'object' && Object.keys(services.frontends).length > 0) {
        prompts.push({
            name: "frontends",
            message: "Which frontends would you like to run?",
            type: "checkbox",
            choices: Object.keys(services.frontends).map((path) => ({
                name: pathUtils.basename(path),
                value: path,
                checked: selectedByDefaultSet.has(path)
            })),
        });
    }

    //
    // Generate config
    // 

    const choices = await inquirer.prompt(prompts);

    const backends = (choices.backends ?? [])
        .map((path) => [path, services.backends[path]])
        .map(([path, config]) => utils.defineBackend(path, config));

    const graphqls = (choices.graphqls ?? [])
        .map((path) => [path, services.backends[path]])
        .map(([path, config]) => utils.defineGraphql(backends, path, config));
    
    const frontends = (choices.frontends ?? [])
        .map((path) => [path, services.backends[path]])
        .map(([path, config]) => utils.defineFrontend(path, config));

    const gateway = utils.defineGraphql([], config.gatewayPath, {
        "delay": 10000, // give the gateway some time for the other servers to start
        "env": {
            "PORT": config.gatewayPort,
            ...utils.unwrapGraphqlEnvUrls(graphqls)
        }
    });

    //
    // Run
    // 

    await tmux.runServices([
        ...backends,
        ...graphqls,
        ...frontends,
        gateway 
    ]);
})();
