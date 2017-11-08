#!/usr/bin/env node
"use strict";

const commander = require("commander");

const pkg = require("./package.json");
const { runAll } = require("./index");

commander
  .version(pkg.version)
  .arguments("<path>")
  .action(path => lint(path))
  .usage("[options] <path>")
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

function lint(path) {
  return runAll(path)
    .then(reporter => {
      reporter.output();

      if (reporter.failures.length > 0) {
        process.on("exit", () => process.exit(1));
      }
    })
    .catch(e => {
      console.log(e);
      process.on("exit", () => process.exit(1));
    });
}
