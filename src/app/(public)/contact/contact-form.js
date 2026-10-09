/**
 * src/app/(public)/contact/contact-form.js
 * The contact / enquiry form.
 *
 * Three modes, decided by which context props are present:
 *   1. productId + productName  -> product enquiry. Message pre-filled,
 *      type locked to "product", no dropdown.
 *   2. projectName (no product) -> consultation request. Message pre-filled,
 *      type locked to "consultation", no dropdown.
 *   3. Neither                  -> general contact. Dropdown shown.
 *
 * Every field is CONTROLLED (state-backed). React 19 resets uncontrolled
 * inputs after a Server Action runs, so controlled fields keep the user's
 * typed data when validation returns an error.
 */

"use client";

import { useActionState, useState } from "react";
import Button from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { submitEnquiry } from "./actions";

const TYPE_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "consultation", label: "Book a consultation" },
];

export default function ContactForm({ productId, productName, projectName }) {
  const [state, action, pending] = useActionState(submitEnquiry, {});

  // Work out the initial message and whether type is locked, BEFORE
  // building state. Product wins if both are somehow passed.
  let initialMessage = "";
  let fixedType = null;

  if (productName) {
    initialMessage = `Hello,\n\nI'm interested in the ${productName}. Could you tell me more about finishes, lead time, and delivery?\n\nThank you.`;
    fixedType = "product";
  } else if (projectName) {
    initialMessage = `Hello,\n\nI'd like a consultation. I love the ${projectName} project and have something similar in mind.\n\nThank you.`;
    fixedType = "consultation";
  }

  // All form fields live in one state object so nothing is lost on error.
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    message: initialMessage,
    type: fixedType || "general",
  });

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={action} className="space-y-5">
      {/* Hidden product id if the visitor came from a product page. */}
      {productId && <input type="hidden" name="product_id" value={productId} />}

      {/* Type: a hidden value when context is fixed, otherwise a dropdown. */}
      {fixedType ? (
        <input type="hidden" name="type" value={fixedType} />
      ) : (
        <div>
          <label
            htmlFor="type"
            className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            What is this about?
          </label>
          <CustomSelect
            id="type"
            name="type"
            value={fields.type}
            onChange={(v) => setField("type", v)}
            options={TYPE_OPTIONS}
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={fields.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
        >
          Phone or WhatsApp{" "}
          <span className="text-muted-foreground/60">(optional)</span>{" "}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={fields.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className="w-full h-11 px-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-xs uppercase tracking-widest text-muted-foreground mb-2"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={fields.message}
          onChange={(e) => setField("message", e.target.value)}
          className="w-full px-3 py-3 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      {/* Honeypot: invisible to real users, tempting to bots. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* role="alert" tells screen readers to announce this immediately
          when it appears, without waiting for the user to navigate to it.
          The polite alternative (role="status") is used for success
          messages, but this form now redirects on success, so there is
          no success state to announce here. */}
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" loading={pending}>
          {pending ? "Sending..." : "Send enquiry"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        We reply to every enquiry personally, usually within one business day.
      </p>
    </form>
  );
}
