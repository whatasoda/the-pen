import { useState } from 'react';

export const useRerender = () => {
  const [, setCount] = useState(0);
  return () => setCount(increment);
};
const increment = (value: number) => value + 1;
