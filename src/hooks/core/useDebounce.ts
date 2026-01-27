import { useRef, useEffect, useMemo } from 'react';

/**
 * Simple debounce implementation
 * Returns a function that delays invoking callback until after delay milliseconds
 */
function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Custom hook for debouncing callbacks with access to latest state
 * 
 * @see https://www.developerway.com/posts/debouncing-in-react
 * 
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const [value, setValue] = useState('');
 *   
 *   // Expensive operation (API call, validation)
 *   const debouncedValidation = useDebounce(() => {
 *     validateField(value); // Has access to latest state
 *   }, 500);
 *   
 *   const onChange = (e) => {
 *     setValue(e.target.value); // Immediate UI update
 *     debouncedValidation(); // Debounced expensive operation
 *   };
 *   
 *   return <input onChange={onChange} value={value} />;
 * };
 * ```
 */
export function useDebounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number = 500
): (...args: T) => void {
  const callbackRef = useRef(callback);

  // Always update ref with latest callback to avoid stale closures
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function ONCE - won't recreate on re-renders
  const debouncedCallback = useMemo(() => {
    const func = (...args: T) => {
      // Access latest callback via ref (not closure)
      callbackRef.current(...args);
    };
    return debounce(func, delay);
  }, [delay]);

  return debouncedCallback;
}
