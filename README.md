# Theme Lint

[![Build Status](https://travis-ci.com/Shopify/theme-lint.svg?branch=master)](https://travis-ci.com/Shopify/theme-lint)

A linter for Shopify theme localization written in Node.

## Getting started

Add `theme-lint` as a devDependency to a Shopify theme by running the following command inside of the theme directory:

```bash
$ npm install --save-dev @shopify/theme-lint
```

Add a new NPM script to your theme's `package.json` like so:

```js
"scripts": {
  "lint": "theme-lint ./dist"
}
```

Finally, run `npm run lint` to run the translation tests.

## License

MIT, see [LICENSE.md](http://github.com/Shopify/theme-lint/blob/master/LICENSE.md) for details.

<img src="https://cdn.shopify.com/shopify-marketing_assets/builds/19.0.0/shopify-full-color-black.svg" width="200" />
