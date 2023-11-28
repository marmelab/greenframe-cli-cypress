import initDebug from 'debug';
import instance from './instance';

const debug = initDebug('greenframe:services:api:scenarios');

export const createScenario = async ({
    analysisId,
    name,
    threshold,
    allContainers,
    errorCode,
    errorMessage,
}: any) => {
    debug(`Post scenario to api \n`, {
        name,
        threshold,
        statsSize: allContainers.length,
        errorCode,
        errorMessage,
    });
    return instance.post(`/analyses/${analysisId}/scenarios`, {
        name,
        threshold,
        allContainersStats: allContainers,
        errorCode,
        errorMessage,
    });
};

export const findAllScenariosByAnalysisId = async (analysisId: string) =>
    instance.get(`/analyses/${analysisId}/scenarios`);
