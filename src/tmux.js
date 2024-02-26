const { execSync } = require('child_process');

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function exec(cmd, delay = 0) {
    await sleep(delay);
    console.log(cmd);
    execSync(cmd);
}

async function runServices(services) {
    // Create a new session
    const SESSION_NAME = 'orchestrator';
    try { await exec(`tmux kill-session -t ${SESSION_NAME}`); } catch(e) {} // Kill the session if it exists
    await exec(`tmux new -d -s ${SESSION_NAME}`);
    await exec(`tmux set -g mouse on`); // Set mouse mode on for scrolling
    
    // Spawn the services
    for(const service of services) {
        const env = Object.entries(service.env ?? {}).map(([k, v]) => `-e ${k}=${v}`).join(' ');
        const commands = service.commands.join(' && ');
        const cmd = `tmux neww -d -t ${SESSION_NAME}: -n ${service.label} -c ${service.cwd} ${env} "${commands} || bash"`;
        await exec(cmd, service.delay);
    }
    
    // Finalise
    await exec(`tmux killw -t ${SESSION_NAME}:0`);
    process.stderr.write(`\nNow run the following to attach to the session:\n`);
    process.stderr.write(`tmux attach -t ${SESSION_NAME}\n\n`);
}

//
// Exports
// 

module.exports = {
    runServices
};
