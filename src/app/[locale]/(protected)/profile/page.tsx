import { getTranslations } from "next-intl/server";

import { getMyProfiles } from "@/app/actions/profile";
import { CreateProfileDialog } from "@/components/profiles/create-profile-dialog";
import { ProfileList } from "@/components/profiles/profile-list";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const result = await getMyProfiles();
  const profiles = result.success ? result.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <CreateProfileDialog />
      </div>

      {/* Profile cards grid */}
      <ProfileList profiles={profiles} />
    </div>
  );
}
