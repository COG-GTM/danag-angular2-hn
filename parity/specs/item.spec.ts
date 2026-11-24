import { test, expect, fixture, meta, shot } from './support';

function countComments(list: any[]): number {
  return list.reduce((n, c) => n + 1 + countComments(c.comments || []), 0);
}

test('comments link opens item details with the full comment tree', async ({ page }) => {
  const item = fixture(`item-${meta.storyId}.json`);
  await page.goto('/news/1');
  const post = page.locator('li.post', { has: page.locator(`a[href="/item/${meta.storyId}"]`) }).first();
  await post.locator(`.subtext-laptop a[href="/item/${meta.storyId}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/item/${meta.storyId}$`));
  await expect(page.locator('.laptop a.title')).toHaveText(item.title.trim());
  await expect(page.locator('.laptop .subtext')).toContainText(`${item.points} points by`);
  await expect(page.locator('app-comment')).toHaveCount(countComments(item.comments));
  await shot(page, 'item-story');
});

test('collapsing a comment hides its text and replies', async ({ page }) => {
  const item = fixture(`item-${meta.storyId}.json`);
  const firstLive = item.comments.find((c: any) => !c.deleted);
  await page.goto(`/item/${meta.storyId}`);
  const first = page.locator('ul.comment-list > li').nth(item.comments.indexOf(firstLive));
  const toggle = first.locator('.meta .collapse').first();
  await expect(toggle).toHaveText('[-]');
  await expect(first.locator('.comment-text').first()).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText('[+]');
  await expect(first.locator('.comment-text').first()).toBeHidden();
  await toggle.click();
  await expect(first.locator('.comment-text').first()).toBeVisible();
});

test('ask story without URL links title to its own item page', async ({ page }) => {
  const item = fixture(`item-${meta.askId}.json`);
  await page.goto('/ask/1');
  const post = page.locator('li.post', { has: page.locator(`a.title[href="/item/${meta.askId}"]`) }).first();
  await post.locator('a.title').click();
  await expect(page).toHaveURL(new RegExp(`/item/${meta.askId}$`));
  await expect(page.locator('.laptop a.title')).toHaveText(item.title.trim());
  await expect(page.locator('p.subject')).not.toBeEmpty();
  await shot(page, 'item-ask');
});
