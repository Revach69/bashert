"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<
  UserRole,
  { label: string; description: string }
> = {
  creator: {
    label: "יוצר/ת פרופיל",
    description: "יצירת כרטיסי פרופיל עבורכם או עבור בני משפחה",
  },
  matchmaker: {
    label: "שדכן/ית",
    description: "ניהול בקשות עניין וליווי תהליכי שידוך",
  },
  organizer: {
    label: "מארגן/ת",
    description: "יצירת אירועים והזמנת משתתפים",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["creator"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleRole(role: UserRole) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate input
    const result = registerSchema.safeParse({
      full_name: fullName,
      email,
      password,
      phone: phone || undefined,
      roles: selectedRoles,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            roles: selectedRoles,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("כתובת אימייל זו כבר רשומה במערכת. נסו להתחבר.");
        } else {
          setError("אירעה שגיאה בהרשמה. אנא נסו שנית.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("אירעה שגיאה בהרשמה. אנא נסו שנית.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Heart className="size-12 text-primary" />
              <h2 className="text-xl font-bold">ההרשמה הושלמה!</h2>
              <p className="text-center text-sm text-muted-foreground">
                שלחנו אליכם אימייל לאימות החשבון. אנא בדקו את תיבת הדואר שלכם
                ולחצו על הקישור לאימות.
              </p>
              <Link href="/auth/login">
                <Button variant="outline">חזרה לכניסה</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link href="/" className="flex flex-col items-center gap-2">
            <Heart className="size-10 text-primary" />
            <h1 className="text-2xl font-bold text-primary">בשערט</h1>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">הרשמה לבשערט</CardTitle>
            <CardDescription>
              צרו חשבון חדש כדי להתחיל להשתמש בפלטפורמה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="ישראל ישראלי"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">דוא״ל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  dir="ltr"
                  className="text-start"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="לפחות 6 תווים"
                    dir="ltr"
                    className="pe-10 text-start"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "הסתרת סיסמה" : "הצגת סיסמה"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone (optional) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">
                  טלפון{" "}
                  <span className="text-muted-foreground">(אופציונלי)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="050-000-0000"
                  dir="ltr"
                  className="text-start"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-3">
                <Label>תפקידים</Label>
                <p className="text-xs text-muted-foreground">
                  ניתן לבחור יותר מתפקיד אחד
                </p>
                <div className="flex flex-col gap-3">
                  {(
                    Object.entries(ROLE_LABELS) as [
                      UserRole,
                      (typeof ROLE_LABELS)[UserRole],
                    ][]
                  ).map(([role, { label, description }]) => (
                    <label
                      key={role}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "יוצר חשבון..." : "הרשמה"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              כבר יש לכם חשבון?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                כניסה
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
