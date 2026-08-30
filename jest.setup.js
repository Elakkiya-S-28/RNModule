/* eslint-disable */
/**
 * Jest global setup.
 *
 * Mocks React Native native modules that aren't linked in a plain Jest
 * environment (NetInfo, AsyncStorage) so the app and its tests can run
 * without rebuilding native pods.
 */

// NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true, type: 'wifi', details: null }),
  ),
}));
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key, value) => {
        store[key] = String(value);
        return Promise.resolve();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(k => delete store[k]);
        return Promise.resolve();
      }),
    },
  };
});