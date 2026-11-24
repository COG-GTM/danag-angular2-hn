import { test as base, expect, Page } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES = join(__dirname, '..', 'fixtures');
export const fixture = (name: string) => JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));
export const meta = fixture('meta.json');

function fixtureFor(url: URL): string | null {
  const p = url.pathname;
  if (url.host === 'node-hnapi.herokuapp.com') {
    const feed = p.match(/^\/(news|newest|show|ask|jobs)$/);
    if (feed) return `feed-${feed[1]}-${url.searchParams.get('page') || 1}.json`;
    const item = p.match(/^\/item\/(\d+)$/);
    if (item) return `item-${item[1]}.json`;
  }
  if (url.host === 'api.hnpwa.com') {
    const user = p.match(/^\/v0\/user\/([^/]+)\.json$/);
    if (user) return `user-${user[1]}.json`;
  }
  return null;
}

export const test = base.extend<{ mockApi: void }>({
  mockApi: [async ({ page }, use, testInfo) => {
    await page.route(/google-analytics\.com/, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    if (!testInfo.tags.includes('@live')) {
      await page.route(/node-hnapi\.herokuapp\.com|api\.hnpwa\.com/, route => {
        const name = fixtureFor(new URL(route.request().url()));
        if (name && existsSync(join(FIXTURES, name))) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: readFileSync(join(FIXTURES, name)) , headers: { 'access-control-allow-origin': '*' } });
        }
        // Unknown users on api.hnpwa.com answer 200 with `null`.
        return route.fulfill({ status: 200, contentType: 'application/json', body: 'null', headers: { 'access-control-allow-origin': '*' } });
      });
    }
    await use();
  }, { auto: true }],
});

export async function shot(page: Page, name: string) {
  const dir = join(__dirname, '..', 'report', 'shots', test.info().project.name);
  mkdirSync(dir, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir, `${name}.png`), fullPage: true, animations: 'disabled' });
}

export { expect };
