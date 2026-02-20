import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bashert - בשערט",
  description:
    "פלטפורמת שידוכים מבוססת אירועים לקהילות אורתודוקסיות. גלו שידוכים בשמחות ואירועים קהילתיים.",
  keywords: ["שידוכים", "שדכנות", "אירועים", "שמחות", "קהילה"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-sans antialiased`}>
        {/* TODO: Wrap with AuthProvider when auth context is ready */}
        {children}
      </body>
    </html>
  );
}
