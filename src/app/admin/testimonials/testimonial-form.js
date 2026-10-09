"use client";

import { useActionState, useState } from "react";
import Button from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Input, Textarea } from "@/components/admin/form-field";
import CheckboxField from "@/components/admin/checkbox-field";

export default function TestimonialForm({ testimonial, projects, action }) {
  const [state, formAction, pending] = useActionState(action, {});

  const [fields, setFields] = useState({
    author_name: testimonial?.author_name ?? "",
    author_title: testimonial?.author_title ?? "",
    quote: testimonial?.quote ?? "",
    project_id: testimonial?.project_id ?? "",
    sort_order: testimonial?.sort_order != null ? String(testimonial.sort_order) : "0",
    is_visible: testimonial?.is_visible ?? true,
  });

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const projectOptions = [
    { value: "", label: "None (standalone testimonial)" },
    ...projects.map((p) => ({ value: p.id, label: p.title })),
  ];

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <Input
        label="Author name"
        name="author_name"
        required
        value={fields.author_name}
        onChange={(e) => setField("author_name", e.target.value)}
        placeholder="e.g. Mrs. F. Adeyemi"
        help="Shown below the quote on the public site."
      />

      <Input
        label="Author title / context"
        name="author_title"
        value={fields.author_title}
        onChange={(e) => setField("author_title", e.target.value)}
        placeholder="e.g. Ikoyi Apartment"
        help="Optional. A short line describing who they are."
      />

      <Textarea
        label="Quote"
        name="quote"
        required
        rows={4}
        value={fields.quote}
        onChange={(e) => setField("quote", e.target.value)}
        placeholder="What the client said."
      />

      <div>
        <label
          htmlFor="project_id"
          className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
        >
          Link to a project
        </label>
        <CustomSelect
          id="project_id"
          name="project_id"
          value={fields.project_id}
          onChange={(v) => setField("project_id", v)}
          options={projectOptions}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Optional. Connecting a testimonial to a project can surface it in
          that project&apos;s context later.
        </p>
      </div>

      <Input
        label="Sort order"
        name="sort_order"
        type="number"
        value={fields.sort_order}
        onChange={(e) => setField("sort_order", e.target.value)}
        help="Lower numbers appear first."
      />

      <CheckboxField
        label="Show this testimonial on the public site"
        name="is_visible"
        checked={fields.is_visible}
        onChange={(v) => setField("is_visible", v)}
      />

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending
            ? "Saving..."
            : testimonial
            ? "Save changes"
            : "Create testimonial"}
        </Button>
        <Button href="/admin/testimonials" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}