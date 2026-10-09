/**
 * src/lib/validation.js
 * Zod schemas for validating form input on the server.
 *
 * Why server-side? Because client-side validation can be bypassed. Every
 * form that writes to the database passes through one of these schemas
 * FIRST, and only saves if the data is valid.
 */

import { z } from "zod";

/**
 * The public enquiry form (product enquiry, consultation, general message).
 *
 * Note on product_id: we accept any string here. The database has a foreign
 * key from enquiries.product_id to products.id, so an invalid value would be
 * rejected by Postgres anyway. Doing a strict UUID format check in Zod is
 * unnecessary and can reject valid-looking IDs that don't match a specific
 * UUID version format.
 *
 * The "website" field is a honeypot: real users never see it, but bots fill
 * it in automatically. If it has anything in it, we silently drop the
 * submission.
 */
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(200, "Email is too long."),

  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(10, "Please tell us a bit more about what you have in mind.")
    .max(5000, "Message is too long."),

  type: z.enum(["product", "consultation", "general"]),

  // Optional: the id of a product if the enquiry came from a product page.
  // We only enforce length here; the database enforces the actual reference.
  product_id: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal("")),
});