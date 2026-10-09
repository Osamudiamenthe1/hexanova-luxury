/**
 * src/app/admin/projects/project-form.js
 * Shared create/edit form for projects. All fields controlled.
 */

"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Input, Textarea } from "@/components/admin/form-field";
import CheckboxField from "@/components/admin/checkbox-field";
import SingleImageUpload from "@/components/admin/single-image-upload";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectForm({ project, action }) {
  const [state, formAction, pending] = useActionState(action, {});

  const [fields, setFields] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    client_name: project?.client_name ?? "",
    location: project?.location ?? "",
    year: project?.year != null ? String(project.year) : "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "draft",
    is_featured: project?.is_featured ?? false,
  });

  const [slugEdited, setSlugEdited] = useState(Boolean(project?.slug));

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!slugEdited) {
      setFields((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [fields.title, slugEdited]);

  const statusOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ];

  return (
    <form action={formAction} className="space-y-10 max-w-3xl">
      {/* Basic info */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Basic info
        </h2>

        <Input
          label="Title"
          name="title"
          required
          value={fields.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Ikoyi Apartment"
        />

        <Input
          label="Slug"
          name="slug"
          required
          value={fields.slug}
          onChange={(e) => {
            setField("slug", e.target.value);
            setSlugEdited(true);
          }}
          help="Used in the URL, e.g. /projects/ikoyi-apartment."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Client"
            name="client_name"
            value={fields.client_name}
            onChange={(e) => setField("client_name", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Location"
            name="location"
            value={fields.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="e.g. Ikoyi, Lagos"
          />
          <Input
            label="Year"
            name="year"
            type="number"
            value={fields.year}
            onChange={(e) => setField("year", e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>
      </section>

      {/* Cover image */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Cover image
        </h2>

        <SingleImageUpload
          name="cover_image_url"
          label="Cover"
          initialUrl={project?.cover_image_url || ""}
          folder="projects"
          help="The big image at the top of the project page. Landscape works best."
        />
      </section>

      {/* Story */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Story
        </h2>

        <Textarea
          label="Summary"
          name="summary"
          rows={2}
          value={fields.summary}
          onChange={(e) => setField("summary", e.target.value)}
          help="One or two sentences. Shows on the projects grid and near the top of the page."
        />

        <Textarea
          label="Description"
          name="description"
          rows={8}
          value={fields.description}
          onChange={(e) => setField("description", e.target.value)}
          help="The full case study. The brief, what you did, materials used."
        />
      </section>

      {/* Visibility */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Visibility
        </h2>

        <div>
          <label
            htmlFor="status"
            className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Status
          </label>
          <CustomSelect
            id="status"
            name="status"
            value={fields.status}
            onChange={(v) => setField("status", v)}
            options={statusOptions}
          />
        </div>

        <CheckboxField
          label="Feature on the home page"
          name="is_featured"
          checked={fields.is_featured}
          onChange={(v) => setField("is_featured", v)}
          help="Featured projects appear in the 'Selected projects' section."
        />
      </section>

      {/* Error and actions */}
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : project ? "Save changes" : "Create project"}
        </Button>
        <Button href="/admin/projects" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}