'use strict';

const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const Reporter = require('../reporter');

const PIPE_T_RXP = /\{\{\s*('|")((?:(?!\1).)+)\1\s*\|\s*t(?:ranslate)?(?::(.*?)\s*(?:\||\}\}))?/g;

module.exports = class I18nLinter {
  constructor(targetDirectory) {
    this.targetDirectory = targetDirectory;
  }

  run(reporter = new Reporter) {
    return Promise.all([
      this.loadTranslations(),
      this.listReferences()
    ]).then(([translations, referencedKeys]) => {
      const defaultLocale = Object.keys(translations).find(k => k.includes('.default'));

      if (defaultLocale) {
        const localePath = path.join(this.targetDirectory, 'locales', defaultLocale + '.json');
        reporter.success('Includes a default locale file', localePath);
      } else {
        reporter.failure('Does not include a default locale file');
      }

      const defaultLocaleData = translations[defaultLocale];

      referencedKeys.forEach(({file, index, key}) => {
        if (defaultLocaleData[key]) {
          reporter.success(`${key} has a matching entry in ${defaultLocale}`, file, index);
        } else {
          reporter.failure(`${key} does not have a matching entry in ${defaultLocale}`, file, index);
        }
      });

      const defaultLocaleKeys = Object.keys(defaultLocaleData);

      _.forOwn(translations, (localeData, key) => {
        if (key === defaultLocale) return;

        const localePath = path.join(this.targetDirectory, 'locales', key + '.json');
        const localeKeys = Object.keys(localeData);

        const errors = [];

        const missingKeys = _.difference(defaultLocaleKeys, localeKeys);
        if (missingKeys.length > 0) {
          errors.push(`missing: ${missingKeys.join(', ')}`);
        }

        const extraKeys = _.difference(localeKeys, defaultLocaleKeys);
        if (extraKeys.length > 0) {
          errors.push(`extra: ${extraKeys.join(', ')}`);
        }

        if (errors.length === 0) {
          reporter.success(`${key} has all the entries present in ${defaultLocale}`, localePath);
        } else {
          reporter.failure(`Mismatching entries found\n${errors.join('\n')}`, localePath);
        }
      });

      reporter.done();
    });
  }

  listLiquidFiles() {
    return new Promise((resolve, reject) => {
      glob(path.join(this.targetDirectory, '**/*.liquid'), (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  listReferencedKeys(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf-8'}, (err, content) => {
        if (err) return reject(err);

        const matcher = new RegExp(PIPE_T_RXP);
        const references = [];

        while (true) {
          const match = matcher.exec(content);
          if (!match) break;

          const key = match[2];
          const args = match[3];

          const reference = {file, key, index: match.index};

          // https://help.shopify.com/themes/development/internationalizing/translation-filter#pluralization-in-translation-keys
          if (args && args.split(/\s+/).indexOf('count:') >= 0) {
            reference.key += '.other';
          }

          references.push(reference);
        }

        resolve(references);
      });
    });
  }

  listReferences() {
    return this.listLiquidFiles()
      .then(files => Promise.all(files.map(f => this.listReferencedKeys(f))))
      .then(results => [].concat(...results));
  }

  listTranslationFiles() {
    return new Promise((resolve, reject) => {
      glob(path.join(this.targetDirectory, 'locales/*.json'), (err, files) => {
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

  loadTranslationFile(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf-8'}, (err, content) => {
        if (err) return reject(err);
        const locale = path.basename(file, '.json');
        resolve([locale, this.flattenKeys(JSON.parse(content))]);
      });
    });
  }

  loadTranslations() {
    return this.listTranslationFiles()
      .then(files => Promise.all(files.map(this.loadTranslationFile.bind(this))))
      .then(_.fromPairs);
  }
};
