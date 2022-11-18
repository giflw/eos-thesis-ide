'use strict';

const fetch = require('node-fetch');
const fs = require('fs');
const fse = require("fs-extra");
const JSZip = require('jszip');
const path = require('path');
const pino = require('pino');
const pretty = require('pino-pretty');


const BASEDIR = path.resolve(__dirname, '..');

console.log('!!!! Set LOG_LEVEL environment variable to set pino js log level. Default is trace.');
const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info',
    },
    pretty({
        colorize: true,
        sync: true,
        ignore: 'pid,hostname'
    })
);

const sleep = (ms) => {
    logger.trace(`Sleeping for ${ms}ms`)
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports = {
    BASEDIR,
    DATA_DIR: path.resolve(BASEDIR, "applications/data"),
    DIST_DIR: path.resolve(BASEDIR, "applications/electron/dist"),
    ELECTRON_DIR: path.resolve(BASEDIR, "applications/electron"),
    PACKAGE_JSON: path.resolve(BASEDIR, "applications/electron/package.json"),
    PLUGINS_DIR: path.resolve(BASEDIR, "applications/electron/plugins"),
    logger,
    sleep,
    get: async (url) => {
        let response = await fetch(url);
        if (response.status !== 200) {
            process.exit(1);
        }
        return await response.json();
    },
    download: async (url, filepath, opts = {}) => {
        opts = Object.assign({ prefix: 'fn:download' }, opts)
        logger.info(`${opts.prefix} - download from ${url}...`);
        const response = await fetch(url);
        await new Promise((resolve, reject) => {
            logger.info(`${opts.prefix} - saving to ${filepath}`);
            fse.ensureDirSync(path.dirname(filepath));
            const fileStream = fs.createWriteStream(filepath);
            response.body.pipe(fileStream);
            response.body.on("error", (err) => {
                fileStream.close();
                reject(err);
            });
            fileStream.on("finish", function () {
                fileStream.close();
                resolve();
            });
        });
    },
    attempt: async (callable, opts) => {
        opts = Object.assign({ delay: 100, maxTries: 5, prefix: 'fn:attempt' }, opts);
        let error = null;
        while (opts.maxTries > 0) {
            try {
                const result = await callable()
                logger.info(`${opts.prefix} - attempt success`);
                return result;
            } catch (err) {
                error = err;
                logger.error(`${opts.prefix} - attempt error (${opts.maxTries > 0 ? 'will try again' : 'no more tries'}): ${error}`);
                opts.maxTries--;
                await sleep(opts.delay);
            }
        }
        if (opts.maxTries == 0) {
            throw error;
        }
    },
    unzip: async (file, destination, opts = {}) => {
        opts = Object.assign({ verbose: false, prefix: 'fn:unzip' }, opts);
        logger.info(`${opts.prefix} - unzipping ${file}`);
        const data = fs.readFileSync(file);
        if (data) {
            const zip = new JSZip();
            const contents = await zip.loadAsync(data);
            for (const filename in contents.files) {
                const buffer = zip.file(filename).async('nodebuffer');
                await buffer.then(function (content) {
                    const dest = path.resolve(destination, filename);
                    if (opts.verbose) {
                        logger.trace(`${opts.prefix} - extracting file ${destination} / ${filename}`);
                    }
                    fs.mkdirSync(path.dirname(dest), { recursive: true });
                    fs.writeFileSync(dest, content);
                });
            }
            logger.info(`${opts.prefix} - unzipped ${file}`);
        }
    }
};