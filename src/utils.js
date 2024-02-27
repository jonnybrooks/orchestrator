const pathUtils = require('path');
const config = require('./config');

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

function defineBackend(path, overrideConfig = {}) {
    return Object.assign({
        "label": pathUtils.basename(path),
        "cwd": path,
        "commands": [ "make dev" ],
        "env": { "PORT": next_port++ }
    }, overrideConfig);
}

function defineGraphql(backends, path, overrideConfig = {}) {
    return Object.assign({
        "label": pathUtils.basename(path),
        "cwd": path,
        "commands": [ "nvm use", "yarn start" ],
        "env": { "PORT": next_port++, ...unwrapBackendEnvUrls(backends) }
    }, overrideConfig);
}

function defineFrontend(path, overrideConfig = {}) {
    return Object.assign({
        "label": pathUtils.basename(path),
        "cwd": path,
        "commands": [ "nvm use", "yarn start" ],
        "env": { 
            "GRAPHQL_URL": `http://localhost:${config.gatewayPort}/graphql`
        }
    }, overrideConfig);
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
