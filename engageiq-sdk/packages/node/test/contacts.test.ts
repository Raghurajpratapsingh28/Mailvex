import { describe, it, expect, vi, beforeEach } from "vitest";
import { Mailvex } from "../src/index.js";
import { NotFoundError, ConflictError } from "../src/index.js";

function makeClient(fetchFn: typeof fetch) {
  const client = new Mailvex({
    apiKey: "test-api-key",
    workspaceId: "ws-123",
    baseUrl: "http://localhost:4000",
  });
  // @ts-expect-error — inject mock fetch
  client["http"]["fetch"] = fetchFn;
  return client;
}

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (k: string) => headers[k] ?? null,
    },
    json: async () => body,
  });
}

describe("ContactsResource", () => {
  let client: Mailvex;

  it("create — returns contact on 201", async () => {
    const contact = {
      id: "c1",
      email: "alice@example.com",
      tags: [],
      emailSuppressed: false,
      globallySuppressed: false,
      unsubscribed: false,
      workspaceId: "ws-123",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const globalFetch = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: true,
        status: 201,
        headers: { get: () => null } as unknown as Headers,
        json: async () => ({ contact }),
      } as Response);

    client = new Mailvex({
      apiKey: "test-api-key",
      workspaceId: "ws-123",
      baseUrl: "http://localhost:4000",
    });

    const result = await client.contacts.create({ email: "alice@example.com" });
    expect(result.email).toBe("alice@example.com");
    expect(result.id).toBe("c1");

    globalFetch.mockRestore();
  });

  it("get — throws NotFoundError on 404", async () => {
    const globalFetch = vi
      .spyOn(global, "fetch")
      .mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => null } as unknown as Headers,
        json: async () => ({
          error: {
            code: "CONTACT_NOT_FOUND",
            message: "Contact not found",
            requestId: "req-1",
          },
        }),
      } as Response);

    client = new Mailvex({
      apiKey: "test-api-key",
      workspaceId: "ws-123",
      baseUrl: "http://localhost:4000",
    });

    await expect(client.contacts.get("does-not-exist")).rejects.toBeInstanceOf(
      NotFoundError
    );

    globalFetch.mockRestore();
  });
});