import { getTranslations } from "next-intl/server";

import { getMyEvents } from "@/app/actions/event";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
import { EventList } from "@/components/events/event-list";
import { JoinEventForm } from "@/components/events/join-event-form";

export default async function EventPage() {
  const t = await getTranslations("event");
  const result = await getMyEvents();
  const events = result.success ? result.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Join Event section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("joinEvent")}</CardTitle>
          <CardDescription>
            {t("joinEventDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JoinEventForm />
        </CardContent>
      </Card>

      <Separator className="mb-8" />

      {/* My Events section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("myEvents")}</h2>
        <CreateEventDialog />
      </div>

      <EventList events={events} />
    </div>
  );
}
