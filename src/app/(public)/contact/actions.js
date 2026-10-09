/**
 * src/app/(public)/contact/actions.js
 * Server Action: saves an enquiry, then emails the admin via Resend.
 *
 * FLOW:
 *   1. Validate input.
 *   2. If honeypot fired: redirect to /contact/thanks (bot can't tell).
 *   3. Save to the database. On error, return the error to the form.
 *   4. Look up the product name (best effort) so the email subject is useful.
 *   5. Send the notification email (best effort - never blocks the enquiry).
 *   6. Redirect to /contact/thanks.
 *
 * IMPORTANT: redirect() must NOT be inside a try/catch. In Next.js it
 * works by throwing a special internal error, and try/catch would swallow
 * it, leaving the visitor stuck on the form after a successful submit.
 *
 * IMPORTANT: The public cannot READ enquiries (RLS). So we must NOT chain
 * .select() after .insert() - we insert and only check for an error.
 */

"use server";

import { redirect } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { enquirySchema } from "@/lib/validation";
import { sendEnquiryNotification } from "@/lib/email";

export async function submitEnquiry(prevState, formData) {
  const raw = {
    name: formData.get("name") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    message: formData.get("message") || "",
    type: formData.get("type") || "general",
    product_id: formData.get("product_id") || null,
    // Honeypot
    website: formData.get("website") || "",
  };

  // Honeypot triggered - pretend success. Redirect to the same thanks page
  // a real visitor would see, so the bot has no way to distinguish.
  if (raw.website && raw.website.length > 0) {
    redirect("/contact/thanks");
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue?.message || "Please check the form and try again.",
    };
  }

  const data = parsed.data;

  // Insert WITHOUT .select() - RLS blocks reading the row back.
  const { error } = await supabasePublic.from("enquiries").insert({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
    type: data.type,
    product_id: data.product_id || null,
    status: "new",
  });

  if (error) {
    console.error("submitEnquiry insert error:", error.message);
    return {
      error:
        "Something went wrong saving your message. Please try again, or email us directly.",
    };
  }

  // Look up the product name (if any) so the email subject is helpful.
  // Best-effort: if this fails, we still send the email without it.
  let productName = null;
  if (data.product_id) {
    const { data: product } = await supabasePublic
      .from("products")
      .select("name")
      .eq("id", data.product_id)
      .maybeSingle();
    productName = product?.name || null;
  }

  // Fire the notification. This function never throws - it logs and
  // returns. So a broken email never breaks the enquiry.
  await sendEnquiryNotification({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    type: data.type,
    product_name: productName,
  });

  // Success. Send the visitor to a dedicated page so:
  //   1. There is a URL to track as a conversion in analytics.
  //   2. The form cannot be resubmitted by accident.
  //   3. The visitor has a clear next step.
  redirect("/contact/thanks");
}