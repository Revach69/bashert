import { Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            <span className="text-sm font-semibold text-primary">בשערט</span>
          </div>
          <Separator className="max-w-xs" />
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} בשערט. כל הזכויות שמורות.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            פלטפורמת שידוכים מבוססת אירועים לקהילות אורתודוקסיות
          </p>
        </div>
      </div>
    </footer>
  );
}
