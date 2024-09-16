import { Context, ServiceGroupConfig, Service } from "./types";
import * as utils from './utils';

/**
* Hydrates a service definition with metadata using example settings.
*
* Here you may define custom logic for defining the service definitions fields. This is useful when you want to
* define a service's fields based on other service metadata only known at runtime.
* @param {Context} context is an empty object passed from outside which allows you to attach custom data to each invocation of this function.
* Keeping track of an incrementing port number, for example, is a good use case for this object.
* @param {ServiceGroupConfig} group is this service's group config, if it exists.
* @param {Service} service is the service's base definition, created by `defineBaseService`.
* @param {Service[]} serviceDefs is a list of all service base definitions, which get hydrated as we go.
* @return {void} void.
*/
export default function(context: Context, group: ServiceGroupConfig, service: Service, serviceDefs: Service[]) {
    return utils.defaultHydrateService(context, group, service, serviceDefs);
};
