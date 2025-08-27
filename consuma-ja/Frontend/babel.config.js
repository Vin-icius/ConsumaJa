module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo",],
    plugins: [
      ["@locator/babel-jsx/dist", {
        env: "development",
      }],
      'react-native-reanimated/plugin',
    ],
  };
};