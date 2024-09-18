import { Context, Service, ServiceConfig, ServiceGroupConfig } from "./types";
import * as pathUtils from 'path';
import config from './config';

export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

//
// Unwrap utils
// 

export function unwrapBackendEnvUrls(backends: Service[]) {
    const ret: Service['env'] = {};
    backends.forEach((service) => {
        const serverName = service.label.toUpperCase().replace('-', '_');
        const key = `${serverName}_URL`;
        ret[key] = `http://127.0.0.1:${service.env.PORT}/`
    });
    return ret;
}

export function unwrapGraphqlEnvUrls(graphqls: Service[]) {
    const ret: Service['env'] = {};
    graphqls.forEach((service) => {
        const serverName = service.label.toUpperCase().replace('-', '_');
        const key = `${serverName}_URL`;
        ret[key] = `http://localhost:${service.env.PORT}/graphql`
    });
    return ret;
}

//
// Define services
// 

function renamePane(label: string) {
    return `printf '\x1b]2;${label}\x07'`;
}

export function defineBaseService(context: Context, group: ServiceGroupConfig, service: ServiceConfig): Service {
    const label = pathUtils.basename(service.path);
    return {
        ...service,
        label: service.label || label,
        delay: service.delay || 0,
        env: service.env || {},
        selectedByDefault: !!service.selectedByDefault,
        alwaysRun: service.alwaysRun || false,
        commands: [
            ...(config.overwritePaneLabel ? [renamePane(label)] : []),
            ...(service.commands || group.defaultCommands || [])
        ],
    };
}
