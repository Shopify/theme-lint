"use strict";

const _ = require("lodash");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const htmllint = require("htmllint");

const Reporter = require("../reporter");

const PIPE_T_RXP = /\{\{\s*('|")((?:(?!\1).)+)\1\s*\|\s*t(?:ranslate)?(?::(.*?)\s*(?:\||\}\}))?/g;

const PLURALIZATION_KEYS = ["zero", "one", "two", "other"];

// https://github.com/htmllint/htmllint/wiki/Options
const HTML_LINT_RULES = {
  "line-end-style": false,
  "id-class-style": false
};

module.exports = class I18nLinter {
  constructor(targetDirectory) {
    this.targetDirectory = targetDirectory;

    this.loadTranslations = _.memoize(this.loadTranslations);
    this.listAllReferences = _.memoize(this.listAllReferences);
  }

  run(reporter = new Reporter()) {
    return this.testDefaultLocale(reporter)
      .then(() => this.testReferencedKeys(reporter))
      .then(() => this.testMismatchedKeys(reporter))
      .then(() => this.testHTML(reporter));
  }

  testDefaultLocale(reporter) {
    return this.defaultLocale().then(defaultLocale => {
      if (defaultLocale) {
        reporter.success(
          "Includes a default locale file",
          this.localePath(defaultLocale)
        );
      } else {
        reporter.failure("Does not include a default locale file");
      }
    });
  }

  testReferencedKeys(reporter) {
    return Promise.all([
      this.loadTranslations(),
      this.defaultLocale(),
      this.listAllReferences()
    ]).then(([translations, defaultLocale, referencedKeys]) => {
      const defaultLocaleData = translations[defaultLocale] || {};

      referencedKeys.forEach(({ file, index, key }) => {
        if (defaultLocaleData[key]) {
          reporter.success(
            `'${key}' has a matching entry in '${defaultLocale}'`,
            file,
            index
          );
        } else {
          reporter.failure(
            `'${key}' does not have a matching entry in '${defaultLocale}'`,
            file,
            index
          );
        }
      });
    });
  }

  testMismatchedKeys(reporter) {
    return Promise.all([this.loadTranslations(), this.defaultLocale()]).then(
      ([translations, defaultLocale]) => {
        const defaultLocaleData = translations[defaultLocale] || {};
        const defaultLocaleKeys = Object.keys(defaultLocaleData);

        _.forOwn(translations, (localeData, key) => {
          if (key === defaultLocale) return;

          const localeKeys = Object.keys(localeData);
          const localePath = this.localePath(key);

          const missingKeys = _.difference(defaultLocaleKeys, localeKeys);
          if (missingKeys.length > 0) {
            reporter.failure(
              `Missing entries found: ${missingKeys
                .map(k => `'${k}'`)
                .join(", ")}`,
              localePath
            );
          }

          const extraKeys = _.difference(localeKeys, defaultLocaleKeys);
          if (extraKeys.length > 0) {
            reporter.failure(
              `Extra entries found: ${extraKeys.map(k => `'${k}'`).join(", ")}`,
              localePath
            );
          }

          if (missingKeys.length == 0 && extraKeys.length == 0) {
            reporter.success(
              `'${key}' has all the entries present in '${defaultLocale}'`,
              localePath
            );
          }
        });
      }
    );
  }

  testHTML(reporter) {
    return this.loadTranslations().then(translationsByLocale => {
      const promises = [];

      _.forOwn(translationsByLocale, (translations, locale) => {
        _.forOwn(translations, (value, key) => {
          if (!this.isHTMLKey(key)) return;

          promises.push(
            htmllint(value, HTML_LINT_RULES).then(issues => {
              return { value, key, issues, locale };
            })
          );
        });
      });

      return Promise.all(promises).then(results => {
        results.forEach(result => {
          if (result.issues.length) {
            reporter.failure(
              `'${result.key}' contains invalid HTML. See ${this.lintRuleURL(
                result.issues[0].rule
              )}`,
              this.localePath(result.locale)
            );
          } else {
            reporter.success(
              `'${result.key}' contains valid HTML`,
              this.localePath(result.locale)
            );
          }
        });
      });
    });
  }

  isHTMLKey(key) {
    const keyParts = key.split(".");
    let lastPart = _.last(keyParts);

    if (_.includes(PLURALIZATION_KEYS, lastPart)) {
      lastPart = keyParts.slice(-2, -1)[0];
    }

    return _.endsWith(lastPart, "_html");
  }

  listLiquidFiles() {
    return new Promise((resolve, reject) => {
      glob(path.join(this.targetDirectory, "**/*.liquid"), (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  listReferences(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: "utf-8" }, (err, content) => {
        if (err) return reject(err);

        const matcher = new RegExp(PIPE_T_RXP);
        const references = [];

        while (true) {
          const match = matcher.exec(content);
          if (!match) break;

          const key = match[2];
          const args = match[3];

          const reference = { file, key, index: match.index };

          // https://help.shopify.com/themes/development/internationalizing/translation-filter#pluralization-in-translation-keys
          if (args && args.split(/\s+/).indexOf("count:") >= 0) {
            reference.key += ".other";
          }

          references.push(reference);
        }

        resolve(references);
      });
    });
  }

  listAllReferences() {
    return this.listLiquidFiles()
      .then(files => Promise.all(files.map(f => this.listReferences(f))))
      .then(results => [].concat(...results));
  }

  listTranslationFiles() {
    return new Promise((resolve, reject) => {
      glob(path.join(this.targetDirectory, "locales/*.json"), (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
  }

  flattenKeys(entry, keys = [], acc = {}) {
    if (_.isObject(entry)) {
      _.forOwn(entry, (value, key) =>
        this.flattenKeys(value, keys.concat(key), acc)
      );
    } else {
      acc[keys.join(".")] = entry;
    }
    return acc;
  }

  loadTranslationFile(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, { encoding: "utf-8" }, (err, content) => {
        if (err) return reject(err);
        const locale = path.basename(file, ".json");
        resolve([locale, this.flattenKeys(JSON.parse(content))]);
      });
    });
  }

  loadTranslations() {
    return this.listTranslationFiles()
      .then(files =>
        Promise.all(files.map(this.loadTranslationFile.bind(this)))
      )
      .then(_.fromPairs);
  }

  defaultLocale() {
    return this.loadTranslations().then(translations => {
      return Object.keys(translations).find(k => k.includes(".default"));
    });
  }

  localePath(locale) {
    return path.join(this.targetDirectory, "locales", locale + ".json");
  }

  lintRuleURL(rule) {
    return `https://github.com/htmllint/htmllint/wiki/Options#${rule}`;
  }
};
