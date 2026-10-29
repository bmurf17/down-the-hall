import { test, expect } from "../fixtures";

test.describe("signed-in navigation", () => {
  test("shows the full menu and the search button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();

    for (const item of ["Find", "Track", "Stats", "Goals", "Users", "Settings"]) {
      await expect(
        menu.getByRole("button", { name: item, exact: true })
      ).toBeVisible();
    }

    await expect(
      menu.getByText("Sign in to start tracking your book")
    ).toHaveCount(0);
  });

  test("navigates to track from the menu", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("button", { name: "Track", exact: true }).click();

    await expect(page).toHaveURL(/\/track$/);
    await expect(page.getByRole("tab", { name: "All", exact: true })).toBeVisible();
  });

  test("opens the book search modal", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Search" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Search Books" })
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
