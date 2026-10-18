const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Bundled prebuilt SQLite databases (content.db).
config.resolver.assetExts.push('db');

module.exports = config;
