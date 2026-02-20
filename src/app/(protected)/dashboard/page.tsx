import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, CalendarDays, Heart } from "lucide-react";

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Load actual profile count */}
              עדיין לא נוצרו כרטיסי פרופיל
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">אירועים פעילים</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Load actual event count */}
              אין אירועים פעילים כרגע
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">בקשות עניין</CardTitle>
            <Heart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Load actual interest request count */}
              אין בקשות עניין חדשות
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>התחילו לבנות את הנוכחות שלכם בבשערט</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <Plus className="size-4" />
            יצירת כרטיס פרופיל
          </Button>
          <Button variant="outline">
            <CalendarDays className="size-4" />
            הצטרפות לאירוע
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
