import { describe, it, expect, vi } from "vitest";
import { Mailvex } from "../src/index.js";

describe("TransactionalResource", () => {
  it("send — returns sendId on 202", async () => {
    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 202,
      headers: { get: () => null } as unknown as Headers,
      json: async () => ({ sendId: "send-abc", status: "queued" }),
    } as Response);

    const client = new Mailvex({
      apiKey: "key",
      workspaceId: "ws-1",
      baseUrl: "http://localhost:4000",
    });

    const result = await client.transactional.send({
      to: [{ email: "bob@example.com" }],
      from: { email: "hello@myapp.com", name: "MyApp" },
      subject: "Hello!",
      html: "<p>Hello</p>",
    });

    expect(result.sendId).toBe("send-abc");
    expect(result.status).toBe("queued");

    globalFetch.mockRestore();
  });

  it("createTemplate — returns template on 201", async () => {
    const template = {
      id: "tmpl-1",
      name: "Welcome",
      subject: "Welcome to {{name}}",
      status: "draft",
    };

    const globalFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => null } as unknown as Headers,
      json: async () => ({ template }),
    } as Response);

    const client = new Mailvex({
      apiKey: "key",
      workspaceId: "ws-1",
      baseUrl: "http://localhost:4000",
    });

    const result = await client.transactional.createTemplate({
      name: "Welcome",
      subject: "Welcome to {{name}}",
      htmlBody: "<p>Hi {{name}}</p>",
    });

    expect(result.id).toBe("tmpl-1");
    globalFetch.mockRestore();
  });
});