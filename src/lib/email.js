/**
 * src/lib/email.js
 * Sends enquiry notification emails to the admin via Resend.
 *
 * IMPORTANT: Emails are BEST-EFFORT. The enquiry is saved to the database
 * FIRST. If sending the email fails (no API key, rate limit, network), the
 * enquiry is still safe and the admin sees it in the CMS.
 *
 * Logging is intentionally verbose so setup problems are obvious in the
 * dev server terminal. Every branch prints something with the "[email]"
 * prefix.
 */

import { Resend } from "resend";

const FROM = process.env.ENQUIRY_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Send an email to the admin when a new enquiry arrives.
 *
 * @param {object} enquiry - { name, email, phone, message, type, product_name }
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function sendEnquiryNotification(enquiry) {
  // Loud, explicit status line so we always know this function was reached.
  console.log("[email] sendEnquiryNotification called for:", enquiry.name);

  if (!process.env.RESEND_API_KEY) {
    console.error(
      "[email] SKIPPING - RESEND_API_KEY is not set in the environment. " +
        "Check .env.local and RESTART the dev server."
    );
    return { ok: false, reason: "not_configured" };
  }

  const notifyTo = process.env.ENQUIRY_NOTIFY_EMAIL;
  if (!notifyTo) {
    console.error(
      "[email] SKIPPING - ENQUIRY_NOTIFY_EMAIL is not set in the environment. " +
        "Check .env.local and RESTART the dev server."
    );
    return { ok: false, reason: "no_recipient" };
  }

  console.log(`[email] Sending to ${notifyTo} from ${FROM}...`);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = subjectFor(enquiry);

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: notifyTo.split(",").map((s) => s.trim()),
      replyTo: enquiry.email,
      subject,
      html: buildHtml(enquiry),
      text: buildText(enquiry),
    });

    if (error) {
      console.error(
        "[email] Resend API returned an error:",
        JSON.stringify(error, null, 2)
      );
      return { ok: false, reason: "send_failed" };
    }

    console.log("[email] Sent successfully. Resend message id:", data?.id);
    return { ok: true };
  } catch (err) {
    console.error("[email] Unexpected exception:", err?.message || err);
    return { ok: false, reason: "exception" };
  }
}

function subjectFor(enquiry) {
  if (enquiry.product_name) {
    return `New enquiry about "${enquiry.product_name}"`;
  }
  if (enquiry.type === "consultation") {
    return "New consultation request";
  }
  return "New enquiry from the website";
}

function buildHtml(enquiry) {
  const e = escapeHtml;

  const contextLines = [];
  if (enquiry.product_name) {
    contextLines.push(`<strong>About:</strong> ${e(enquiry.product_name)}`);
  }
  contextLines.push(`<strong>Type:</strong> ${e(enquiry.type)}`);

  return `
    <!doctype html>
    <html>
      <body style="font-family: system-ui, sans-serif; background:#FAF8F5; padding:24px; color:#1C1B1A;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#FFFFFF; border:1px solid #E7E1D9; border-radius:6px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 20px 0; font-size:12px; letter-spacing:0.2em; text-transform:uppercase; color:#6B6560;">
                Website enquiry
              </p>

              <h1 style="margin:0 0 6px 0; font-family: Georgia, serif; font-weight:500; font-size:22px; color:#1C1B1A;">
                New enquiry
              </h1>

              <p style="margin:0 0 20px 0; font-size:13px; color:#6B6560;">
                ${contextLines.join(" &nbsp;·&nbsp; ")}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #E7E1D9; padding-top:16px; margin-top:8px;">
                <tr>
                  <td style="padding:10px 0; font-size:12px; text-transform:uppercase; letter-spacing:0.15em; color:#6B6560; width:100px;">Name</td>
                  <td style="padding:10px 0; font-size:14px; color:#1C1B1A;">${e(enquiry.name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0; font-size:12px; text-transform:uppercase; letter-spacing:0.15em; color:#6B6560;">Email</td>
                  <td style="padding:10px 0; font-size:14px; color:#1C1B1A;">
                    <a href="mailto:${e(enquiry.email)}" style="color:#8A6D3B;">${e(enquiry.email)}</a>
                  </td>
                </tr>
                ${
                  enquiry.phone
                    ? `<tr>
                         <td style="padding:10px 0; font-size:12px; text-transform:uppercase; letter-spacing:0.15em; color:#6B6560;">Phone</td>
                         <td style="padding:10px 0; font-size:14px; color:#1C1B1A;">${e(enquiry.phone)}</td>
                       </tr>`
                    : ""
                }
              </table>

              <div style="margin-top:24px; padding-top:20px; border-top:1px solid #E7E1D9;">
                <p style="margin:0 0 10px 0; font-size:12px; text-transform:uppercase; letter-spacing:0.15em; color:#6B6560;">Message</p>
                <p style="margin:0; font-size:14px; line-height:1.6; white-space:pre-wrap; color:#1C1B1A;">${e(enquiry.message)}</p>
              </div>

              <p style="margin:32px 0 0 0; font-size:12px; color:#6B6560;">
                Reply directly to this email to respond to ${e(enquiry.name)}.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildText(enquiry) {
  const lines = ["WEBSITE ENQUIRY", "", `Type: ${enquiry.type}`];
  if (enquiry.product_name) lines.push(`About: ${enquiry.product_name}`);
  lines.push(
    "",
    `Name:  ${enquiry.name}`,
    `Email: ${enquiry.email}`
  );
  if (enquiry.phone) lines.push(`Phone: ${enquiry.phone}`);
  lines.push("", "Message:", enquiry.message, "", "Reply to this email to respond.");
  return lines.join("\n");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}