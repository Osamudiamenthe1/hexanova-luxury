import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCollectionByIdAdmin } from "@/lib/data/admin-misc";
import { updateCollection } from "@/lib/actions/collections";
import CollectionForm from "../collection-form";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }) {
  await requireAdmin();
  const { id } = await params;

  const collection = await getCollectionByIdAdmin(id);
  if (!collection) notFound();

  const action = updateCollection.bind(null, collection.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading mb-1">Edit collection</h1>
        <p className="text-sm text-muted-foreground">
          Changes go live on the public site within a few seconds.
        </p>
      </div>

      <CollectionForm collection={collection} action={action} />
    </div>
  );
}