import { requireAdmin } from "@/lib/auth";
import { getAllProjectsAdmin } from "@/lib/data/admin-misc";
import { createTestimonial } from "@/lib/actions/testimonials";
import TestimonialForm from "../testimonial-form";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await requireAdmin();
  const projects = await getAllProjectsAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">New testimonial</h1>
        <p className="text-sm text-muted-foreground">
          Short quotes from clients. Visible ones appear on the home page.
        </p>
      </div>

      <TestimonialForm projects={projects} action={createTestimonial} />
    </div>
  );
}