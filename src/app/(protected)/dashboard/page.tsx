import Link from "next/link";
import { Plus, Users, CalendarDays, Heart, User as UserIcon } from "lucide-react";

import { getDashboardStats } from "@/app/actions/dashboard";
import { getMyProfiles } from "@/app/actions/profile";
import { calculateAge } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [statsResult, profilesResult] = await Promise.all([
    getDashboardStats(),
    getMyProfiles(),
  ]);

  const stats = statsResult.success
    ? statsResult.data
    : { profileCount: 0, activeEventCount: 0, pendingRequestCount: 0 };

  const profiles = profilesResult.success ? profilesResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
        <p className="mt-2 text-muted-foreground">
          ברוכים הבאים לבשערט. נהלו את הפרופילים והאירועים שלכם.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">כרטיסי פרופיל</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.profileCount === 0
                ? "עדיין לא נוצרו כרטיסי פרופיל"
                : `${stats.profileCount} כרטיסים פעילים`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">אירועים פעילים</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEventCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEventCount === 0
                ? "אין אירועים פעילים כרגע"
                : `${stats.activeEventCount} אירועים עם השתתפות`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">בקשות עניין</CardTitle>
            <Heart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequestCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingRequestCount === 0
                ? "אין בקשות עניין ממתינות"
                : `${stats.pendingRequestCount} בקשות ממתינות`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>התחילו לבנות את הנוכחות שלכם בבשערט</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/profile">
              <Plus className="size-4" />
              יצירת כרטיס פרופיל
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/event">
              <CalendarDays className="size-4" />
              הצטרפות לאירוע
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Profiles */}
      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>הכרטיסים שלי</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">צפייה בהכל</Link>
              </Button>
            </div>
            <CardDescription>כרטיסי הפרופיל האחרונים שנוצרו</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles.slice(0, 5).map((profile) => {
                const age = calculateAge(new Date(profile.date_of_birth));
                const genderLabel = profile.gender === "male" ? "זכר" : "נקבה";
                const initials =
                  (profile.subject_first_name?.[0] ?? "") +
                  (profile.subject_last_name?.[0] ?? "");

                return (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar className="size-10">
                      {profile.photo_url ? (
                        <AvatarImage
                          src={profile.photo_url}
                          alt={`${profile.subject_first_name} ${profile.subject_last_name}`}
                        />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {initials || <UserIcon className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {profile.subject_first_name} {profile.subject_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {genderLabel}, גיל {age}
                        {profile.hashkafa && ` \u00B7 ${profile.hashkafa}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.occupation && (
                        <Badge variant="secondary" className="text-xs">
                          {profile.occupation}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
