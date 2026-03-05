import { Service } from "./types";

export function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

//
// Unwrap utils
// 

function toUpperSnakeCase(label: string) {
    return label.toUpperCase().replace(/-/gi, '_');
}

export function unwrapBackendEnvUrls(backends: Service[]) {
    const ret: Service['env'] = {};
    backends.forEach((service) => {
        const serverName = toUpperSnakeCase(service.label);
        const key = `${serverName}_URL`;
        ret[key] = `http://127.0.0.1:${service.env.PORT}/`
    });
    return ret;
}

export function unwrapGraphqlEnvUrls(graphqls: Service[]) {
    const ret: Service['env'] = {};
    graphqls.forEach((service) => {
        const serverName = toUpperSnakeCase(service.label);
        const key = `${serverName}_URL`;
        ret[key] = `http://localhost:${service.env.PORT}/graphql`
    });
    return ret;
}
