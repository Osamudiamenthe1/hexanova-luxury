/**
 * src/app/admin/products/product-form.js
 * The create/edit form for a product.
 *
 * Every field is controlled by local state. This is deliberate: React 19
 * resets uncontrolled inputs after a Server Action runs, which would wipe
 * everything the admin typed when they hit a validation error.
 *
 * Controlled fields keep their values across error responses, so the admin
 * only has to fix what was wrong, not re-enter the whole form.
 */

"use client";

import { useActionState, useEffect, useState } from "react";
import Button from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
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

export default function ProductForm({
  product,
  categories,
  collections,
  action,
}) {
  const [state, formAction, pending] = useActionState(action, {});

  // All fields live in one state object. The initial values come from the
  // product (edit mode) or are empty strings (create mode).
  const [fields, setFields] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? "",
    collection_id: product?.collection_id ?? "",
    price: product?.price != null ? String(product.price) : "",
    show_price: product?.show_price ?? true,
    materials: product?.materials ?? "",
    dimensions: product?.dimensions ?? "",
    lead_time: product?.lead_time ?? "",
    is_featured: product?.is_featured ?? false,
    status: product?.status ?? "draft",
  });

  // Once the user edits the slug by hand, stop auto-updating it from name.
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));

  // Helper so we don't write setFields({...fields, key: value}) everywhere.
  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-fill the slug from the name until the user edits it.
  useEffect(() => {
    if (!slugEdited) {
      setFields((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [fields.name, slugEdited]);

  const categoryOptions = [
    { value: "", label: "Choose a category..." },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const collectionOptions = [
    { value: "", label: "None" },
    ...collections.map((c) => ({ value: c.id, label: c.name })),
  ];

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
          label="Name"
          name="name"
          required
          value={fields.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g. Adaeze Three-Seater Sofa"
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
          help="Used in the URL, e.g. /products/adaeze-three-seater-sofa."
        />

        <Textarea
          label="Short description"
          name="short_description"
          rows={2}
          value={fields.short_description}
          onChange={(e) => setField("short_description", e.target.value)}
          help="One or two sentences. Shown on cards and near the top of the product page."
        />

        <Textarea
          label="Long description"
          name="description"
          rows={6}
          value={fields.description}
          onChange={(e) => setField("description", e.target.value)}
          help="Full description. Craftsmanship, materials, story."
        />
      </section>

      {/* Categorisation */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Categorisation
        </h2>

        <div>
          <label htmlFor="category_id" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Category <span className="text-accent">*</span>
          </label>
          <CustomSelect
            id="category_id"
            name="category_id"
            value={fields.category_id}
            onChange={(v) => setField("category_id", v)}
            options={categoryOptions}
          />
        </div>

        <div>
          <label htmlFor="collection_id" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Collection
          </label>
          <CustomSelect
            id="collection_id"
            name="collection_id"
            value={fields.collection_id}
            onChange={(v) => setField("collection_id", v)}
            options={collectionOptions}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Pricing
        </h2>

        <Input
          label="Price (₦)"
          name="price"
          type="number"
          required
          value={fields.price}
          onChange={(e) => setField("price", e.target.value)}
          placeholder="e.g. 2450000"
          help="Just the number. The ₦ symbol is added automatically."
        />

        <CheckboxField
          label="Show the price on the public site"
          name="show_price"
          checked={fields.show_price}
          onChange={(v) => setField("show_price", v)}
          help="If off, the site shows 'Price on request' instead."
        />
      </section>

      {/* Specs */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Specifications
        </h2>

        <Input
          label="Materials"
          name="materials"
          value={fields.materials}
          onChange={(e) => setField("materials", e.target.value)}
          placeholder="e.g. Solid oak, linen blend upholstery"
        />

        <Input
          label="Dimensions"
          name="dimensions"
          value={fields.dimensions}
          onChange={(e) => setField("dimensions", e.target.value)}
          placeholder="e.g. 220cm W x 95cm D x 72cm H"
        />

        <Input
          label="Lead time"
          name="lead_time"
          value={fields.lead_time}
          onChange={(e) => setField("lead_time", e.target.value)}
          placeholder="e.g. 10 to 12 weeks"
        />
      </section>

      {/* Visibility */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Visibility
        </h2>

        <div>
          <label htmlFor="status" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
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
          help="Featured products appear in the 'Featured furniture' section."
        />
      </section>

      {/* Error and actions */}
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
        <Button href="/admin/products" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}