import { expect, test } from "@playwright/test";

// The project detail pages carry a "back to projects" link that points up at the
// index route (/projekte), the detail's parent in the IA (P3-9), not the onepager
// section anchor. Clicking it must land on the index page with its heading.
// fuelivo is the only project with a detail page.

test("back-to-projects link goes to the projects index", async ({ page }) => {
  await page.goto("/projekte/fuelivo");

  await page.getByRole("link", { name: "Zurück zu den Projekten", exact: true }).click();

  await expect(page).toHaveURL(/\/projekte$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Alle Projekte");
});
