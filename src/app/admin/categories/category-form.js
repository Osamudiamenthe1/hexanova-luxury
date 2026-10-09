/**
 * src/app/admin/categories/category-form.js
 * Shared form used by both the "new" and "edit" pages.
 *
 * Client component because:
 *   - It auto-generates the slug from the name as you type.
 *   - It shows the loading state and error messages from the action.
 *
 * The "action" prop is the server action to call (create or update with
 * the id already bound). The parent pages supply it.
 */

"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { Input, Textarea } from "@/components/admin/form-field";

/**
 * Turn a name into a URL-friendly slug:
 *   "Living Room"  ->  "living-room"
 *   "À la carte!"  ->  "a-la-carte"
 */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryForm({ category, action }) {
  const [state, formAction, pending] = useActionState(action, {});

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  // Once the user edits the slug by hand, stop auto-updating it from name.
  const [slugEdited, setSlugEdited] = useState(Boolean(category?.slug));

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name));
  }, [name, slugEdited]);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <Input
        label="Name"
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Living Room"
        help="Shown on the public site."
      />

      <Input
        label="Slug"
        name="slug"
        required
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugEdited(true);
        }}
        help="Used in the URL, e.g. /categories/living-room. Lowercase letters, numbers, and hyphens only."
      />

      <Textarea
        label="Description"
        name="description"
        rows={3}
        defaultValue={category?.description || ""}
        help="Optional. Shown at the top of the category page."
      />

      <Input
        label="Image URL"
        name="image_url"
        defaultValue={category?.image_url || ""}
        placeholder="Leave empty for now"
        help="Optional. Paste a URL from Supabase Storage, or leave empty to use the placeholder."
      />

      <Input
        label="Sort order"
        name="sort_order"
        type="number"
        defaultValue={category?.sort_order ?? 0}
        help="Lower numbers appear first."
      />

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : category ? "Save changes" : "Create category"}
        </Button>
        <Button href="/admin/categories" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}