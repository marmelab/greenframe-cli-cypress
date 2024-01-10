const { cwd } = require('node:process');
const cypress = require('cypress');
const path = require('node:path');
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DEFAULT_SCENARIO_TIMEOUT = 2 * 60 * 1000; // Global timeout for executing a scenario

const getConfigFile = (customConfigFile, isDebug) => {
    if (customConfigFile && isDebug) {
        return path.resolve(cwd(), customConfigFile);
    }

    if (customConfigFile && !isDebug) {
        return customConfigFile;
    }

    if (!customConfigFile && isDebug) {
        return `${PROJECT_ROOT}/cypress/cypress.config.js`;
    }

    return '/scenarios/default-greenframe-config/cypress.config.js';
};

const executeScenario = async (scenario, options = {}) => {
    let args = ['--disable-web-security'];

    if (options.hostIP) {
        args.push(`--host-rules=MAP localhost ${options.hostIP}`);
        for (const extraHost of options.extraHosts) {
            args.push(`--host-rules=MAP ${extraHost} ${options.hostIP}`);
        }
    }

    let start;
    let end;

    const timeout = options.timeout || DEFAULT_SCENARIO_TIMEOUT;

    const timeoutScenario = setTimeout(() => {
        throw new Error(`Timeout: Your scenario took more than ${timeout / 1000}s`);
    }, timeout);

    const cypressResults = await cypress.run({
        browser: 'chrome',
        testingType: 'e2e',
        project: options.debug ? cwd() : '/scenarios',
        spec: scenario,
        config: {
            baseUrl: options.baseUrl,
            specPattern: scenario,
            screenshotOnRunFailure: false,
        },
        headless: !options.debug,
        headed: options.debug,
        quiet: true,
        configFile: getConfigFile(options.cypressConfigFile, options.debug),
        runnerUi: false,
    });

    if (cypressResults.status === 'failed') {
        throw new Error(cypressResults.message);
    }

    if (cypressResults.runs[0].error) {
        throw new Error(cypressResults.runs[0].error);
    }

    if (cypressResults.runs[0].tests[0].state === 'failed') {
        throw new Error(cypressResults.runs[0].tests[0].displayError);
    }

    start = cypressResults.runs[0].stats.startedAt;
    end = cypressResults.runs[0].stats.endedAt;

    clearTimeout(timeoutScenario);

    return {
        timelines: {
            title: options.name,
            start,
            end,
        },
    };
};

process.on('uncaughtException', (err) => {
    throw err;
});

process.on('unhandledRejection', (err) => {
    throw err;
});

module.exports = executeScenario;
