// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tambahkan ekstensi 'bin' agar bisa dibaca TensorFlow
config.resolver.assetExts.push('bin');

module.exports = config;