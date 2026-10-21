// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // src/spike: local throwaway code from milestone 1, not in git
    ignores: ['dist/*', 'src/spike/*'],
  },
]);
