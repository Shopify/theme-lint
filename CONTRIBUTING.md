# How to contribute

We ❤️ pull requests. If you'd like to fix a bug, contribute a feature or
just correct a typo, please feel free to do so, as long as you follow
our [Code of Conduct](https://github.com/Shopify/theme-lint/blob/master/CODE_OF_CONDUCT.md).

If you're thinking of adding a big new feature, consider opening an
issue first to discuss it to ensure it aligns to the direction of the
project (and potentially save yourself some time!).

## Getting Started

To start working on the codebase, first fork the repo, then clone it:
```
git clone git@github.com:your-username/theme-lint.git
```
*Note: replace "your-username" with your Github handle*

Install the project's dependencies:

```
npm install
```

Write some features.

Add some tests and make your change. Re-run the tests with:

```
npm run test
```

## Style

We use an automatic code formatter called [Prettier](https://prettier.io/).

Run `npm run prettier` after making any changes to the code.

## Documentation
If your change affects how people use the project (i.e. adding or
changing arguments to a function, adding a new function, changing the
return value, etc), please ensure the documentation is also updated to
reflect this. Documentation is made in the `README.md`.

If further documentation is needed please communicate this via Github Issues.

## Publish a new version

:warning: Note: You must have a Shopify Okta account in order to login to Shipit and publish a new version.
1. Merge any changes you want to include in your next release into `master`.
2. Pull in the latest changes from `master` and run:
   ```
   npm version <major | minor | patch> && git push --follow-tags
   ```

   This will update:
    * The version in `package.json`
    * The version in `package-lock.json`
    * Create a new tag for your release
3. Add the changes that you have made to the [CHANGELOG.md](https://github.com/Shopify/theme-lint/blob/master/CHANGELOG.md)
4. Create a [release](https://github.com/Shopify/theme-lint/releases)
   * Edit the tag you just created and use the changelog content for the description
5. Go to [shipit](https://shipit.shopify.io/shopify/theme-lint/production) and deploy the latest commit
6. Confirm that the release was published on [npmjs](https://www.npmjs.com/package/@shopify/theme-lint)
