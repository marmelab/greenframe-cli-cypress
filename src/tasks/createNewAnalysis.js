const ConfigurationError = require('../services/errors/ConfigurationError');

const { createAnalysis } = require('../services/api/analyses');
const createNewAnalysis = async (ctx) => {
    const { args, flags } = ctx;

    try {
        const { data } = await createAnalysis({
            scenarios: args.scenarios,
            baseURL: args.baseURL,
            threshold: flags.threshold,
            samples: flags.samples,
            ignoreHTTPSErrors: flags.ignoreHTTPSErrors,
            projectName: ctx.projectName,
            gitInfos: ctx.gitInfos,
        });
        ctx.analysisId = data.id;
    } catch (error_) {
        const error =
            error_.response?.status === 401
                ? new ConfigurationError(
                      `Unauthorized access: ${
                          error_.response?.data ||
                          "Check your API TOKEN or your user's subscription."
                      }`
                  )
                : error_;
        throw error;
    }
};

module.exports = createNewAnalysis;
