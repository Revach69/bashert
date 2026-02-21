import type { ReactNode } from "react";

// Minimal root layout — the real layout lives in [locale]/layout.tsx
// which sets <html lang>, dir, fonts, and NextIntlClientProvider.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
