import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageSquare, TrendingUp } from "lucide-react";

export default function MatchmakerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">לוח בקרה - שדכן/ית</h1>
        <p className="mt-2 text-muted-foreground">
          נהלו בקשות עניין ועקבו אחר התאמות באירועים שלכם.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">בקשות חדשות</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">התאמות הדדיות</CardTitle>
            <Heart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">פרופילים פעילים</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">אחוז מענה</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder */}
      {/* TODO: Implement matchmaker dashboard with interest requests list */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Heart className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין בקשות עניין ממתינות</CardTitle>
          <CardDescription className="text-center">
            כאשר משתתפים ישלחו בקשות עניין באירועים שלכם, הן יופיעו כאן
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
