const cypress = require('cypress');
const path = require('node:path');
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DEFAULT_SCENARIO_TIMEOUT = 2 * 60 * 1000; // Global timeout for executing a scenario

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
        project: options.debug ? PROJECT_ROOT : '/scenarios',
        spec: scenario,
        config: {
            baseUrl: options.baseUrl,
            specPattern: scenario,
            screenshotOnRunFailure: false,
        },
        headless: !options.debug,
        headed: options.debug,
        quiet: true,
        configFile:
            options.cypressConfigFile ||
            (options.debug
                ? `${PROJECT_ROOT}/cypress/cypress.config.js`
                : '/scenarios/default-greenframe-config/cypress.config.js'),
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
