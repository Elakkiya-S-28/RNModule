/**
 * Custom-hook tests using the react test renderer.
 */

import React from 'react';
import { act, create } from 'react-test-renderer';
import { useDebounce, usePrevious } from '../src/core/hooks/useDebounce';

function DebounceHarness({ value, delay }: { value: string; delay: number }) {
  const debounced = useDebounce(value, delay);
  return <div>{debounced}</div>;
}

describe('useDebounce', () => {
  it('defers value updates until the delay elapses', async () => {
    let renderer: any;
    await act(async () => {
      renderer = create(<DebounceHarness value="a" delay={150} />);
    });
    expect(renderer.root.findByType('div').children[0]).toBe('a');

    // Change value to "b" — should not be visible immediately.
    await act(async () => {
      renderer.update(<DebounceHarness value="b" delay={150} />);
    });
    expect(renderer.root.findByType('div').children[0]).toBe('a');

    // Wait past the debounce delay.
    await act(async () => {
      await new Promise<void>(r => setTimeout(r, 250));
    });
    expect(renderer.root.findByType('div').children[0]).toBe('b');
  });
});

function PreviousHarness({ value }: { value: string }) {
  const prev = usePrevious(value);
  return <div>{String(prev)}</div>;
}

describe('usePrevious', () => {
  it('returns the previous value after an update', async () => {
    let renderer: any;
    await act(async () => {
      renderer = create(<PreviousHarness value="first" />);
    });
    // First render: previous is undefined.
    expect(renderer.root.findByType('div').children[0]).toBe('undefined');
    await act(async () => {
      renderer.update(<PreviousHarness value="second" />);
    });
    expect(renderer.root.findByType('div').children[0]).toBe('first');
  });
});