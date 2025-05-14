<<<<<<< HEAD
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Outros plugins podem vir aqui
      'react-native-reanimated/plugin', // <<< PRECISA ESTAR AQUI E SER O ÚLTIMO
    ],
  };
=======
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Outros plugins podem vir aqui
      'react-native-reanimated/plugin', // <<< PRECISA ESTAR AQUI E SER O ÚLTIMO
    ],
  };
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
};