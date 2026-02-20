import Link from "next/link";
import { Heart, Users, CalendarDays, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "מבוסס אירועים",
    description:
      "פרופילים נגישים רק במסגרת אירועים ושמחות — בדיוק כמו המפגש האמיתי.",
  },
  {
    icon: Users,
    title: "כרטיסי פרופיל",
    description:
      "צרו כרטיס פרופיל מקצועי שניתן לשימוש חוזר באירועים שונים.",
  },
  {
    icon: Shield,
    title: "השדכן שומר",
    description:
      "כל בקשת עניין עוברת דרך שדכן/ית מקצועי/ת — לא אפליקציית הכרויות.",
  },
  {
    icon: Sparkles,
    title: "התאמה הדדית",
    description:
      "המערכת מזהה אוטומטית כאשר שני צדדים מביעים עניין הדדי.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "הרשמה",
    description: "צרו חשבון ובחרו את התפקיד שלכם — יוצר פרופיל, שדכן/ית, או מארגן/ת.",
  },
  {
    number: "02",
    title: "יצירת פרופיל",
    description: "בנו כרטיס פרופיל מפורט עם כל המידע הרלוונטי.",
  },
  {
    number: "03",
    title: "הצטרפות לאירוע",
    description: "קבלו קוד הזמנה ממארגן/ת האירוע והצטרפו לשמחה.",
  },
  {
    number: "04",
    title: "הבעת עניין",
    description: "גלשו בפרופילים ושלחו בקשת עניין — השדכן/ית ילוו את התהליך.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -end-20 -top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -start-20 top-40 size-56 rounded-full bg-gold/10 blur-3xl" />
          </div>

          <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                <Heart className="size-3.5 text-primary" />
                <span>פלטפורמת שידוכים מבוססת אירועים</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                מוצאים את
                <span className="text-primary"> הבשערט </span>
                בשמחות
              </h1>

              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                בשערט מחברת בין משפחות ויחידים בשמחות ואירועים קהילתיים,
                בליווי שדכנים מקצועיים — בדיוק כמו שזה אמור להיות.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                    הרשמה לבשערט
                    <ArrowLeft className="size-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full px-8 text-base sm:w-auto"
                  >
                    כניסה לחשבון קיים
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
                למה בשערט?
              </h2>
              <p className="text-lg text-muted-foreground">
                פלטפורמה שנבנתה מהיסוד עבור הקהילה האורתודוקסית,
                עם כבוד לתהליך המסורתי.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
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
                איך זה עובד?
              </h2>
              <p className="text-lg text-muted-foreground">
                ארבעה צעדים פשוטים להתחלת המסע
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col gap-8">
                {STEPS.map((step, index) => (
                  <div key={step.number} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        {step.number}
                      </div>
                      {index < STEPS.length - 1 && (
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
                מוכנים להתחיל?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                הצטרפו לבשערט היום ותתחילו למצוא שידוכים בשמחות הקרובות.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                    הרשמה חינם
                    <ArrowLeft className="size-4" />
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
