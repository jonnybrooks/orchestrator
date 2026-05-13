import * as types from "./plugin-types"

declare global {
    export type PluginContext = types.PluginContext;
    export type PluginInterface = types.PluginInterface;
}
