'use strict';

const chalk = require('chalk');

module.exports = class Reporter {
  constructor(outputStream = require('process').stderr) {
    this.outputStream = outputStream;
    this.successes = [];
    this.failures = [];
  }

  success(message, file = null, index = null) {
    this.successes.push([message, file, index]);
    this.outputStream.write(chalk.green('.'));
  }

  failure(message, file, index) {
    this.failures.push([message, file, index]);
    this.outputStream.write(chalk.red('.'));
  }

  finalize() {
    this.outputStream.write('\n\n');

    const testsRun = this.failures.length + this.successes.length;

    if (this.failures.length === 0) {
      this.outputStream.write([
        chalk.green('All good!'),
        `(${testsRun} checks run)`
      ].join(' ') + '\n\n');
      return;
    }

    this.outputStream.write([
      chalk.red('Errors encountered!'),
      `(${testsRun} checks run)`
    ].join(' ') + '\n\n');

    this.failures.forEach(([message, file, index]) => {
      this.outputStream.write([
        chalk.red(`${file}${index ? ':' + index : ''}`),
        message
      ].join('\n') + '\n\n');
    });
  }
};
