/* eslint-env jest */

// Async Storage ships an official Jest mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area context ships an official Jest mock.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// Native language detection is not available in the test environment.
jest.mock('@os-team/i18next-react-native-language-detector', () => ({
  __esModule: true,
  default: {
    type: 'languageDetector',
    init: () => {},
    detect: () => 'en',
    cacheUserLanguage: () => {},
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-vector-icons/FontAwesome5', () => 'FontAwesome5');

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: jest.fn(),
    getString: jest.fn(() => Promise.resolve('')),
  },
}));

// The native shadow module relies on react-native-svg, which needs a native
// view. Render children directly instead.
jest.mock('react-native-shadow-2', () => {
  const React = require('react');
  return {
    Shadow: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});

// Fake the project's own native modules.
jest.mock('./src/modules/CardConv', () => ({
  __esModule: true,
  default: {
    convertSID: jest.fn(() => Promise.resolve('02FE0000ABCDEF01')),
  },
}));

jest.mock('./src/modules/Hcef', () => ({
  __esModule: true,
  default: {
    support: true,
    enabled: true,
    enableService: jest.fn(() => Promise.resolve(true)),
    disableService: jest.fn(() => Promise.resolve(true)),
  },
}));
