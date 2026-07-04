/**
 * Example: send a transactional onboarding email when a user signs up.
 *
 * Usage:
 *   Mailvex_API_KEY=eiq_live_xxx WORKSPACE_ID=ws-xxx npx tsx send-onboarding-email.ts
 */
import { Mailvex, MailvexError } from "@Mailvex/node";

const client = new Mailvex({
  apiKey: process.env.Mailvex_API_KEY!,
  workspaceId: process.env.WORKSPACE_ID!,
});

async function onUserSignup(user: {
  id: string;
  email: string;
  firstName: string;
}) {
  // 1. Upsert contact
  const contact = await client.contacts.create({
    email: user.email,
    firstName: user.firstName,
    externalId: user.id,
    lifecycleStage: "lead",
    tags: ["signup"],
  });
  console.log("Contact created:", contact.id);

  // 2. Send welcome email
  const result = await client.transactional.send({
    to: [{ email: user.email, name: user.firstName }],
    from: { email: "hello@yourapp.com", name: "YourApp" },
    subject: `Welcome, ${user.firstName}!`,
    html: `<h1>Hi ${user.firstName},</h1><p>Thanks for signing up!</p>`,
    text: `Hi ${user.firstName}, thanks for signing up!`,
    idempotencyKey: `onboarding-${user.id}`,
  });
  console.log("Email queued:", result.sendId);
}

onUserSignup({ id: "usr_123", email: "alice@example.com", firstName: "Alice" })
  .then(() => console.log("Done"))
  .catch((err) => {
    if (err instanceof MailvexError) {
      console.error(`[${err.code}] ${err.message} (HTTP ${err.statusCode})`);
    } else {
      throw err;
    }
  });