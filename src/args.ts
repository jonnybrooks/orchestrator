export type CliArgs = {
    sessionFilePath: string,
    runPrevious: boolean,
};

const USAGE = [
    'Usage: orchestrate [options]',
    '',
    'Options:',
    '  -p, --run-previous  Skip the prompts and run the same services as last time.',
    '  -h, --help          Show this help message.',
].join('\n');


export default (function() {
    const args: CliArgs = {
        sessionFilePath: '',
        runPrevious: false,
    };

    // argv[2] is the session file path passed in by scripts/cli.sh, everything after it is the user's.
    const positional: string[] = [];
    process.argv.slice(2).forEach((arg) => {
        switch(arg) {
            case '-p':
            case '--run-previous':
                args.runPrevious = true;
                break;
            case '-h':
            case '--help':
                console.log(USAGE);
                process.exit(0);
            default:
                if(arg.startsWith('-')) {
                    console.error(`Error: unknown option '${arg}'.\n\n${USAGE}`);
                    process.exit(1);
                }
                positional.push(arg);
        }
    });

    args.sessionFilePath = positional[0];
    return args;
})();
