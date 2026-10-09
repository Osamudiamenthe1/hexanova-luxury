/**
 * src/app/admin/projects/new/page.js
 * Create a new project.
 */

import { requireAdmin } from "@/lib/auth";
import { createProject } from "@/lib/actions/projects";
import ProjectForm from "../project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">New project</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details, then save. You&apos;ll be able to add gallery
          images and link products on the next screen.
        </p>
      </div>

      <ProjectForm action={createProject} />
    </div>
  );
}