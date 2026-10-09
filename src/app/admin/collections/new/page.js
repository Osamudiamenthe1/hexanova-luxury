import { requireAdmin } from "@/lib/auth";
import { createCollection } from "@/lib/actions/collections";
import CollectionForm from "../collection-form";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">New collection</h1>
        <p className="text-sm text-muted-foreground">
          Collections are smaller groupings of products, used to feature a
          curated set on the home page and elsewhere.
        </p>
      </div>

      <CollectionForm action={createCollection} />
    </div>
  );
}