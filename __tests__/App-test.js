/**
 * @format
 */

import 'react-native';
import React from 'react';
// Note: test renderer must be required after react-native.
import renderer, { act } from 'react-test-renderer';

import App from '../App';
import { queryClient } from '../src/queryClient';

afterEach(() => {
  // Prevent React Query's garbage collection timers from keeping Jest alive.
  queryClient.clear();
});

it('renders correctly', () => {
  let tree;

  act(() => {
    tree = renderer.create(<App />);
  });

  act(() => {
    tree.unmount();
  });
});
