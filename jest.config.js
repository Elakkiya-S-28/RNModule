module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.(ttf|woff|woff2|otf)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: ['./jest.setup.js'],
};

