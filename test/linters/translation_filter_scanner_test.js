"use strict";

const assert = require("assert");

const TranslationFilterScanner = require("../../linters/translation_filter_scanner");

describe("TranslationFilterScanner", () => {
  describe("#forEach", () => {
    it("calls the callback for every match found", () => {
      const liquid = `
        {{ "simple.key" | t }}
        {{ "interpolated.key" | t: foo: "bar" }}
        {{ "pluralized.key" | t: count: 3 }}
        {{ 'verbose.key' | translate }}
        {{ 'verbose.interpolated.key' | translate: foo: "bar" }}
        {{ 'chained.key' | t | escape }}
      `;
      const expected = [
        { key: "simple.key", args: null, index: 9 },
        { key: "interpolated.key", args: ' foo: "bar"', index: 40 },
        { key: "pluralized.key", args: " count: 3", index: 89 },
        { key: "verbose.key", args: null, index: 134 },
        { key: "verbose.interpolated.key", args: ' foo: "bar"', index: 174 },
        { key: "chained.key", args: null, index: 239 }
      ];

      const matches = [];
      const scanner = new TranslationFilterScanner(liquid);
      scanner.forEach(match => matches.push(match));

      assert.deepEqual(matches, expected);
    });

    it("only matches the translate filter", () => {
      const liquid = `
        {{ "now" | time_tag: format: 'date' }}
      `;

      const matches = [];
      const scanner = new TranslationFilterScanner(liquid);
      scanner.forEach(match => matches.push(match));

      assert.equal(
        matches.length,
        0,
        `Expected 0 matches but got:\n${JSON.stringify(matches, null, "  ")}`
      );
    });
  });
});
