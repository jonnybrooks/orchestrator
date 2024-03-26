import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';
import { OrchestratorConfig, OrchestratorConfigSchema } from './types';
import { ZodError } from 'zod';

const data = fs.readFileSync(path.resolve(__dirname, '../config.toml'), 'utf8');
const config: OrchestratorConfig = toml.parse(data);

try {
    OrchestratorConfigSchema.parse(config);
}
catch(e) {
    if(e instanceof ZodError) {
        console.error('Error: config.toml was invalid. Please fix the following errors:');
        console.table(e.errors);
    }
    else {
        console.error('Encountered unknown error. Exiting.');
    }
    process.exit(1);
}

export default config;
