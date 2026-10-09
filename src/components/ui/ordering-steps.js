/**
 * src/components/ui/ordering-steps.js
 * A small horizontal strip showing the four stages of an order:
 * Enquire -> Quote -> Deposit -> Delivery.
 *
 * WHERE IT IS USED:
 *   - Product detail pages, after the main content
 *   - Contact page, below the form
 *
 * TEXT:
 * The four steps are hardcoded here with sensible defaults. If the client
 * wants to customise the wording later, we can add a `site_settings` key
 * holding the steps as JSON and read from that instead. For now, the
 * default copy is doing the work - it explains the process in plain
 * language without needing a CMS change.
 *
 * The visual style matches the "Our process" section on the Services page
 * (large accent number, serif title, small body), so the site stays
 * visually consistent.
 */

export default function OrderingSteps({ className = "" }) {
  const STEPS = [
    {
      number: "01",
      title: "Enquire",
      text: "Tell us about your space, the piece you have in mind, and any finishes you love.",
    },
    {
      number: "02",
      title: "Quote",
      text: "We come back with a design plan, a timeline, and a fixed price. No obligation.",
    },
    {
      number: "03",
      title: "Deposit",
      text: "Confirm the order with a deposit and we begin work in the workshop.",
    },
    {
      number: "04",
      title: "Delivery",
      text: "We build, deliver, and install. You enjoy the result for years to come.",
    },
  ];

  return (
    <section className={`mt-24 pt-16 border-t border-border ${className}`}>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4 text-center">
        How ordering works
      </p>
      <h2 className="text-display-sm font-heading mb-14 text-center">
        From first message to installed piece
      </h2>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number}>
            <p className="font-heading text-4xl text-accent mb-4">
              {step.number}
            </p>
            <h3 className="font-heading text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}