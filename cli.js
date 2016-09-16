#!/usr/bin/env node
const pkg = require('./package.json');
const linters = require('./index').linters;
const keys = Object.keys(linters);
const commander = require('commander');

commander
  .version(pkg.version)
  .arguments('<path>')
  .action(path => lint(path))
  .usage('[options] <path>')
  .parse(process.argv);

function lint(path) {
  const key = keys.pop();
  if (key) {
    const linter = new linters[key](path);
    linter.run()
      .then(() => {lint(path)});
  }
}
