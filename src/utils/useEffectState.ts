import { useState, useMemo, useEffect, EffectCallback } from 'react';

const useEffectStateStatic = <V extends object>(
  initializer: () => V,
  effect: (value: V) => ReturnType<EffectCallback>,
  input?: any[],
) => {
  const value = useMemo(() => ({ curr: null as V | null }), []);
  useEffect(() => {
    if (!value.curr) value.curr = initializer();
    return effect(value.curr);
  }, input);
  return value;
};

const useEffectStateDynamic = <V extends object>(
  initializer: () => V,
  effect: (value: V) => ReturnType<EffectCallback>,
  input?: any[],
) => {
  const [value, setValue] = useState<V | null>(null);
  useEffect(() => {
    const curr = value || initializer();
    if (!value) setValue(curr);
    return effect(curr);
  }, input);
  return value;
};

export { useEffectStateStatic, useEffectStateDynamic };
