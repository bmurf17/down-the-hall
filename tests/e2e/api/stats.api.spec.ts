import { test, expect } from "@playwright/test";

const UNKNOWN_USER = "e2e-user-with-no-books";

test.describe("GET /api/stats/[userId]", () => {
  test("returns an empty series for a user with no reading history", async ({
    request,
  }) => {
    const response = await request.get(`/api/stats/${UNKNOWN_USER}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
  });

  test("rejects an invalid start date", async ({ request }) => {
    const response = await request.get(`/api/stats/${UNKNOWN_USER}`, {
      params: { start: "not-a-date" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Invalid start date format. Use YYYY-MM-DD format.",
    });
  });

  test("rejects an invalid end date", async ({ request }) => {
    const response = await request.get(`/api/stats/${UNKNOWN_USER}`, {
      params: { end: "not-a-date" },
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Invalid end date format. Use YYYY-MM-DD format.",
    });
  });
});
