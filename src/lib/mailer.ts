/**
 * Outbound email, through Cloudflare's own send_email binding.
 *
 * This replaces Resend. Not because Resend was bad, but because it was
 * a second account, a second bill and a second credential for a site
 * that sends a few dozen messages a month — and Cloudflare now sends
 * natively, included in the Workers Paid plan the site already runs on.
 * One less thing for a non-technical owner to have an account with.
 *
 * Every function here is deliberately unable to throw. The three things
 * this site sends are a sign-in link, a booking notification and a
 * booking confirmation, and in all three cases the enquiry is already
 * safely in the database by the time we try to send. A delivery failure
 * must never turn into a lost lead or a 500 page — the caller gets
 * `{ ok: false }` and decides what to tell the person.
 */

export interface MailResult {
  ok: boolean;
  error?: string;
}

interface Message {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/** Cloudflare's binding, as much of it as this site uses. */
interface SendEmailBinding {
  send(message: Record<string, unknown>): Promise<{ messageId: string }>;
}

/**
 * True when the site can actually send.
 *
 * The binding only exists once `send_email` is in the Worker config and
 * the domain has been onboarded for Email Sending. Until then callers
 * fall back to logging the link, which is what keeps the admin
 * reachable while email is still being set up.
 */
export function canSend(bindings: Record<string, any>): boolean {
  return Boolean(bindings?.EMAIL?.send);
}

export async function sendMail(
  bindings: Record<string, any>,
  msg: Message,
): Promise<MailResult> {
  const email = bindings?.EMAIL as SendEmailBinding | undefined;
  if (!email?.send) return { ok: false, error: "Email sending is not configured on this Worker." };
  if (!msg.to || !msg.from) return { ok: false, error: "Missing sender or recipient." };

  try {
    await email.send({
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      html: msg.html,
      ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
    });
    return { ok: true };
  } catch (err: any) {
    // Cloudflare throws with a `code` — E_SENDER_NOT_VERIFIED and
    // E_SENDER_DOMAIN_NOT_AVAILABLE both mean the domain has not been
    // onboarded yet, which is a setup problem rather than a bad
    // address, so it is worth saying so plainly in the logs.
    const code = err?.code ? `${err.code}: ` : "";
    console.error("[mail] send failed", code + (err?.message ?? err));
    return { ok: false, error: code + (err?.message ?? "send failed") };
  }
}

/**
 * Send several at once without one failure hiding another.
 *
 * `allSettled` rather than `all`: the booking confirmation going to the
 * client and the notification going to Thushara are independent, and
 * losing his copy because the client's mail server was slow would be
 * the worst of the possible outcomes.
 */
export async function sendAll(
  bindings: Record<string, any>,
  messages: Array<Message & { label: string }>,
): Promise<MailResult> {
  const results = await Promise.allSettled(
    messages.map((m) => sendMail(bindings, m).then((r) => ({ ...r, label: m.label }))),
  );

  const failures = results
    .map((r) =>
      r.status === "rejected"
        ? `unknown: ${r.reason}`
        : r.value.ok
          ? null
          : `${r.value.label}: ${r.value.error}`,
    )
    .filter(Boolean);

  return failures.length ? { ok: false, error: failures.join(" | ") } : { ok: true };
}
