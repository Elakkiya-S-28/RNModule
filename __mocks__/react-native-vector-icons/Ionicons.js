/**
 * Jest mock for `react-native-vector-icons/Ionicons`.
 * A real (tiny) Text-based stand-in so tests don't need native font loading.
 */
const React = require('react');
const { Text } = require('react-native');

const createMockIcon = () => {
  const Component = ({ name, ...rest }) => React.createElement(Text, rest, name);
  Component.displayName = 'Icon';
  return Component;
};

module.exports = {
  __esModule: true,
  default: createMockIcon(),
  Button: createMockIcon(),
  getImageSource: jest.fn(() => Promise.resolve({ uri: 'mock' })),
  getImageSourceSync: jest.fn(() => ({ uri: 'mock' })),
};