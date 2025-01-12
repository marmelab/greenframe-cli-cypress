const minimist = require('minimist');

const executeScenario = require('./scenarioWrapper');

const getFilePath = (file) => {
    if (!file) {
        return;
    }

    const filePath = decodeURIComponent(file);

    if (filePath.startsWith('./')) {
        return filePath.replace('.', '/scenarios');
    }

    return filePath;
};

(async () => {
    const args = minimist(process.argv.slice(2));
    const scenarioPath = getFilePath(args.scenario);
    const cypressConfigFile = getFilePath(args.cypressConfigFile);
    const { timelines } = await executeScenario(scenarioPath, {
        debug: false,
        baseUrl: decodeURIComponent(args.url),
        hostIP: process.env.HOSTIP,
        extraHosts: process.env.EXTRA_HOSTS ? process.env.EXTRA_HOSTS.split(',') : [],
        ignoreHTTPSErrors: args.ignoreHTTPSErrors,
        timeout: args.timeout,
        cypressConfigFile: cypressConfigFile,
    });
    console.log('=====TIMELINES=====');
    console.log(JSON.stringify(timelines));
    console.log('=====TIMELINES=====');
})();
