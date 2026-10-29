import { test, expect } from "../fixtures";

test.describe("signed-in pages", () => {
  test("track page shows the shelf controls", async ({ page }) => {
    const response = await page.goto("/track");

    expect(response?.status()).toBe(200);
    for (const tab of [
      "All",
      "Currently Reading",
      "Read",
      "Want To Read",
      "Did Not Finish",
    ]) {
      await expect(page.getByRole("tab", { name: tab, exact: true })).toBeVisible();
    }
    await expect(page.getByText(/Showing \d+-\d+ of \d+ books/)).toBeVisible();
  });

  test("goals page renders the dashboard", async ({ page }) => {
    const response = await page.goto("/goals");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Reading Goals Dashboard" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Set Reading Goal" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
  });

  test("stats page renders charts or an empty state", async ({ page }) => {
    const response = await page.goto("/stats");

    expect(response?.status()).toBe(200);
    await expect(
      page
        .getByText("No reading data found for the selected date range")
        .or(page.getByRole("tab", { name: "Pages", exact: true }))
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Please log in to view stats")).toHaveCount(0);
  });

  test("users page does not show the signed-out guard", async ({ page }) => {
    const response = await page.goto("/users");

    expect(response?.status()).toBe(200);
    await expect(page.getByText("User not logged in")).toHaveCount(0);
  });

  test("settings page renders for a signed-in user", async ({ page }) => {
    const response = await page.goto("/settings");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true })
    ).toBeVisible();
    await expect(page.getByText("Sign in to manage settings.")).toHaveCount(0);

    // Either the owner sees the Hardcover card, or they see the owner notice.
    await expect(
      page
        .getByRole("heading", { name: "Hardcover" })
        .or(page.getByText("The Hardcover connection is managed by the site owner."))
    ).toBeVisible();
  });
});
