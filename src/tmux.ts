import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { Service } from "./types";
import { sleep } from "./utils";
import config from './config';

async function exec(cmd: string, delay = 0) {
    await sleep(delay);
    return execSync(cmd);
}

export async function runServices(services: Service[]) {
    const PATH_TO_SESSION_FILE = process.argv[2];
    
    // Create a new session
    const SESSION_NAME = `${config.baseSessionName}_${randomBytes(4).toString('hex')}`;
    if(config.singleSessionMode) {
        // If we're not in multisession mode, destroy all other orchestrator sessions first
        const cmd = `tmux ls | fgrep ${config.baseSessionName} | cut -d' ' -f1 | cut -d':' -f1 | xargs -I{} tmux kill-ses -t {}`;
        try { await exec(cmd); } catch(e) {}
    }

    await exec(`tmux new -d -s ${SESSION_NAME}`);
    
    // Spawn the services
    for(const service of services) {
        const env = Object.entries(service.env ?? {}).map(([k, v]) => `-e ${k}=${v}`).join(' ');
        const commands = service.commands.join(' && ');
        const cmd = `tmux neww -d -t ${SESSION_NAME}: -n ${service.label} -c ${service.path} ${env} "${commands} || zsh"`;

        const delay_message = (service.delay && service.delay > 0) ? ` (with ${service.delay / 1000}s delay)` : '';
        process.stderr.write(`Launching ${service.label}${delay_message}...\n`);
        await exec(cmd, service.delay);
    }

    // Finalise
    process.stderr.write('Done launching services. Attaching to tmux...\n');
    await exec(`tmux killw -t ${SESSION_NAME}:0`);
    writeFileSync(PATH_TO_SESSION_FILE, `${SESSION_NAME}\n`);
}
