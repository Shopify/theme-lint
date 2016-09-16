#!/usr/bin/env node
const linters = require('./index');
const path = require('path');
const commander = require('commander');
//const themePath = path.normalize(process.argv[2]);

commander
  .version('0.0.1')
  .usage('[options] <file...>')
  .option('-r, --renderer <file...>', 'A renderer')
  .parse(process.argv);

function lint() {
  if (linters.length > 0) {
    const Linter = linters.pop();
    const linter = new Linter(themePath);
    linter.run().done(lint);
  }
}
