import { ERROR_CODES, SCENARIO_STATUS } from '../constants';
import { getAverageStats, getScenarioConsumption, getStats } from '../index';
import { MetricsContainer, Milestone, ValueOf } from '../types';

export type ScenarioResult = {
    name: string;
    status: ValueOf<typeof SCENARIO_STATUS>;
    threshold?: number;
    precision?: number;
    score?: MetricsContainer;
    containers?: {
        name: string;
        type: string;
        stats: any[];
        score: MetricsContainer;
    }[];
    errorCode?: string;
    errorMessage?: string;
    executionCount?: number;
};

export const computeScenarioResult = ({
    allContainersStats,
    threshold,
    name,
    errorCode,
    errorMessage,
    executionCount,
}: {
    allContainersStats?: Parameters<typeof getStats>[0];
    threshold?: number;
    name: string;
    errorCode?: string;
    errorMessage?: string;
    executionCount?: number;
}): ScenarioResult => {
    if (!errorCode && allContainersStats) {
        const stats = getStats(allContainersStats);

        const isMultiContainers = allContainersStats.length > 1;

        const { totalScore, precision, metricsPerContainer } = getScenarioConsumption(
            stats,
            isMultiContainers
        );

        const isThresholdExceeded = threshold != null && totalScore.co2.total > threshold;

        return {
            name,
            threshold,
            status: isThresholdExceeded
                ? SCENARIO_STATUS.FAILED
                : SCENARIO_STATUS.FINISHED,
            errorCode: isThresholdExceeded ? ERROR_CODES.THRESHOLD_EXCEEDED : undefined,
            precision,
            score: totalScore,
            containers: allContainersStats.map((container) => ({
                name: container.name,
                type: container.type,
                score: metricsPerContainer[container.name],
                stats: getAverageStats(container.computedStats),
            })),
            executionCount,
        };
    }

    return {
        name,
        threshold,
        status: SCENARIO_STATUS.FAILED,
        errorCode,
        errorMessage,
        executionCount,
    };
};
