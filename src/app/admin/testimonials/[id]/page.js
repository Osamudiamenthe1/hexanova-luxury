import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getAllProjectsAdmin,
  getTestimonialByIdAdmin,
} from "@/lib/data/admin-misc";
import { updateTestimonial } from "@/lib/actions/testimonials";
import TestimonialForm from "../testimonial-form";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const [testimonial, projects] = await Promise.all([
    getTestimonialByIdAdmin(id),
    getAllProjectsAdmin(),
  ]);

  if (!testimonial) notFound();

  const action = updateTestimonial.bind(null, testimonial.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">Edit testimonial</h1>
        <p className="text-sm text-muted-foreground">
          Changes go live on the public site within a few seconds.
        </p>
      </div>

      <TestimonialForm
        testimonial={testimonial}
        projects={projects}
        action={action}
      />
    </div>
  );
}