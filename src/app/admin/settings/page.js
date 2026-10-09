/**
 * src/app/admin/settings/page.js
 * Site settings editor. One form, grouped by section. Reads all current
 * settings and passes them to the form.
 */

import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">Site settings</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Text and images used across the public site. Changes go live within
          a few seconds of saving.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}