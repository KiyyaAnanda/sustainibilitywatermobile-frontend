// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Plugin Anda yang sudah ada
      "react-native-reanimated/plugin", 

      // Plugin BARU untuk .env
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        allowUndefined: false,
      }]
    ],
  };
};