/**
 * src/app/error.js
 * Error boundary for the whole app.
 *
 * IMPORTANT: This MUST be a Client Component ("use client" at the top).
 * Next.js catches render-time errors and shows this UI instead of a
 * broken page. The "reset" function retries the render.
 *
 * IMPORTANT: This file does NOT render <html> or <body>. In the App Router,
 * a plain error.js sits INSIDE the root layout, so adding <html>/<body>
 * here would nest them inside the layout's own html/body, which is invalid
 * HTML and causes a hydration error. Only global-error.js (a different,
 * special file) renders its own html/body.
 */

"use client";

import { useEffect } from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  // Log the real error so it shows in the console and Vercel logs.
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <Container size="narrow" className="py-24 sm:py-32 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
        Something went wrong
      </p>
      <h1 className="text-display-sm font-heading mb-6">
        We hit an unexpected snag.
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
        Please try again. If the problem persists, refresh the page or email
        us directly.
      </p>
      <div className="flex justify-center flex-wrap gap-4">
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
        <Button href="/" variant="outline" size="lg">
          Go home
        </Button>
      </div>
    </Container>
  );
}