/**
 * Example: bulk import contacts from a CSV / external source.
 */
import { Mailvex } from "@Mailvex/node";

const client = new Mailvex({
  apiKey: process.env.Mailvex_API_KEY!,
  workspaceId: process.env.WORKSPACE_ID!,
});

async function run() {
  const result = await client.contacts.bulkImport([
    { email: "alice@example.com", firstName: "Alice", tags: ["vip"] },
    { email: "bob@example.com", firstName: "Bob", lifecycleStage: "lead" },
    { email: "carol@example.com", firstName: "Carol", leadScore: 80 },
  ]);

  console.log(`Imported: ${result.imported}, Skipped: ${result.skipped}`);

  // Paginate all contacts using async iterator
  let count = 0;
  for await (const contact of client.contacts.listAll({ pageSize: 100 })) {
    count++;
    if (count <= 3) console.log(contact.email);
  }
  console.log(`Total contacts iterated: ${count}`);
}

run().catch(console.error);
