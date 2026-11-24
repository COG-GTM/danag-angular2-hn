import { test, expect, shot } from './support';

test('settings popup opens and closes', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('app-settings')).toHaveCount(0);
  await page.locator('img.settings').click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.locator('input[type=radio][value=default]')).toBeChecked();
  await shot(page, 'settings-open');
  await page.locator('.popup .close').click();
  await expect(page.locator('app-settings')).toHaveCount(0);
});

for (const theme of ['night', 'amoledblack']) {
  test(`${theme} theme applies and persists across reload`, async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('img.settings').click();
    await page.locator(`input[type=radio][value=${theme}]`).click();
    await expect(page.locator('app-root > div').first()).toHaveClass(theme);
    await page.locator('.popup .close').click();
    await shot(page, `theme-${theme}`);
    await page.reload();
    await expect(page.locator('app-root > div').first()).toHaveClass(theme);
  });
}

test('dark OS preference picks the night theme by default', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark', baseURL, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.route(/google-analytics\.com|node-hnapi|api\.hnpwa/, r => r.fulfill({ status: 200, body: '[]', headers: { 'access-control-allow-origin': '*' } }));
  await page.goto('/news/1');
  await expect(page.locator('app-root > div').first()).toHaveClass('night');
  await ctx.close();
});

test('open links in new tab toggles target on story links', async ({ page }) => {
  await page.goto('/news/1');
  const external = page.locator('li.post a.title[href^="http"]').first();
  await expect(external).not.toHaveAttribute('target', '_blank');
  await page.locator('img.settings').click();
  await page.locator('.control-section input[type=checkbox]').check();
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', 'noopener');
  await page.reload();
  await expect(page.locator('li.post a.title[href^="http"]').first()).toHaveAttribute('target', '_blank');
});

test('font size and list spacing change the feed layout', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  const font = page.getByLabel('Font size:');
  await font.fill('22');
  await font.press('End');
  const spacing = page.getByLabel('List spacing:');
  await spacing.fill('12');
  await spacing.press('End');
  await expect(page.locator('li.post a.title').first()).toHaveCSS('font-size', '22px');
  await expect(page.locator('li.post .item-block > div').first()).toHaveCSS('margin-bottom', '12px');
  await page.locator('.popup .close').click();
  await shot(page, 'settings-font-spacing');
});
