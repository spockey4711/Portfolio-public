import { expect, test } from "@playwright/test";

// The primitives showcase (P1-2) must render each ui/ primitive so it can serve
// as the living reference. This checks the page is reachable and shows the
// button variants, the status pill and the section header.
test("primitives page renders the ui primitives", async ({ page }) => {
  await page.goto("/primitives");

  await expect(page.getByRole("heading", { level: 1, name: "Primitives" })).toBeVisible();
  await expect(page.getByRole("button", { name: "CV laden" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(page.getByText("Verfügbar für Werkstudent")).toBeVisible();
  await expect(page.getByText("01 / Section header")).toBeVisible();
});
