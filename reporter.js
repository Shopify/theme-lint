const chalk = require('chalk');

module.exports = class Reporter {
  constructor(outputStream = require('process').stderr) {
    this.outputStream = outputStream;
    this.successes = [];
    this.failures = [];
  }

  success(file, index, message) {
    this.successes.push([file, index, message]);
    this.outputStream.write(chalk.green('.')); 
  }

  failure(file, index, message) {
    this.failures.push([file, index, message]);
    this.outputStream.write(chalk.red('.'));
  }

  done() {
    this.outputStream.write('\n');

    if (this.failures.length === 0) {
      this.outputStream.write(chalk.green('All good!'));
      return;
    }

    this.failures.forEach(([file, index, message]) => {
      this.outputStream.write(chalk.red(`${file} ${index} ${message}\n`));
    });

    this.outputStream.write(chalk.red('Errors encountered!'));
  }
};
