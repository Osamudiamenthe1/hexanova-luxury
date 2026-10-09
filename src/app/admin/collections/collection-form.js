"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { Input, Textarea } from "@/components/admin/form-field";
import CheckboxField from "@/components/admin/checkbox-field";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CollectionForm({ collection, action }) {
  const [state, formAction, pending] = useActionState(action, {});

  const [fields, setFields] = useState({
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    cover_image_url: collection?.cover_image_url ?? "",
    sort_order: collection?.sort_order != null ? String(collection.sort_order) : "0",
    is_featured: collection?.is_featured ?? false,
  });

  const [slugEdited, setSlugEdited] = useState(Boolean(collection?.slug));

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!slugEdited) {
      setFields((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [fields.name, slugEdited]);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <Input
        label="Name"
        name="name"
        required
        value={fields.name}
        onChange={(e) => setField("name", e.target.value)}
        placeholder="e.g. Noir Collection"
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
        help="Used in the URL, e.g. /collections/noir-collection."
      />

      <Textarea
        label="Description"
        name="description"
        rows={3}
        value={fields.description}
        onChange={(e) => setField("description", e.target.value)}
        help="Shown at the top of the collection page."
      />

      <Input
        label="Cover image URL"
        name="cover_image_url"
        value={fields.cover_image_url}
        onChange={(e) => setField("cover_image_url", e.target.value)}
        placeholder="Leave empty for now"
        help="Optional. Paste a URL or leave empty to use the placeholder."
      />

      <Input
        label="Sort order"
        name="sort_order"
        type="number"
        value={fields.sort_order}
        onChange={(e) => setField("sort_order", e.target.value)}
        help="Lower numbers appear first."
      />

      <CheckboxField
        label="Feature this collection on the home page"
        name="is_featured"
        checked={fields.is_featured}
        onChange={(v) => setField("is_featured", v)}
      />

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending
            ? "Saving..."
            : collection
            ? "Save changes"
            : "Create collection"}
        </Button>
        <Button href="/admin/collections" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}