import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders the dashboard shell", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Down The Hall/);
    await expect(
      page.getByRole("link", { name: "Down The Hall", exact: true })
    ).toBeVisible();

    await expect(page.getByRole("tab", { name: "Trending" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Your Feed" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Goals", exact: true })
    ).toBeVisible();
    await expect(page.getByText("No book currently being read")).toBeVisible();
  });

  test("shows signed-out navigation", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open navigation menu" }).click();

    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    await expect(
      menu.getByText("Sign in to start tracking your book")
    ).toBeVisible();
    await expect(menu.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Track" })).toHaveCount(0);
    await expect(menu.getByRole("button", { name: "Settings" })).toHaveCount(0);

    // The in-app book search is only rendered for signed-in users.
    await expect(page.getByRole("button", { name: "Search" })).toHaveCount(0);
  });

  test("opens and closes the navigation menu", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", {
      name: "Open navigation menu",
    });
    await menuButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "X" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
