const { Command, Flags } = require('@oclif/core');
const path = require('node:path');

const { parseConfigFile, resolveParams } = require('../services/parseConfigFile');

const executeScenario = require('../runner/scenarioWrapper.js');

const { detectExecutablePath } = require('../services/detectExecutablePath');

class OpenCommand extends Command {
    static args = [
        {
            name: 'baseURL', // name of arg to show in help and reference with args[name]
            description: 'Your baseURL website', // help description
        },
        {
            name: 'scenario', // name of arg to show in help and reference with args[name]
            description: 'Path to your GreenFrame scenario', // help description
            required: false,
        },
    ];

    static defaultFlags = {
        configFile: './.greenframe.yml',
        ignoreHTTPSErrors: false,
    };

    static flags = {
        configFile: Flags.string({
            char: 'C',
            description: 'Path to config file',
            required: false,
        }),
        ignoreHTTPSErrors: Flags.boolean({
            description: 'Ignore HTTPS errors during analysis',
        }),
        timeout: Flags.integer({
            description: 'Timeout for scenario run in ms',
        }),
        cypressConfigFile: Flags.string({
            description: 'Path to custom cypress config file',
        }),
    };

    async run() {
        const commandParams = await this.parse(OpenCommand);
        const configFilePath =
            commandParams.flags.configFile ?? OpenCommand.defaultFlags.configFile;
        const configFileParams = await parseConfigFile(configFilePath);

        const { args, flags } = resolveParams(
            OpenCommand.defaultFlags,
            configFileParams,
            commandParams
        );

        const executablePath = await detectExecutablePath();

        console.info(`Running ${args.scenarios.length} scenarios...`);
        for (let index = 0; index < args.scenarios.length; index++) {
            const scenario = args.scenarios[index];
            const scenarioPath = path.resolve(scenario.path);
            try {
                const { timelines } = await executeScenario(scenarioPath, {
                    debug: true,
                    baseUrl: args.baseURL,
                    executablePath,
                    extraHosts: args.extraHosts,
                    ignoreHTTPSErrors: flags.ignoreHTTPSErrors,
                    cypressConfigFile: flags.cypressConfigFile,
                    timeout: flags.timeout,
                });
                console.info(
                    `✅ ${scenario.name}: ${
                        new Date(timelines.end).getTime() -
                        new Date(timelines.start).getTime()
                    } ms`
                );
            } catch (error) {
                console.error(`❌ Error : ${scenario.name}`);
                console.error(error.message);
                process.exit(0);
            }
        }

        console.info(`
        GreenFrame scenarios finished successfully !

        You can now run an analysis to estimate the consumption of your application.
                `);
    }
}

OpenCommand.description = `Open browser to develop your GreenFrame scenario
...
greenframe analyze ./yourScenario.js https://greenframe.io
`;

module.exports = OpenCommand;
