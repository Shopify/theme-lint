'use strict';

const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const Reporter = require('../reporter');

const PIPE_T_RXP = /\{\{\s*('|")([^\1]+?)\1\s*\|\s*t/g;

module.exports = class I18nLinter {
  constructor(targetDirectory) {
    this.targetDirectory = targetDirectory;
  }

  run(reporter = new Reporter) {
  }

  listLiquidFiles() {
    return new Promise((resolve, reject) => {
      glob(this.targetDirectory + '/**/*.liquid', (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  listReferences(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf-8'}, (err, content) => {
        if (err) return reject(err);

        const matcher = new RegExp(PIPE_T_RXP);
        const matches = [];

        while (true) {
          const match = matcher.exec(content);
          if (!match) break;
          matches.push({
            file: file,
            index: match.index,
            key: match[2]
          });
        }

        resolve(matches);
      });
    });
  }

  listTranslationFiles() {
    return new Promise((resolve, reject) => {
      glob(this.targetDirectory + '/locales/*.json', (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  flattenKeys(entry, keys = [], acc = {}) {
    if (_.isObject(entry)) {
      _.forOwn(entry, (value, key) => this.flattenKeys(value, keys.concat(key), acc));
    } else {
      acc[keys.join('.')] = entry;
    }
    return acc;
  }

  loadTranslationData(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf-8'}, (err, content) => {
        if (err) return reject(err);
        const locale = path.basename(file).split('.')[0];
        resolve([locale, this.flattenKeys(JSON.parse(content))]);
      });
    });
  }

  loadTranslations() {
    return this.listTranslationFiles()
      .then(files => Promise.all(files.map(this.loadTranslationData.bind(this))))
      .then(_.fromPairs);
  }
};
