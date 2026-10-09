import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllCollectionsAdmin } from "@/lib/data/admin-misc";
import { deleteCollection } from "@/lib/actions/collections";
import SavedBanner from "@/components/admin/saved-banner";
import DeleteButton from "@/components/admin/delete-button";
import Button from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CollectionsListPage({ searchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const saved = params?.saved;

  const collections = await getAllCollectionsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading mb-1">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Curated groupings of pieces, e.g. &quot;Noir Collection&quot;.
            Featured collections appear on the home page.
          </p>
        </div>
        <Button href="/admin/collections/new" size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          New collection
        </Button>
      </div>

      <SavedBanner
        message={
          saved === "created"
            ? "Collection created."
            : saved === "updated"
              ? "Collection updated."
              : null
        }
      />

      {collections.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">No collections yet.</p>
          <Button href="/admin/collections/new">
            Create your first collection
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Name
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Slug
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Order
                </th>
                <th className="hidden sm:table-cell px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Featured
                </th>
                <th className="px-4 py-3 font-normal text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((collection) => (
                <tr
                  key={collection.id}
                  className="hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/collections/${collection.id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {collection.name}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground">
                    {collection.slug}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {collection.sort_order}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    {collection.is_featured ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm bg-accent/15 text-accent">
                        Featured
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4 justify-end">
                      <Link
                        href={`/admin/collections/${collection.id}`}
                        className="text-xs text-foreground/80 hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCollection.bind(null, collection.id)}
                        confirmMessage={`Delete "${collection.name}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
