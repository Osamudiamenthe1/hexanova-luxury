/**
 * src/lib/data/admin-enquiries.js
 * Admin queries for enquiries. Uses the cookie-based server client so the
 * admin session is applied and RLS lets us read them.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * List enquiries, newest first, with an optional status filter.
 * Includes the linked product name if there is one.
 */
export async function listEnquiriesAdmin({ status } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("enquiries")
    .select(
      `
      id, name, email, phone, message, type, status, created_at,
      product_id,
      products ( name, slug )
    `
    )
    .order("created_at", { ascending: false });

  if (status && ["new", "contacted", "closed"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listEnquiriesAdmin error:", error.message);
    return [];
  }
  return data || [];
}

/**
 * A single enquiry by id, including the linked product name/slug if any.
 */
export async function getEnquiryByIdAdmin(id) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .select(
      `
      id, name, email, phone, message, type, status, created_at,
      product_id,
      products ( name, slug )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getEnquiryByIdAdmin error:", error.message);
    return null;
  }
  return data;
}