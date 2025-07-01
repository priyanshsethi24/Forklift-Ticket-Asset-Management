import { useState, useEffect } from 'react';
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the value changes before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Runs when value or delay changes

  return debouncedValue;
}

export default useDebounce;
