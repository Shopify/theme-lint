#!/usr/bin/env node
'use strict';

const commander = require('commander');
const _ = require('lodash');

const pkg = require('./package.json');
const registeredLinters = require('./index').linters;
const Reporter = require('./reporter');

commander
  .version(pkg.version)
  .arguments('<path>')
  .action(path => lint(path, _.values(registeredLinters)))
  .usage('[options] <path>')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

function lint(path, linters, reporter = new Reporter()) {
  const Linter = linters[0];

  if (Linter) {
    const linter = new Linter(path);
    linter.run(reporter).then(() => {
      lint(path, linters.slice(1), reporter);
    });
  } else {
    reporter.finalize();

    if (reporter.failures.length > 0) {
      process.on('exit', () => process.exit(1));
    }
  }
}
