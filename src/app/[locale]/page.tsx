import { Heart, Users, CalendarDays, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";

const FEATURE_ICONS = [CalendarDays, Users, Shield, Sparkles];

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const features = [
    { icon: FEATURE_ICONS[0], title: t("feature1Title"), description: t("feature1Description") },
    { icon: FEATURE_ICONS[1], title: t("feature2Title"), description: t("feature2Description") },
    { icon: FEATURE_ICONS[2], title: t("feature3Title"), description: t("feature3Description") },
    { icon: FEATURE_ICONS[3], title: t("feature4Title"), description: t("feature4Description") },
  ];

  const steps = [
    { number: "01", title: t("step1Title"), description: t("step1Description") },
    { number: "02", title: t("step2Title"), description: t("step2Description") },
    { number: "03", title: t("step3Title"), description: t("step3Description") },
    { number: "04", title: t("step4Title"), description: t("step4Description") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -end-20 -top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -start-20 top-40 size-56 rounded-full bg-gold/10 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                <Heart className="size-3.5 text-primary" />
                <span>{t("badge")}</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t("heroTitle")}
                <span className="text-primary">{t("heroHighlight")}</span>
                {t("heroSuffix")}
              </h1>

              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {t("heroDescription")}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                    {t("heroCta")}
                    <ArrowLeft className="size-4 ltr:rotate-180" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full px-8 text-base sm:w-auto"
                  >
                    {t("heroLogin")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/20 py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                {t("whyTitle")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("whyDescription")}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className="border-0 bg-background shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex gap-4 pt-6">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1.5 text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                {t("howTitle")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("howDescription")}
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col gap-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="mt-2 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="pb-8">
                      <h3 className="mb-1.5 text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary/5 py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <Heart className="mx-auto mb-6 size-10 text-primary" />
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                {t("ctaTitle")}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {t("ctaDescription")}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                    {t("ctaButton")}
                    <ArrowLeft className="size-4 ltr:rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
