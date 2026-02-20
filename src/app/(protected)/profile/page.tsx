import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">כרטיסי פרופיל</h1>
          <p className="mt-2 text-muted-foreground">
            נהלו את כרטיסי הפרופיל שלכם. ניתן ליצור כרטיסים עבור עצמכם או עבור בני משפחה.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          כרטיס חדש
        </Button>
      </div>

      {/* Empty State */}
      {/* TODO: Load and display actual profile cards */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserCircle className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין עדיין כרטיסי פרופיל</CardTitle>
          <CardDescription className="mb-6 text-center">
            צרו את כרטיס הפרופיל הראשון שלכם כדי להתחיל להשתתף באירועים
          </CardDescription>
          <Button>
            <Plus className="size-4" />
            יצירת כרטיס פרופיל ראשון
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
