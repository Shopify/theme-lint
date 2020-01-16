"use strict";

const PIPE_T_RXP = /\{\{\s*('|")((?:(?!\1).)+)\1\s*\|\s*t(?:ranslate)?(?::(.*?)\s*(?:\||\}\}))?/g;

module.exports = class TranslationFilterScanner {
  constructor(fileContents) {
    this.fileContents = fileContents;
  }

  forEach(callback) {
    const matcher = new RegExp(PIPE_T_RXP);

    while (true) {
      const match = matcher.exec(this.fileContents);
      if (!match) break;

      callback({
        key: match[2],
        args: match[3] || null,
        index: match.index
      });
    }
  }
};
