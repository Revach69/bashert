import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function EventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">אירועים</h1>
        <p className="mt-2 text-muted-foreground">
          הצטרפו לאירועים בקוד הזמנה וגלשו בפרופילים של משתתפים אחרים.
        </p>
      </div>

      {/* Join Event by Code */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>הצטרפות לאירוע</CardTitle>
          <CardDescription>הזינו את קוד האירוע שקיבלתם מהמארגן</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement event join logic */}
          <div className="flex gap-3">
            <Input placeholder="קוד אירוע" className="max-w-xs" />
            <Button>
              <Search className="size-4" />
              הצטרפות
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Events */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="mb-4 size-16 text-muted-foreground/50" />
          <CardTitle className="mb-2">אין אירועים פעילים</CardTitle>
          <CardDescription className="text-center">
            הצטרפו לאירוע באמצעות קוד הזמנה כדי לגלוש בפרופילים
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
