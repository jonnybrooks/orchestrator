/// <reference path="./exports.d.ts" />


export const hydrateService: PluginInterface['hydrateService'] = (
    ctx,
    userData
) => {
    const {
        config,
        service,
        serviceDefs,
        pass,
        utils,
    } = ctx;

    if(pass == 1)
    {
        if(!userData.nextPort) userData.nextPort = config.baseServicePort;
        
        switch(service.group) {
            case 'backend': {
                // Before assigning a port automatically, we first check if the base definition doesn't already have one.
                // If it does, it was defined in `config.toml`, so we don't want to override it.
                if(!service.env.PORT) service.env.PORT = userData.nextPort++;
            } break;
            case 'graphql': {
                if(!service.env.PORT) service.env.PORT = userData.nextPort++;            
                // Create a list of backend URLs from all the backend services hydrated thus far, so we can wire
                // them into this service's environment.
                const backendServices = serviceDefs.filter(({ group }) => group === 'backend');
                const unwrappedBackends = utils.unwrapBackendEnvUrls(backendServices);
                Object.assign(service.env, unwrappedBackends);
            } break;
            case 'gateway': {
                const unwrappedGraphqls = utils.unwrapGraphqlEnvUrls(serviceDefs.filter(({ group }) => group === 'graphql'));
                Object.assign(service.env, unwrappedGraphqls);
            } break;
            case 'frontend': {
                if(!service.env.CLI_SERVER_PORT) service.env.CLI_SERVER_PORT = userData.nextPort++;
                const unwrappedGraphqls = utils.unwrapGraphqlEnvUrls(serviceDefs.filter(({ group }) => group === 'graphql'));
                Object.assign(service.env, unwrappedGraphqls);
                // Each frontend needs to connect to the federated graphql supergraph, aka the 'gateway'.
                // We have configured `config.toml` to contain a single service under the 'gateway' group, so we can
                // grab it with `find`.
                const gatewayDef = serviceDefs.find(({ group }) => group === 'gateway')!;
                // Since we know env.PORT is defined in `config.toml`, it will be part of the gateway service's base definition
                // and so will be accessible in `gatewayDef` even _before_ the service is hydrated.
                const gatewayPort = gatewayDef.env.PORT;
                service.env.GRAPHQL_URL = `http://localhost:${gatewayPort}/graphql`;
            } break;
        }
    }
    else
    {
        switch(service.group) {
            case 'backend': {
                // For backends to call other backends, they expect a "service request map"
                const backendServices = serviceDefs.filter(({ group }) => group === 'backend');
                const owsRequestServiceMap: Record<string, string> = {};
                backendServices.forEach((service) => {
                    owsRequestServiceMap[service.label] = `localhost:${service.env.PORT}`;
                });
                service.env.OWSREQUEST_SERVICE_MAP = JSON.stringify(owsRequestServiceMap);
            } break;
        }
    }
}
