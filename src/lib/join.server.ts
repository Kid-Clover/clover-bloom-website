import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAILCHIMP_LIST_ID = "e096feb89c";

type JoinInput = {
  name: string;
  email: string;
  tags: string[];
};

export const joinCommunity = createServerFn()
  .handler(async ({ data }: { data: JoinInput }): Promise<{ ok: boolean; error?: string }> => {
    const { name, email, tags } = data;

    if (!name.trim()) return { ok: false, error: "Name is required." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };

    const e = env as Cloudflare.Env;

    // D1: insert if email not already present, skip if exists
    await e.DB
      .prepare(
        `INSERT INTO users (email, name) VALUES (?, ?)
         ON CONFLICT (email) DO NOTHING`
      )
      .bind(email.toLowerCase().trim(), name.trim())
      .run();

    // Mailchimp: upsert member then apply tags
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");
    const dc = e.MAILCHIMP_API_KEY.split("-")[1]; // e.g. "us13"
    const subscriberHash = await md5(email.toLowerCase().trim());
    const authHeader = `Basic ${btoa(`anystring:${e.MAILCHIMP_API_KEY}`)}`;

    const memberRes = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: email.toLowerCase().trim(),
          status_if_new: "subscribed",
          merge_fields: { FNAME: firstName, LNAME: lastName },
        }),
      }
    );

    if (!memberRes.ok) {
      const err = await memberRes.json() as { detail?: string };
      return { ok: false, error: err.detail ?? "Failed to subscribe. Please try again." };
    }

    // Apply tags if provided
    if (tags.length > 0) {
      await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}/tags`,
        {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({
            tags: tags.map((t) => ({ name: t.trim(), status: "active" })),
          }),
        }
      );
    }

    return { ok: true };
  });

async function md5(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
