const pathUtils = require('path');
const config = require('./config');
const { defaultCommands } = require('../config.json');

let next_port = config.baseServicePort;

//
// Unwrap utils
// 

function unwrapBackendEnvUrls(backends) {
    const ret = {};
    backends.forEach((service) => {
        const serverName = service.label.toUpperCase().replace('-', '_');
        const key = `${serverName}_URL`;
        ret[key] = `http://127.0.0.1:${service.env.PORT}/`
    });
    return ret;
}

function unwrapGraphqlEnvUrls(graphqls) {
    const ret = {};
    graphqls.forEach((service) => {
        const server_name = service.label.toUpperCase().replace('-', '_');
        const key = `${server_name}_URL`;
        ret[key] = `http://localhost:${service.env.PORT}/graphql`
    });
    return ret;
}

//
// Define services
// 

function renamePane(label) {
    return `printf '\x1b]2;${label}\x07'`;
}

function defineBackend(path, overrideConfig = {}) {
    const label = pathUtils.basename(path);
    return {
        cwd: path,
        label: overrideConfig.label || label,
        delay: overrideConfig.delay || 0,
        env: { "PORT": next_port++, ...(overrideConfig.env || {}) },
        commands: [
            ...(config.overwritePaneLabel ? [renamePane(label)] : []),
            ...(overrideConfig.commands || defaultCommands.backends || [])
        ],
    };
}

function defineGraphql(backends, path, overrideConfig = {}) {
    const label = pathUtils.basename(path);
    return {
        cwd: path,
        label: overrideConfig.label || label,
        delay: overrideConfig.delay || 0,
        env: { 
            "PORT": next_port++,
            ...unwrapBackendEnvUrls(backends),
            ...(overrideConfig.env || {})
        },
        commands: [
            ...(config.overwritePaneLabel ? [renamePane(label)] : []),
            ...(overrideConfig.commands || defaultCommands.graphqls || [])
        ],
    };
}

function defineFrontend(path, overrideConfig = {}) {
    const label = pathUtils.basename(path);
    return {
        cwd: path,
        label: overrideConfig.label || label,
        delay: overrideConfig.delay || 0,
        env: { 
            "CLI_SERVER_PORT": next_port++,
            "GRAPHQL_URL": `http://localhost:${config.gatewayPort}/graphql`,
            ...(overrideConfig.env || {})
        },
        commands: [
            ...(config.overwritePaneLabel ? [renamePane(label)] : []),
            ...(overrideConfig.commands || defaultCommands.frontends || [])
        ],
    };
}

//
// Exports
// 

module.exports = {
    unwrapBackendEnvUrls,
    unwrapGraphqlEnvUrls,
    defineBackend,
    defineGraphql,
    defineFrontend
};
