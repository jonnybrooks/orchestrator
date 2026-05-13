import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Service } from "./types";
import { sleep } from "./utils";
import config from './config';

async function exec(cmd: string, delay = 0) {
    await sleep(delay);
    return execSync(cmd);
}

function escapeQuotes(str: any) {
    let s = String(str);
    s = s.replace(/"/gi, `\\"`);
    return s;
}

function execService(service: Service, sessionName: string) {
    const envLines = Object.entries(service.env ?? {}).map(([k, v]) => `${k}="${escapeQuotes(v)}"`);
    const shellEnv = envLines.map((line) => `export ${line}`).join('\n');
    const tmuxEnv = envLines.map((line) => `-e ${line}`).join(' ');

    const commands = escapeQuotes(service.commands.join(' && '));
    const scriptContent = [
        `#!${process.env.SHELL}`,
        shellEnv,
        `trap 'echo "Process killed. Dropping into shell..." ; break' INT`,
        commands,
        `trap - INT`,
        `exec $SHELL -i`,
    ].join('\n');

    const tempFilePath = join('/tmp', `${sessionName}_${service.label}.sh`);
    writeFileSync(tempFilePath, scriptContent, { mode: 0o755 });
    const cmd = `tmux neww -d -t ${sessionName}: -n ${service.label} -c ${service.path} ${tmuxEnv} ${tempFilePath}`;
    return exec(cmd, service.delay);
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
    await Promise.all(services.map((service) => {
        const delayMsg = (service.delay && service.delay > 0) ? ` (with ${service.delay / 1000}s delay)` : '';
        process.stderr.write(`Launching ${service.label}${delayMsg}...\n`);
        return execService(service, SESSION_NAME);
    }));

    // Finalise
    process.stderr.write('Done launching services. Attaching to tmux...\n');
    await exec(`tmux killw -t ${SESSION_NAME}:0`);
    writeFileSync(PATH_TO_SESSION_FILE, `${SESSION_NAME}\n`);
}
