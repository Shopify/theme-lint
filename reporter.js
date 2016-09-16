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

  done() {
    this.outputStream.write('\n\n');

    if (this.failures.length === 0) {
      this.outputStream.write(chalk.green('All good!'));
      return;
    }

    this.outputStream.write(chalk.red('Errors encountered!\n\n'));

    this.failures.forEach(([message, file, index]) => {
      this.outputStream.write(chalk.red(`${file}${index ? ':' + index : ''}\n${message}\n`));
    });
  }
};
