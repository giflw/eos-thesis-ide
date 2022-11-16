'use strict';

const { task, desc, Task } = require("jake");
const { logger } = require("./jakefile.d/utils.cjs");

desc("Show help about this project");
task("default", ["help"], function() {});

desc("Show help about this project");
task("help", function () {
  const tasks = [];

  for (let taskName in Task) {
    if (!Object.prototype.hasOwnProperty.call(Task, taskName)) {
      continue;
    }
    let task = Task[taskName];

    let taskParams = "";
    if (task.params != "") {
      taskParams = "[" + task.params + "]";
    }

    let descr = task.description;
    if (descr) {
      tasks.push(taskName.padEnd(30, ' ') + taskParams + " # " + descr);
    }
  }

  logger.info(`
  ===============================================
  Eos Thesis IDE :: Build Help
  -----------------------------------------------

  Use "yarn eos help" to show this help.

  Use "yarn eos <taskName>" to run a task.

  You can use jake directly too as "yarn jake [arguments]".

  # Available tasks:
  ${tasks.reduce((p, c) => p + "\n  " + c)}
  ===============================================
  `);
});
