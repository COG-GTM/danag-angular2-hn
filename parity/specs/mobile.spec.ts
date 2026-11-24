import { test, expect, meta, fixture, shot } from './support';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('mobile feed and item header with back button', async ({ page }) => {
  const item = fixture(`item-${meta.storyId}.json`);
  await page.goto('/news/1');
  await expect(page.locator('li.post .subtext-palm').first()).toBeVisible();
  await expect(page.locator('li.post .subtext-laptop').first()).toBeHidden();
  await shot(page, 'mobile-feed');
  await page.locator(`li.post .subtext-palm a[href="/item/${meta.storyId}"]`).first().click();
  await expect(page.locator('.mobile.item-header .title')).toHaveText(item.title.trim());
  await shot(page, 'mobile-item');
  await page.locator('.mobile.item-header .back-button').click();
  await expect(page).toHaveURL(/\/news\/1$/);
});

test('mobile profile header', async ({ page }) => {
  await page.goto('/user/pg');
  await expect(page.locator('.mobile.item-header')).toContainText('Profile: pg');
  await shot(page, 'mobile-user');
});
