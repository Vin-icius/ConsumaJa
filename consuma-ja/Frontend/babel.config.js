module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Outros plugins podem vir aqui
      'react-native-reanimated/plugin', // <<< PRECISA ESTAR AQUI E SER O ÚLTIMO
    ],
  };
};