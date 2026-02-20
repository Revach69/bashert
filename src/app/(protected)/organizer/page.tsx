import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays, Link2, Users } from "lucide-react";

export default function OrganizerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">לוח בקרה - מארגן/ת</h1>
          <p className="mt-2 text-muted-foreground">
            צרו ונהלו אירועים, הקצו שדכנים והפיצו קודי הזמנה.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          אירוע חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">אירועים</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">משתתפים</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">קישורי הזמנה</CardTitle>
            <Link2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder */}
      {/* TODO: Implement organizer dashboard with event list */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין אירועים עדיין</CardTitle>
          <CardDescription className="mb-6 text-center">
            צרו את האירוע הראשון שלכם והתחילו להזמין משתתפים
          </CardDescription>
          <Button>
            <Plus className="size-4" />
            יצירת אירוע ראשון
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
