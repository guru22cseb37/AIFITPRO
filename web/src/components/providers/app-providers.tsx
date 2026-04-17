"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccentSync } from "@/components/providers/accent-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AccentSync />
      {children}
    </ThemeProvider>
  );
}
