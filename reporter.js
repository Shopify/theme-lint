"use strict";

const chalk = require("chalk");
const _ = require("lodash");

module.exports = class Reporter {
  constructor(outputStream = require("process").stderr) {
    this.outputStream = outputStream;
    this.successes = [];
    this.failures = [];
  }

  success(message, file = null, index = null) {
    this.successes.push([message, file, index]);
  }

  failure(message, file, index) {
    this.failures.push([message, file, index]);
  }

  output() {
    const testsRun = this.failures.length + this.successes.length;

    this.outputStream.write("Translation tests complete: ");

    if (this.failures.length === 0) {
      this.outputStream.write(
        chalk.green(`Success (${testsRun} checks run)`) + "\n\n"
      );
      return;
    }

    this.outputStream.write(
      chalk.red(`Failed (${testsRun} checks run)`) + "\n\n"
    );

    const failureGroups = _.groupBy(this.failures, failure => failure[1]);

    _.forOwn(failureGroups, (failures, file) => {
      this.outputStream.write(chalk.red(`${file}:\n`));

      failures.map(failure => {
        return this.outputStream.write(`${failure[0]}\n`);
      });
    });
  }
};
