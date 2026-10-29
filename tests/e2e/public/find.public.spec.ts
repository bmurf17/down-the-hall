import { test, expect } from "@playwright/test";

test.describe("find page", () => {
  test("renders the search controls", async ({ page }) => {
    await page.goto("/find");

    await expect(page.getByText("Filters", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Search")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
  });

  test("does not navigate for queries shorter than four characters", async ({
    page,
  }) => {
    await page.goto("/find");

    const input = page.getByPlaceholder("Search");
    await input.fill("dun");

    // The component debounces for 500ms before updating the URL.
    await page.waitForTimeout(800);

    await expect(input).toHaveValue("dun");
    expect(new URL(page.url()).searchParams.get("title")).toBeNull();
  });

  test("clear resets the query", async ({ page }) => {
    await page.goto("/find");

    const input = page.getByPlaceholder("Search");
    await input.fill("dune");
    await page.getByRole("button", { name: "Clear" }).click();

    await expect(input).toHaveValue("");
    await expect(page).toHaveURL(/\/find$/);
  });
});
