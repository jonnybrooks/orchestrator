import { Context, ServiceGroupConfig, Service } from "./types";
import * as utils from './utils';

export default function(context: Context, group: ServiceGroupConfig, service: Service, serviceDefs: Service[]) {
    // `context` is an empty object passed from outside which allows you to attach custom data to each invocation of this function.
    // Keeping track of an incrementing port number, for example, is a good use case for this object.
    // `group` is this service's group config, if it exists.
    // `service` is the service's base definition, created by `utils.defineBaseService`.
    // `serviceDefs` is a list of all service base definitions, which get hydrated as we go.
    return utils.defaultHydrateService(context, group, service, serviceDefs);
};
