const util = require('node:util');
const path = require('node:path');
const exec = util.promisify(require('node:child_process').exec);
const { CONTAINER_DEVICE_NAME } = require('../../constants');
const ScenarioError = require('../errors/ScenarioError');
const initDebug = require('debug');

const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const debug = initDebug('greenframe:services:container:execScenarioContainer');

const createContainer = async (
    extraHosts = [],
    envVars = [],
    envFile = '',
    isCypressConfigFile
) => {
    const { stdout } = await exec(`${PROJECT_ROOT}/dist/bash/getHostIP.sh`);
    const HOSTIP = stdout;
    const extraHostsFlags = extraHosts
        .map((extraHost) => ` --add-host ${extraHost}:${HOSTIP}`)
        .join('');

    const extraHostsEnv =
        extraHosts.length > 0 ? ` -e EXTRA_HOSTS=${extraHosts.join(',')}` : '';

    const envString = buildEnvVarList(envVars, envFile);

    debug(`Creating container ${CONTAINER_DEVICE_NAME} with extraHosts: ${extraHosts}`);

    const dockerCleanPreviousCommand = `docker rm -f ${CONTAINER_DEVICE_NAME}`;
    const allEnvVars = ` -e HOSTIP=${HOSTIP}${extraHostsEnv}${envString}`;
    const volumeString = '-v "$(pwd)":/scenarios';
    const dockerCreateCommand = `docker create --entrypoint=/bin/sh --tty --name ${CONTAINER_DEVICE_NAME} --rm${allEnvVars} --add-host localhost:${HOSTIP} ${extraHostsFlags} ${volumeString} cypress/included:13.3.0`;

    const dockerStatCommand = `${dockerCleanPreviousCommand} &&  ${dockerCreateCommand}`;
    debug(`Docker command: ${dockerStatCommand}`);
    await exec(dockerStatCommand);

    debug(`Container ${CONTAINER_DEVICE_NAME} created`);

    debug(`Copying greenframe files to container ${CONTAINER_DEVICE_NAME}`);
    // For some reason, mounting the volume when you're doing docker in docker doesn't work, but the copy command does.
    const dockerCopyCommand = `docker cp ${PROJECT_ROOT} ${CONTAINER_DEVICE_NAME}:/greenframe`;
    await exec(dockerCopyCommand);
    // If there is no cypressConfigFile, copy the /greenframe/cypress folder to /scenarios/default-greenframe-config
    if (!isCypressConfigFile) {
        const copyCypressConfig = `docker cp ${PROJECT_ROOT}/cypress/. ${CONTAINER_DEVICE_NAME}:/scenarios/default-greenframe-config`;
        await exec(copyCypressConfig);
    }

    debug(`Files copied to container ${CONTAINER_DEVICE_NAME}`);
};

const startContainer = async () => {
    const { stderr } = await exec(`docker start ${CONTAINER_DEVICE_NAME}`);
    if (stderr) {
        throw new Error(stderr);
    }

    return 'OK';
};

const execScenarioContainer = async (
    scenario,
    url,
    { ignoreHTTPSErrors, timeout, cypressConfigFile } = {}
) => {
    try {
        let command = `docker exec ${CONTAINER_DEVICE_NAME} node /greenframe/dist/runner/index.js --scenario="${encodeURIComponent(
            scenario
        )}" --url="${encodeURIComponent(url)}"`;

        if (ignoreHTTPSErrors) {
            command += ` --ignoreHTTPSErrors`;
        }

        if (timeout) {
            command += ` --timeout=${timeout}`;
        }

        if (cypressConfigFile) {
            command += ` --cypressConfigFile=${cypressConfigFile}`;
        }

        debug(`Executing command: ${command}`);

        const GARBAGE_CYPRESS_ERROR = 'DevTools listening on ws://127.0.0.1';

        const { stdout, stderr } = await exec(command);

        if (stderr && !stderr.includes(GARBAGE_CYPRESS_ERROR)) {
            throw new Error(stderr);
        }

        const timelines = JSON.parse(stdout.split('=====TIMELINES=====')[1]);

        return { timelines };
    } catch (error) {
        throw new ScenarioError(error.stderr || error.message);
    }
};

const stopContainer = async () => {
    try {
        // The container might take a while to stop.
        // We rename it to avoid conflicts when recreating it (if it is still removing while we try to create it again, it will fail).
        await exec(
            `docker rename ${CONTAINER_DEVICE_NAME} ${CONTAINER_DEVICE_NAME}-stopping && docker stop ${CONTAINER_DEVICE_NAME}-stopping`
        );
    } catch {
        // Avoid Throwing error.
        // If container is not running this command throw an error.
        return false;
    }

    return 'OK';
};

const buildEnvVarList = (envVars = [], envFile = '') => {
    const envVarString =
        envVars.length > 0
            ? envVars.reduce((list, envVarName) => {
                  if (envVarName.includes('=')) {
                      return `${list} -e ${envVarName}`;
                  }

                  const envVarValue = process.env[envVarName];
                  return `${list} -e ${envVarName}=${envVarValue}`;
              }, '')
            : '';

    const envVarFileString = envFile ? ` --env-file ${envFile}` : '';

    return `${envVarString}${envVarFileString ? envVarFileString : ''}`;
};

module.exports = {
    buildEnvVarList,
    createContainer,
    startContainer,
    execScenarioContainer,
    stopContainer,
};
