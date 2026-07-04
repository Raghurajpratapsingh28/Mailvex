/**
 * Example: create a dynamic segment, build a campaign, and send it.
 */
import { Mailvex } from "@Mailvex/node";

const client = new Mailvex({
  apiKey: process.env.Mailvex_API_KEY!,
  workspaceId: process.env.WORKSPACE_ID!,
});

async function run() {
  // 1. Create a dynamic segment of all "customer" contacts
  const segment = await client.segments.create({
    name: "All Customers",
    type: "dynamic",
    filterTree: {
      operator: "AND",
      rules: [
        { field: "lifecycleStage", operator: "equals", value: "customer" },
      ],
    },
  });
  console.log("Segment:", segment.id, "status:", segment.status);

  // 2. Create campaign
  const campaign = await client.campaigns.create({
    name: "Summer Sale 2024",
    subject: "Big summer deals just for you",
    from: { email: "hello@yourapp.com", name: "YourApp" },
    html: "<h1>Summer Sale!</h1><p>Check out our deals.</p>",
    segmentId: segment.id,
  });
  console.log("Campaign:", campaign.id, "status:", campaign.status);

  // 3. Send now
  const result = await client.campaigns.send(campaign.id);
  console.log("Sending to", result.recipientCount, "recipients");
}

run().catch(console.error);
