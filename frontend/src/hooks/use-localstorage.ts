"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const stored = localStorage.getItem(key) as T | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setValue(stored);
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
