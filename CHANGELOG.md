## 3.1.0

- Adds the `few` and `many` pluralization keys.
- Updates the tests to properly handle pluralization in languages that have different pluralization subkeys than the default locale.

## 3.0.0

- Update the `html-lint` dependency from `^0.6.0` to `^0.8.0` (https://github.com/Shopify/theme-lint/pull/25).<br>Several lints have been added or modified which means upgrading to this version may cause new failures for HTML translation keys.
- Fixed a bug (https://github.com/Shopify/theme-lint/issues/31) where the translation filter detection logic was returning false-positives for filters that start with "t".
