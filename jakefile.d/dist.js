'use strict';

const { logger } = require('./utils.cjs');

const { desc, task } = require('jake');

desc('Run plugins and package tasks in a single call');
task('dist', ['plugins', 'package'], () => {
    logger.info('Done!');
});

