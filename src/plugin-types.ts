import type { UserData, Context } from './types';
import * as utils from './utils';

export type PluginContext = Context & {
    utils: typeof utils;
};

export type PluginInterface = {
    /**
    * Hydrates a service definition with metadata using example settings.
    * This function is called twice for every service (2-pass), in the order they're defined in config.toml.
    * @param {PluginContext} ctx is an object representing the service's execution context. Fields are:
    *   @type {GroupConfig} `group` is this service's group config, if it exists.
    *   @type {GroupConfig} `group` is this service's group config, if it exists.
    *   @type {Service} `service` is this service's base definition.
    *   @type {Service[]} `serviceDefs` is a list of all service base definitions, which get hydrated as we iterate.
    *   @type {number} `pass` is the current pass over the serviceDefs list.
    *   @type {number} `pass` is the current pass over the serviceDefs list.
    * @param {UserData} userData is an empty object passed from outside which allows you to attach custom data to each invocation of this function.
    * Keeping track of an incrementing port number, for example, is a good use case for this object.
    * @return {void} void.
    */
    hydrateService(ctx: PluginContext, userData: UserData): void;
};
