import { z } from 'zod';

const ServiceConfigSchema = z.object({
    path: z.string(),
    group: z.string(),
    label: z.string().optional(),
    delay: z.number().optional(),
    env: z.record(z.any()).optional(),
    selectedByDefault: z.boolean().optional(),
    commands: z.array(z.string()).optional(),
    alwaysRun: z.boolean().optional(),
});

const ServiceSchema = ServiceConfigSchema.required();

const ServiceGroupConfigSchema = z.object({
    defaultCommands: z.array(z.string()).optional(),
    hideInCli: z.boolean().optional()
});

export const OrchestratorConfigSchema = z.object({
    baseServicePort: z.number(),
    randomiseSessionName: z.boolean(),
    staticSessionName: z.string(),
    overwritePaneLabel: z.boolean(),
    services: z.array(ServiceConfigSchema),
    groups: z.record(ServiceGroupConfigSchema).optional()
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ServiceGroupConfig = z.infer<typeof ServiceGroupConfigSchema>;
export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

export type PromptChoice = {
    name: string,
    checked: boolean,
    value: ServiceConfig,
};

export type PromptGroup = {
    name: string,
    message: string,
    type: string,
    choices: PromptChoice[],
};

export type Context = Record<string, any>;
