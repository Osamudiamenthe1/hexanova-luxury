/**
 * src/app/admin/projects/[id]/page.js
 * Edit a project: details form, cover image, gallery, and product links.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  getAllProductsForSelect,
  getLinkedProductIds,
  getProjectByIdAdmin,
} from "@/lib/data/admin-projects";
import { updateProject, setProjectProducts } from "@/lib/actions/projects";
import ProjectForm from "../project-form";
import SavedBanner from "@/components/admin/saved-banner";
import ProjectImageManager from "@/components/admin/project-image-manager";
import ProductMultiSelect from "@/components/admin/product-multi-select";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const search = await searchParams;
  const saved = search?.saved;

  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();

  const [products, linkedIds] = await Promise.all([
    getAllProductsForSelect(),
    getLinkedProductIds(project.id),
  ]);

  const updateAction = updateProject.bind(null, project.id);
  const setProductsAction = setProjectProducts.bind(null, project.id);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All projects
        </Link>
        <h1 className="text-3xl font-heading mb-1">{project.title}</h1>
        <p className="text-sm text-muted-foreground">
          /projects/{project.slug}
        </p>
      </div>

            <SavedBanner message={saved ? "Project saved." : null} />

      {/* Gallery images */}
      <section className="space-y-5">
        <div className="border-b border-border pb-2">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Gallery images
          </h2>
        </div>
        <ProjectImageManager
          projectId={project.id}
          images={project.project_images}
        />
      </section>

      {/* Product links */}
      <section className="space-y-5">
        <div className="border-b border-border pb-2">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Products used in this project
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Link products that were used in this project. They&apos;ll appear
          as a &quot;Products used&quot; section on the project page, linking
          back to the shop.
        </p>
        <ProductMultiSelect
          action={setProductsAction}
          products={products}
          selectedIds={linkedIds}
        />
      </section>

      {/* Details form */}
      <section className="space-y-5">
        <div className="border-b border-border pb-2">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Details
          </h2>
        </div>
        <ProjectForm project={project} action={updateAction} />
      </section>
    </div>
  );
}