import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { apiCreateNewUser } from "../helpers/api-requests.js";

test.describe("Forgot Password page with form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("should display forgot password link and navigate to the reset password page", async ({
    page,
  }) => {
    await page.getByTestId("forgot-password").click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("should show validation messages for invalid inputs", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    // Test submitting without entering an email
    await page.getByTestId("send-email").click();
    await expect(page.getByTestId("email-error")).toBeVisible();

    // Test submitting with an invalid email
    await page.getByTestId("email").locator("input").fill("invalidemail");
    await page.getByTestId("send-email").click();
    await expect(page.getByTestId("email-error")).toBeVisible();

    await page
      .getByTestId("email")
      .locator("input")
      .fill("someemail@email.com");
    await expect(page.getByTestId("email-error")).not.toBeVisible();
  });

  test("should handle errors for an invalid email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page
      .getByTestId("email")
      .locator("input")
      .fill("nonexistentemail@mail.com");
    await page.getByTestId("send-email").click();

    await expect(page.getByTestId("email-error")).toBeVisible();
  });
});

test.describe("Change password", () => {
  let email: string;
  let password: string;

  test.beforeEach(async ({ page }) => {
    email = faker.internet.email({
      provider: "example.com",
    });
    password = faker.internet.password();
    await apiCreateNewUser(
      email,
      password,
      faker.person.firstName(),
      faker.person.lastName()
    );
    await page.goto("/forgot-password");
    await page.getByTestId("email").locator("input").fill(email);
    await page.getByTestId("send-email").click();
    await expect(
      page.locator(".Toastify > .Toastify__toast-container")
    ).toBeVisible();
  });
});
