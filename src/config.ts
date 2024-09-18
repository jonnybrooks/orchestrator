import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';
import { ZodError } from 'zod';
import { OrchestratorConfig, OrchestratorConfigSchema } from './types';

export default (function() {
    try {
        const data = fs.readFileSync(path.resolve(__dirname, '../config.toml'), 'utf8');
        const config: OrchestratorConfig = toml.parse(data);
        return OrchestratorConfigSchema.parse(config);
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
})();
