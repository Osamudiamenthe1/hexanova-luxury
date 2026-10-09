/**
 * src/app/admin/settings/settings-form.js
 * The site settings editor.
 *
 * Every text field is controlled by state, so values survive a validation
 * error. The two image uploads use SingleImageUpload, which stores the
 * uploaded URL in a hidden input.
 *
 * The form is organised into logical groups. The whole thing submits as
 * one action so the admin can make multiple changes and save once.
 */

"use client";

import { useActionState, useState } from "react";
import Button from "@/components/ui/button";
import { Input, Textarea } from "@/components/admin/form-field";
import SingleImageUpload from "@/components/admin/single-image-upload";
import { updateSettings } from "@/lib/actions/settings";

export default function SettingsForm({ initialSettings }) {
  const [state, formAction, pending] = useActionState(updateSettings, {});

  // All text fields live in one state object. Initial values come from
  // the database, with empty-string fallbacks so nothing is undefined.
  const [fields, setFields] = useState({
    brand_name: initialSettings.brand_name ?? "",
    tagline: initialSettings.tagline ?? "",
    hero_headline: initialSettings.hero_headline ?? "",
    hero_subheadline: initialSettings.hero_subheadline ?? "",
    about_title: initialSettings.about_title ?? "",
    about_body: initialSettings.about_body ?? "",
    address: initialSettings.address ?? "",
    city: initialSettings.city ?? "",
    service_areas: initialSettings.service_areas ?? "",
    opening_hours: initialSettings.opening_hours ?? "",
    phone: initialSettings.phone ?? "",
    email: initialSettings.email ?? "",
    whatsapp_number: initialSettings.whatsapp_number ?? "",
    instagram_url: initialSettings.instagram_url ?? "",
    facebook_url: initialSettings.facebook_url ?? "",
  });

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="space-y-12 max-w-3xl">
      {/* Brand */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Brand
        </h2>
        <Input
          label="Brand name"
          name="brand_name"
          value={fields.brand_name}
          onChange={(e) => setField("brand_name", e.target.value)}
          placeholder="HexaNova Luxury"
        />
        <Input
          label="Tagline"
          name="tagline"
          value={fields.tagline}
          onChange={(e) => setField("tagline", e.target.value)}
          placeholder="Interiors and furniture, made in Nigeria."
        />
      </section>

      {/* Hero */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Home page hero
        </h2>
        <Input
          label="Hero headline"
          name="hero_headline"
          value={fields.hero_headline}
          onChange={(e) => setField("hero_headline", e.target.value)}
          placeholder="Rooms made to be lived in."
        />
        <Textarea
          label="Hero subheadline"
          name="hero_subheadline"
          rows={2}
          value={fields.hero_subheadline}
          onChange={(e) => setField("hero_subheadline", e.target.value)}
          placeholder="A design studio and furniture atelier based in Lagos."
        />
        <SingleImageUpload
          name="hero_image_url"
          label="Hero image"
          initialUrl={initialSettings.hero_image_url || ""}
          folder="site"
          help="The big photo at the top of the home page. Landscape works best."
        />
      </section>

      {/* About */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          About
        </h2>
        <Input
          label="About title"
          name="about_title"
          value={fields.about_title}
          onChange={(e) => setField("about_title", e.target.value)}
          placeholder="A studio and a workshop."
        />
        <Textarea
          label="About body"
          name="about_body"
          rows={6}
          value={fields.about_body}
          onChange={(e) => setField("about_body", e.target.value)}
          help="Shown on the home page teaser and on the About page."
        />
        <SingleImageUpload
          name="about_image_url"
          label="About image"
          initialUrl={initialSettings.about_image_url || ""}
          folder="site"
          help="Shown alongside the about text. Portrait or square works best."
        />
      </section>

            {/* Contact */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Contact
        </h2>
        <Input
          label="Address"
          name="address"
          value={fields.address}
          onChange={(e) => setField("address", e.target.value)}
          placeholder="Benin City, Nigeria"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="City"
            name="city"
            value={fields.city}
            onChange={(e) => setField("city", e.target.value)}
            placeholder="Benin City"
            help="Used in local SEO and the home page structured data."
          />
          <Input
            label="Opening hours"
            name="opening_hours"
            value={fields.opening_hours}
            onChange={(e) => setField("opening_hours", e.target.value)}
            placeholder="e.g. Mo-Fr 09:00-18:00"
            help="Schema.org format. Leave empty to omit from structured data."
          />
        </div>
        <Input
          label="Service areas"
          name="service_areas"
          value={fields.service_areas}
          onChange={(e) => setField("service_areas", e.target.value)}
          placeholder="Benin City, Lagos, Abuja"
          help="Comma-separated list of cities or regions you serve."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Phone"
            name="phone"
            value={fields.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="+234 800 000 0000"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="hello@devalluxury.com"
          />
        </div>
        <Input
          label="WhatsApp number"
          name="whatsapp_number"
          value={fields.whatsapp_number}
          onChange={(e) => setField("whatsapp_number", e.target.value)}
          placeholder="e.g. 2348012345678"
          help="With country code, no +, no spaces. Leave empty to hide the WhatsApp button everywhere."
        />
      </section>

      {/* Social */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-2">
          Social
        </h2>
        <Input
          label="Instagram URL"
          name="instagram_url"
          value={fields.instagram_url}
          onChange={(e) => setField("instagram_url", e.target.value)}
          placeholder="https://instagram.com/yourhandle"
        />
        <Input
          label="Facebook URL"
          name="facebook_url"
          value={fields.facebook_url}
          onChange={(e) => setField("facebook_url", e.target.value)}
          placeholder="https://facebook.com/yourpage"
        />
      </section>

      {/* Feedback + save */}
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.message && (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" loading={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}