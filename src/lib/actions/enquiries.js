/**
 * src/lib/actions/enquiries.js
 * Server Actions for updating and deleting enquiries.
 *
 * Only admins can run these (requireAdmin). The public can only INSERT
 * into enquiries - never read or modify.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

/**
 * Change the status of an enquiry: new, contacted, or closed.
 */
export async function updateEnquiryStatus(id, prevState, formData) {
  const { supabase } = await requireAdmin();

  const status = String(formData.get("status") || "");
  if (!["new", "contacted", "closed"].includes(status)) {
    return { error: "Please choose a valid status." };
  }

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("updateEnquiryStatus error:", error.message);
    return { error: "Could not update the status. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true, message: `Status set to "${status}".` };
}

/**
 * Delete an enquiry.
 */
export async function deleteEnquiry(id) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("deleteEnquiry error:", error.message);
    return { error: "Could not delete the enquiry. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Delete an enquiry and redirect back to the list. Used from the detail
 * page where staying on the deleted page doesn't make sense.
 */
export async function deleteEnquiryAndRedirect(id) {
  const result = await deleteEnquiry(id);
  if (result?.error) return result;
  redirect("/admin/enquiries?deleted=1");
}