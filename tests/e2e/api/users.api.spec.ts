import { test, expect } from "@playwright/test";

const UNKNOWN_USER = "e2e-user-with-no-books";

test.describe("GET /api/users", () => {
  test("returns the user grid payload", async ({ request }) => {
    const response = await request.get("/api/users");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    for (const entry of body) {
      expect(entry).toHaveProperty("user");
      expect(entry.user).toHaveProperty("id");
      expect(Array.isArray(entry.books)).toBe(true);
    }
  });
});

test.describe("GET /api/users/[userId]", () => {
  test("returns 404 for an unknown user", async ({ request }) => {
    const response = await request.get(`/api/users/${UNKNOWN_USER}`);

    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ error: "User not found" });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
