import { z } from 'zod';

const ServiceConfigSchema = z.object({
    path: z.string(),
    group: z.string(),
    label: z.string().optional(),
    delay: z.number().optional(),
    env: z.record(z.any()).default({}),
    commands: z.array(z.string()).optional(),
    alwaysRun: z.boolean().optional(),
});

const ServiceSchema = ServiceConfigSchema.required();

const ServiceGroupConfigSchema = z.object({
    defaultCommands: z.array(z.string()).optional(),
});

export const OrchestratorConfigSchema = z.object({
    baseServicePort: z.number(),
    baseSessionName: z.string(),
    singleSessionMode: z.boolean(),
    overwritePaneLabel: z.boolean(),
    services: z.array(ServiceConfigSchema),
    groups: z.record(ServiceGroupConfigSchema).optional()
});

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type GroupConfig = z.infer<typeof ServiceGroupConfigSchema>;
export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

export type UserData = Record<string, any>;
export type Context = {
    config: OrchestratorConfig,
    group: GroupConfig,
    service: ServiceConfig,
    serviceDefs: Service[],
    pass: number,
};
