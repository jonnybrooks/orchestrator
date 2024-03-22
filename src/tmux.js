const { execSync } = require('child_process');
const { randomBytes } = require('crypto');
const { writeFileSync } = require('fs');
const config = require('./config');

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function exec(cmd, delay = 0) {
    await sleep(delay);
    execSync(cmd);
}

async function runServices(services) {
    const PATH_TO_SESSION_FILE = process.argv[2];
    
    // Create a new session
    const SESSION_NAME = config.randomiseSessionName ?
        randomBytes(8).toString('hex') :
        config.staticSessionName;

    try { await exec(`tmux kill-session -t ${SESSION_NAME}`); } catch(e) {} // If a session already exists by that name, kill it
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

//
// Exports
// 

module.exports = {
    runServices
};
