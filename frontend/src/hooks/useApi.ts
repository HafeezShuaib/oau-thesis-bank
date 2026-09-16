import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncStatus } from '../types/api';

export const useApi = <T,>(
  loader: (() => Promise<T>) | null,
  deps: unknown[] = [],
  enabled = true,
) => {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<AsyncStatus>(enabled ? 'loading' : 'idle');

  const refetch = useCallback(async () => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) {
      setStatus('idle');
      return null;
    }
    setStatus('loading');
    setError(null);
    try {
      const result = await currentLoader();
      setData(result);
      setStatus('success');
      return result;
    } catch (nextError) {
      setError(nextError);
      setStatus('error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (enabled) void refetch();
    else setStatus('idle');
    // The caller controls when a request should refresh through deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refetch, ...deps]);

  return { data, error, status, loading: status === 'loading', refetch };
};

export const useMutation = <T, P = void>() => {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<unknown>(null);
  const mutate = useCallback(async (operation: (payload: P) => Promise<T>, payload: P) => {
    setStatus('loading');
    setError(null);
    try {
      const result = await operation(payload);
      setStatus('success');
      return result;
    } catch (nextError) {
      setError(nextError);
      setStatus('error');
      throw nextError;
    }
  }, []);
  return { mutate, status, error, loading: status === 'loading' };
};
