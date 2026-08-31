module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Required for Reanimated 4 / react-native-worklets: injects __initData
  // metadata into worklets and transforms 'worklet' directives.
  plugins: ['react-native-worklets/plugin'],
};

