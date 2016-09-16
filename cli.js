#!/usr/bin/env node
const linters = require('./index').linters;
const keys = Object.keys(linters);
const commander = require('commander');

commander
  .version('0.0.1')
  .arguments('<path>')
  .action(path => lint(path))
  .usage('[options] <path>')
  .option('-r, --renderer <file>', 'A renderer')
  .parse(process.argv);

function lint(path) {
  const key = keys.pop();
  if (key) {
    const linter = new linters[key](path);
    linter.run()
      .then(() => {lint(path)});
  }
}
