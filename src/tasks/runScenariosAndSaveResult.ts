import initDebug from 'debug';
import { saveFinishedAnalysis } from '../services/api/analyses';
import { readFileToString } from '../services/readFileToString';

import { computeScenarioResult, ScenarioResult } from '../services/computeScenarioResult';
import { executeScenarioAndGetContainerStats } from '../services/container';
import ConfigurationError from '../services/errors/ConfigurationError';
import ERROR_CODES from '../services/errors/errorCodes';
import { computeAnalysisResult } from '../services/computeAnalysisResult';

const debug = initDebug('greenframe:tasks:runScenarioAndSaveResults');

export default async (ctx: any) => {
    const { analysisId, configFilePath, args, flags } = ctx;
    const resultScenarios: ScenarioResult[] = [];
    for (let index = 0; index < args.scenarios.length; index++) {
        const scenario = args.scenarios[index];

        debug(`Running scenario ${scenario.path}...`);
        const scenarioFileContent = await readFileToString(configFilePath, scenario.path);

        try {
            const { allContainers, allMilestones } =
                await executeScenarioAndGetContainerStats({
                    scenario: scenarioFileContent,
                    url: args.baseURL,
                    samples: flags.samples,
                    useAdblock: flags.useAdblock,
                    containers: flags.containers,
                    databaseContainers: flags.databaseContainers,
                    kubeContainers: flags.kubeContainers,
                    kubeDatabaseContainers: flags.kubeDatabaseContainers,
                    extraHosts: flags.extraHosts,
                });

            const data = computeScenarioResult({
                allContainersStats: allContainers,
                milestones: allMilestones,
                threshold: scenario.threshold,
                name: scenario.name,
            });
            resultScenarios.push(data);
        } catch (error) {
            // If the error is not due to scenario but a problem inside the configuration
            // Running others scenario is not useful, so let's stop the command.
            if (error instanceof ConfigurationError) {
                throw error;
            }

            if (error instanceof Error) {
                debug('Error while running scenario', error);
                const data = computeScenarioResult({
                    threshold: scenario.threshold,
                    name: scenario.name,
                    errorCode: ERROR_CODES.SCENARIO_FAILED,
                    errorMessage: error.message,
                });
                resultScenarios.push(data);
            }
        }
    }

    const result = computeAnalysisResult(resultScenarios);
    const { data: analysis } = await saveFinishedAnalysis(analysisId, result);

    ctx.result = { analysis, scenarios: resultScenarios, computed: result };
};
