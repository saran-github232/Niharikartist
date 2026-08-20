// Plain fetch against Resend's REST API — no reason to add their SDK
// dependency for one POST request. Until RESEND_API_KEY is set, this
// degrades safely: the link is logged server-side instead of failing, so
// the reset flow is fully testable before an email service is configured.
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console -- intentional: this IS the delivery mechanism until a real key is set
    console.warn(`[email] RESEND_API_KEY not set. Password reset link for ${to}:\n${resetUrl}`);
    return { sent: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Niharika Artist Admin <onboarding@resend.dev>",
      to,
      subject: "Reset your admin password",
      html: `
        <p>Someone requested a password reset for the Niharika Artist admin panel.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
      `,
    }),
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console -- surfacing delivery failures server-side
    console.error(`[email] Resend request failed (${res.status}) for ${to}: ${await res.text()}`);
  }

  return { sent: res.ok };
}
