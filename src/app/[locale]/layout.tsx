import { notFound } from "next/navigation";
import { Heebo, Noto_Sans_Arabic, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isRtl, type Locale } from "@/i18n/config";
import "../globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/** All font CSS variable classes — loaded once, applied per-locale via --font-sans override. */
const allFontVars = `${heebo.variable} ${notoSansArabic.variable} ${inter.variable}`;

/**
 * Returns a CSS style object that overrides --font-sans for the current locale.
 * - Arabic → Noto Sans Arabic (primary), Heebo (fallback for mixed content)
 * - Russian → Inter (Cyrillic), Heebo (fallback)
 * - All others → Heebo (Hebrew + Latin)
 */
function getFontOverride(locale: string): React.CSSProperties | undefined {
  switch (locale) {
    case "ar":
      return { "--font-sans": "var(--font-noto-arabic), var(--font-heebo)" } as React.CSSProperties;
    case "ru":
      return { "--font-sans": "var(--font-inter), var(--font-heebo)" } as React.CSSProperties;
    default:
      return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${allFontVars} font-sans antialiased`} style={getFontOverride(locale)}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
