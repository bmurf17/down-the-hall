import { test, expect } from "@playwright/test";

const UNKNOWN_USER = "e2e-user-with-no-books";

test.describe("GET /api/goals/[userId]", () => {
  test("returns empty collections for a user with no goals", async ({
    request,
  }) => {
    const response = await request.get(`/api/goals/${UNKNOWN_USER}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ books: [], goals: [] });
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
  });

  test("answers CORS preflight requests", async ({ request }) => {
    const response = await request.fetch(`/api/goals/${UNKNOWN_USER}`, {
      method: "OPTIONS",
    });

    expect(response.status()).toBe(200);
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    expect(response.headers()["access-control-allow-methods"]).toContain("GET");
  });
});
