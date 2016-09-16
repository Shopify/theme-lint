#!/usr/bin/env node
'use strict';

const commander = require('commander');

const pkg = require('./package.json');
const linters = require('./index').linters;
const Reporter = require('./reporter');

const keys = Object.keys(linters);
const reporter = new Reporter();

commander
  .version(pkg.version)
  .arguments('<path>')
  .action(path => lint(path))
  .usage('[options] <path>')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

function lint(path) {
  const key = keys.pop();
  if (key) {
    const linter = new linters[key](path);
    linter.run(reporter)
      .then(() => {lint(path)});
  } else {
    reporter.finalize();
    if (reporter.failures.length > 0) {
      process.on('exit', () => process.exit(1));
    }
  }
}
