import { test, expect, fixture, shot } from './support';

test('root redirects to the news feed page 1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('li.post')).toHaveCount(fixture('feed-news-1.json').length);
});

for (const feed of ['news', 'newest', 'show', 'ask', 'jobs']) {
  test(`${feed} feed lists every story with title, meta and pagination`, async ({ page }) => {
    const items = fixture(`feed-${feed}-1.json`);
    await page.goto(`/${feed}/1`);
    const posts = page.locator('li.post');
    await expect(posts).toHaveCount(items.length);
    await expect(posts.first().locator('a.title')).toHaveText(items[0].title.trim());
    await expect(posts.nth(items.length - 1).locator('a.title')).toHaveText(items[items.length - 1].title.trim());
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
    await expect(page.locator('.nav a.prev')).toHaveCount(0);
    await expect(page.locator('.nav a.more')).toHaveCount(items.length === 30 ? 1 : 0);
    if (feed === 'jobs') {
      await expect(page.getByText('These are jobs at startups that were funded by Y Combinator.')).toBeVisible();
    } else {
      await expect(page.locator('.job-header')).toHaveCount(0);
      const first = items[0];
      await expect(posts.first().locator('.subtext-laptop')).toContainText(`${first.points} points by`);
      await expect(posts.first().locator('.subtext-laptop')).toContainText(first.user);
    }
    await shot(page, `feed-${feed}`);
  });
}

test('news pagination: More goes to page 2 numbered from 31, Prev goes back', async ({ page }) => {
  const page2 = fixture('feed-news-2.json');
  await page.goto('/news/1');
  await expect(page.locator('li.post')).toHaveCount(30);
  await page.locator('.nav a.more').click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.locator('li.post').first().locator('a.title')).toHaveText(page2[0].title.trim());
  await expect(page.locator('ol')).toHaveAttribute('start', '31');
  await expect(page.locator('.nav a.prev')).toBeVisible();
  await shot(page, 'feed-news-page-2');
  await page.locator('.nav a.prev').click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('feed shows an error message when the API fails', async ({ page }) => {
  await page.route(/node-hnapi\.herokuapp\.com\/newest/, r => r.abort());
  await page.goto('/newest/1');
  await expect(page.getByText('Could not load newest stories.')).toBeVisible();
  await shot(page, 'feed-error');
});
