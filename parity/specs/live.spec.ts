import { test, expect } from './support';

test('live API: news feed and a profile load', { tag: '@live' }, async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible({ timeout: 20_000 });
  expect(await page.locator('li.post').count()).toBeGreaterThan(10);
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText('pg', { timeout: 20_000 });
});
