"use strict";

const { logger, DATA_DIR, DIST_DIR } = require('./utils.cjs');

const { desc, namespace, task } = require('jake');
const archiver = require("archiver");
const fs = require('fs');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const { dirname } = require('path');

desc("Run package data .... tasks in a single call");
task("package", ["package:data", "package:portable"], () => {
  logger.info("Done!");
});

function getUnpackedDir() {
  return fs.readdirSync(DIST_DIR).find(d => d.endsWith('-unpacked'));
}

function isLinux() {
  return os.platform() === 'linux';
}

namespace("package", function () {
  desc("Copy Eos Thesis default data to dist");
  task("data", async () => {
    let targetData = path.resolve(DIST_DIR, getUnpackedDir(), 'data');
    logger.info(`package:data - copying data files to ${targetData}`);
    await fse.ensureDir(targetData);
    await fse.copy(DATA_DIR, targetData);
    logger.info("package:data - done");
  });

  desc("Create portable compressed file");
  task("portable", ["data"], async () => {
    const dirName = getUnpackedDir();
    const oldPath = path.resolve(DIST_DIR, dirName);
    const portableName = `EosThesisIDE-${dirName.split('-')[0]}`;
    const newPath = path.resolve(DIST_DIR, portableName);
    logger.info(`package:portable - renaming from ${dirName} to ${portableName}`);
    fs.renameSync(oldPath, newPath);
    
    const linux = isLinux();


    /**
     * @param {String} sourceDir: /some/folder/to/compress
     * @param {String} outPath: /path/to/created.zip
     * @returns {Promise}
     */
    async function compressDirectory(sourceDir, outPath) {
      const archive = archiver(
        linux ? 'tar' : 'zip' ,
        linux ? { gzip: true } : { zlib: { level: 9 } }
      );
      const stream = fs.createWriteStream(outPath);

      return new Promise((resolve, reject) => {
        archive
          .directory(sourceDir, false)
          .on("error", (err) => reject(err))
          .pipe(stream);
        stream.on("close", () => resolve());
        archive.finalize();
      });
    }

    const newFile = path.resolve(DIST_DIR, portableName.replace('-', '.') + (linux ? '.tar.gz' : '.zip'));
    logger.info(`package:portable - compressing ${newFile}...`);
    await compressDirectory(newPath, newFile);
    logger.info('package:portable - compressed');
  });
});
