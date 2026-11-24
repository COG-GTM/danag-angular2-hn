import { test, expect, shot } from './support';

test('header links navigate between feeds and mark the active one', async ({ page }) => {
  await page.goto('/news/1');
  for (const [label, path] of [['new', 'newest'], ['show', 'show'], ['ask', 'ask'], ['jobs', 'jobs']]) {
    const link = page.locator('.header-nav a', { hasText: new RegExp(`^${label}$`) });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/${path}/1$`));
    await expect(link).toHaveClass(/active/);
    await expect(page.locator('li.post').first()).toBeVisible();
  }
  await page.locator('a.home-link').click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('#footer')).toContainText('Show this project some');
  await shot(page, 'header-home');
});
