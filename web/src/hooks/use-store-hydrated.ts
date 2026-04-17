"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";

export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = useAppStore.persist;
    if (!p) {
      setHydrated(true);
      return;
    }
    if (p.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = p.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}
