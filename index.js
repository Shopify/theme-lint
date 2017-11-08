"use strict";

const _ = require("lodash");

const Reporter = require("./reporter");
const linters = {
  i18n: require("./linters/i18n")
};

module.exports.linters = linters;

module.exports.runAll = function(path, reporter = new Reporter()) {
  return _.values(linters)
    .reduce((chain, Linter) => {
      return chain.then(() => new Linter(path).run(reporter));
    }, Promise.resolve())
    .then(() => reporter);
};
