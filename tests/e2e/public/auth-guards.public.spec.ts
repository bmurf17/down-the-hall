import { test, expect } from "@playwright/test";

const signedOutPages = [
  { path: "/users", message: "User not logged in" },
  { path: "/goals", message: "User not logged in" },
  { path: "/stats", message: "User not logged in" },
  { path: "/settings", message: "Sign in to manage settings." },
];

test.describe("signed-out guards", () => {
  for (const { path, message } of signedOutPages) {
    test(`${path} asks the visitor to sign in`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.getByText(message, { exact: true })).toBeVisible();
    });
  }
});
