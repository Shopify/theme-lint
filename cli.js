#!/usr/bin/env node
const linters = require('./index').linters;
const commander = require('commander');

commander
  .version('0.0.1')
  .arguments('<path>')
  .action(path => lint(path))
  .usage('[options] <path>')
  .option('-r, --renderer <file>', 'A renderer')
  .parse(process.argv);

function lint(path) {
  const keys = Object.keys(linters);
  if (keys.length > 0) {
    keys.forEach((key) => {
      const Linter = linters[key];
      const linter = new Linter(path);
      linter.run();
    });
  }
}
