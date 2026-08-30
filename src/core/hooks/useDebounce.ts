import { useEffect, useRef, useState } from 'react';

/**
 * useDebounce: returns a derived value that only updates after `delay` ms of
 * inactivity. Used to keep search inputs responsive while deferring expensive
 * filtering to the data layer.
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

/**
 * usePrevious: track the previous value of a variable (eg. to detect changes).
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const prev = ref.current;
  ref.current = value;
  return prev;
}

/**
 * useNow: a ticking clock that updates every `intervalMs`. Useful for
 * "upcoming slot" countdowns without driving full re-renders from elsewhere.
 */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * useLatestRef: keeps a ref pointing at the latest value of a prop/closure,
 * avoiding stale closures inside interval/timeout callbacks.
 */
export function useLatestRef<T>(value: T): { current: T } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}