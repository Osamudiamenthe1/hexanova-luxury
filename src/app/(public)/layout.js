/**
 * src/app/(public)/layout.js
 * Layout for every public page. Fetches settings once and passes the
 * brand name, contact details, and hero subheadline into Header and
 * Footer so those components always reflect the current site_settings.
 *
 * Also passes the WhatsApp number and brand name to the floating button
 * so it can build a page-aware default message.
 */

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-button";
import { getSettings } from "@/lib/data/settings";

export default async function PublicLayout({ children }) {
  const settings = await getSettings();

  const brandName = settings.brand_name || "HexaNova Luxury";
  const whatsappNumber = settings.whatsapp_number || "";
  const email = settings.email || "hello@devalluxury.com";
  const address = settings.address || "Lagos, Nigeria";
  const phone = settings.phone || "";
  // The footer description comes from the same setting as the hero
  // subheadline, so editing one updates both.
  const description = settings.hero_subheadline || "";

  return (
    <>
      <Header brandName={brandName} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer
        brandName={brandName}
        email={email}
        address={address}
        phone={phone}
        whatsappNumber={whatsappNumber}
        description={description}
      />
      <WhatsAppFloat number={whatsappNumber} brandName={brandName} />
    </>
  );
}