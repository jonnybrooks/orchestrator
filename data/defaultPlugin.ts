import config from "./config";
import { Context, ServiceGroupConfig, Service } from "./types";
import { unwrapBackendEnvUrls, unwrapGraphqlEnvUrls } from "./utils";

/**
* Hydrates a service definition with metadata using example settings.
* This function is called once for every service, in the order they're defined in config.toml.
* @param {Context} context is an empty object passed from outside which allows you to attach custom data to each invocation of this function.
* Keeping track of an incrementing port number, for example, is a good use case for this object.
* @param {ServiceGroupConfig} group is this service's group config, if it exists.
* @param {Service} service is the service's base definition, created by `defineBaseService`.
* @param {Service[]} serviceDefs is a list of all service base definitions, which get hydrated as we go.
* @return {void} void.
*/
export function hydrateService(context: Context, group: ServiceGroupConfig, service: Service, serviceDefs: Service[]) {
    if(!context.nextPort) context.nextPort = config.baseServicePort;
    
    switch(service.group) {
        case 'backend': {
            // Before assigning a port automatically, we first check if the base definition doesn't already have one.
            // If it does, it was defined in `config.toml`, so we don't want to override it.
            if(!service.env.PORT) service.env.PORT = context.nextPort++;
        } break;
        case 'graphql': {
            if(!service.env.PORT) service.env.PORT = context.nextPort++;
            // Create a list of backend URLs from all the backend services hydrated thus far, so we can wire
            // them into this service's environment.
            const unwrappedBackends = unwrapBackendEnvUrls(serviceDefs.filter(({ group }) => group === 'backend'));
            Object.assign(service.env, unwrappedBackends);
        } break;
        case 'gateway': {
            const unwrappedGraphqls = unwrapGraphqlEnvUrls(serviceDefs.filter(({ group }) => group === 'graphql'));
            Object.assign(service.env, unwrappedGraphqls);
        } break;
        case 'frontend': {
            if(!service.env.CLI_SERVER_PORT) service.env.CLI_SERVER_PORT = context.nextPort++;
            const unwrappedGraphqls = unwrapGraphqlEnvUrls(serviceDefs.filter(({ group }) => group === 'graphql'));
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
