import { test, expect, fixture, meta, shot } from './support';

test('author link opens the user profile', async ({ page }) => {
  const user = fixture(`user-${meta.storyUser}.json`);
  await page.goto(`/item/${meta.storyId}`);
  await page.locator(`.laptop .subtext a[href="/user/${meta.storyUser}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/user/${meta.storyUser}$`));
  await expect(page.locator('.main-details .name')).toHaveText(user.id);
  await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
  await expect(page.locator('.main-details .age')).toHaveText(`Created ${user.created}`);
});

test('profile renders karma, age and about HTML', async ({ page }) => {
  const user = fixture('user-pg.json');
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText('pg');
  await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
  await expect(page.locator('.main-details .age')).toHaveText(`Created ${user.created}`);
  if (user.about) await expect(page.locator('.other-details')).toBeVisible();
  await shot(page, 'user-pg');
});

test('unknown user shows an error', async ({ page }) => {
  await page.goto('/user/nosuchuser-parity');
  await expect(page.getByText('Could not load user nosuchuser-parity.')).toBeVisible();
  await shot(page, 'user-unknown');
});
