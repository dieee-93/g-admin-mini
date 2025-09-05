// src/shared/hooks/useDebouncedCallback.ts
import { useEffect, useRef, useCallback } from 'react';

type AnyFunction = (...args: any[]) => any;

export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const promiseRef = useRef<{ resolve: (value: ReturnType<T>) => void, reject: (reason?: any) => void } | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Cleanup the timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise<ReturnType<T>>((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await callbackRef.current(...args);
          promiseRef.current?.resolve(result);
        } catch (error) {
          promiseRef.current?.reject(error);
        }
      }, delay);
    });
  }, [delay]);

  return debouncedCallback as (...args: Parameters<T>) => Promise<ReturnType<T>>;
}
