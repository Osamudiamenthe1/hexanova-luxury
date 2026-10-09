/**
 * src/app/admin/login/login-form.js
 * The login form UI. A Client Component because it needs interactivity
 * (loading state, error display, "forgot password" toggle).
 */

"use client";

import { useActionState, useState } from "react";
import { signIn, requestPasswordReset } from "./actions";

export default function LoginForm() {
  // "mode" flips between "signin" and "reset" without leaving the page.
  const [mode, setMode] = useState("signin");

  // useActionState wires a Server Action up to React state:
  //  - state is what the action returned (error or success message)
  //  - formAction is what we attach to the form action
  //  - isPending is true while the action is running
  const [signInState, signInAction, signInPending] = useActionState(signIn, {});
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordReset,
    {}
  );

  if (mode === "reset") {
    return (
      <form action={resetAction} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter the email address linked to your admin account. We will send
          you a link to set a new password.
        </p>

        <div>
          <label htmlFor="reset-email" className="block text-sm mb-1">
            Email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {resetState.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {resetState.error}
          </p>
        )}
        {resetState.success && (
          <p className="text-sm text-green-700 dark:text-green-400">
            {resetState.success}
          </p>
        )}

        <button
          type="submit"
          disabled={resetPending}
          className="w-full bg-accent text-accent-foreground py-2 rounded font-medium disabled:opacity-60"
        >
          {resetPending ? "Sending..." : "Send reset link"}
        </button>

        <button
          type="button"
          onClick={() => setMode("signin")}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form action={signInAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-border bg-background px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {signInState.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {signInState.error}
        </p>
      )}

      <button
        type="submit"
        disabled={signInPending}
        className="w-full bg-accent text-accent-foreground py-2 rounded font-medium disabled:opacity-60"
      >
        {signInPending ? "Signing in..." : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => setMode("reset")}
        className="w-full text-sm text-muted-foreground hover:text-foreground"
      >
        Forgot your password?
      </button>
    </form>
  );
}