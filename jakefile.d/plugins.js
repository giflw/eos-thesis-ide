'use strict';

const { attempt, logger, download, get, sleep, unzip, PACKAGE_JSON, PLUGINS_DIR } = require('./utils.cjs');

const fs = require('fs');
const fse = require('fs-extra');
const { desc, namespace, task } = require('jake');
const path = require('path');
const rimraf = require('rimraf');


desc('Run update, download and prune plugins tasks in a single call');
task('plugins', ['plugins:update', 'plugins:download', 'plugins:prune'], () => {
    logger.info('Done!');
});


namespace('plugins', function () {
    desc('Update Eos Thesis plugins versions/urls on package.json');
    task('update', async () => {
        await updatePluginsOnFile(PACKAGE_JSON);
    });

    desc('Remove undeclared plugins');
    task('prune', () => {
        const plugins = loadPackageJson().theiaPlugins;
        console.log(plugins);
        fs.readdirSync(PLUGINS_DIR).forEach(async (file) => {
            const parts = file.split('-');
            const version = parts.splice(-1)[0];
            const plugin = parts.join('-');
            const pluginDir = path.resolve(PLUGINS_DIR, `${plugin}-${version}`);
            const urlVersion = plugins[plugin]?.split('/').splice(-1)[0]
                .split('@')[0]
                .replace('.vsix', '').split('-').splice(-1)[0];
            const sameVersion = urlVersion == version;
            
            logger.trace(`${plugin}: ${urlVersion} ${sameVersion ? '==' : '!='} ${version}`);
            if (urlVersion && sameVersion) {
                logger.info(`${plugin} ${version} (${urlVersion})- expected plugin and version`);
            } else  {
                if (urlVersion) {
                    logger.warn(`${plugin} ${version} (${urlVersion}) - unexpected version`);
                 } else {
                    logger.warn(`${plugin} ${version} (${urlVersion}) - unexpected plugin`);
                }
                logger.warn(`Removing ${pluginDir}`);
                await fse.remove(pluginDir);
            }
        });
        logger.info('Plugins directory pruned!');
    });

    desc('Remove all downloaded plugins');
    task('clean', async () => {
        let target = PLUGINS_DIR + "\\*";
        logger.warn(`Cleaning ${target}`);
        await sleep(3000);

        return new Promise((resolve, reject) => {
            rimraf(
                target,
                { maxBusyTries: 5, emfileWait: 1000, glob: { silent: false } },
                (err) => {
                    if (err) {
                        logger.error(err);
                        reject();
                    } else {
                        logger.info('Cleaned!');
                        resolve();
                    }
                }
            );
        });
    });

    desc('Download declared all plugins on package.json theiaPlugins');
    task('download', async (delay = 0) => {
        const plugins = loadPackageJson();
        let wait = false;
        for (let plugin in plugins.theiaPlugins) {
            const url = plugins.theiaPlugins[plugin];
            const filepath = path.resolve(PLUGINS_DIR, plugin + '-' + url.split('-').slice(-1)[0].split('@')[0]);
            const dirpath = filepath.substring(0, filepath.lastIndexOf('.'));
            if (fs.existsSync(dirpath)) {
                logger.info(`${plugin} - already downloaded`)
            } else {
                // do not delay in first download
                await sleep(wait ? delay : 0);
                wait = true;
                await attempt(
                    async () => await download(url, filepath, { prefix: plugin }),
                    { delay: 100, prefix: plugin }
                );
                await unzip(filepath, dirpath, { prefix: plugin });
                fs.unlinkSync(filepath);
            }
        }
        logger.info('All plugins downloaded!');
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCIONS
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

function loadPackageJson() {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON));
}

async function updatePluginsOnFile(filename) {
    const plugins = JSON.parse(fs.readFileSync(filename));

    async function updatePluginVersion(plugin, url) {
        plugin = plugin.replace('.', '/');
        url = url || `https://open-vsx.org/api/${plugin}/latest`;
        url = url.split('/file/')[0];
        console.log('======');
        console.log(plugin, '=>', url);
        const attemptOPts = { delay: 250, maxTries: 10, prefix: plugin };
        let data = await attempt(async () => await get(url), attemptOPts);

        let version = '';
        for (version in data.allVersions) {
            if (!version.includes('next') && !version.includes('latest')) {
                break;
            }
        }
        url = data.allVersions[version];
        data = await attempt(async () => await get(url), attemptOPts);
        url = data.files.download;
        console.log(plugin.split('').map(c => ' ').join(''), '=>', url);

        return url;
    };

    for (let plugin in plugins.theiaPlugins) {
        let url = null;
        while (url === null) {
            try {
                url = await updatePluginVersion(plugin, plugins.theiaPlugins[plugin]);
                plugins.theiaPlugins[plugin] = url;
            } catch (err) {
                console.log(err);
            }
        }
    }

    console.log('=============');
    console.log(plugins);
    fs.writeFileSync(filename, JSON.stringify(plugins, null, 2));
    console.log('=============');
}