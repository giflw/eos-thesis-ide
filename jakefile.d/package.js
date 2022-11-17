'use strict';

const { logger, DATA_DIR,  DIST_DIR } = require('./utils.cjs');

const { desc, namespace, task } = require('jake');
const fse = require('fs-extra');
const path = require('path');


desc('Run package data .... tasks in a single call');
task('package', ['package:data'], () => {
    logger.info('Done!');
});

namespace('package', function () {
    desc('Copy Eos Thesis default data to dist');
    task('data', async () => {
        let targetData = path.resolve(DIST_DIR, 'win-unpacked/data');
        await fse.ensureDir(targetData);
        await fse.copy(DATA_DIR, targetData);
    });
});
