# Parity report

Same Playwright specs run against **baseline** (Angular 9, http://localhost:4000) and **upgraded** (http://localhost:4200).
API responses come from `parity/fixtures/` (snapshot of the public HN APIs) so both apps render identical data; only `@live` specs hit the real APIs, which is why `retries: 1` is set.

Baseline: 24/24 passed. Upgraded: 0/24 passed.

| Page / flow | baseline | upgraded |
|---|---|---|
| feeds.spec.ts › root redirects to the news feed page 1 | pass | not run |
| feeds.spec.ts › news feed lists every story with title, meta and pagination | pass | not run |
| feeds.spec.ts › newest feed lists every story with title, meta and pagination | pass | not run |
| feeds.spec.ts › show feed lists every story with title, meta and pagination | pass | not run |
| feeds.spec.ts › ask feed lists every story with title, meta and pagination | pass | not run |
| feeds.spec.ts › jobs feed lists every story with title, meta and pagination | pass | not run |
| feeds.spec.ts › news pagination: More goes to page 2 numbered from 31, Prev goes back | pass | not run |
| feeds.spec.ts › feed shows an error message when the API fails | pass | not run |
| header.spec.ts › header links navigate between feeds and mark the active one | pass | not run |
| item.spec.ts › comments link opens item details with the full comment tree | pass | not run |
| item.spec.ts › collapsing a comment hides its text and replies | pass | not run |
| item.spec.ts › ask story without URL links title to its own item page | pass | not run |
| live.spec.ts › live API: news feed and a profile load | pass | not run |
| mobile.spec.ts › mobile feed and item header with back button | pass | not run |
| mobile.spec.ts › mobile profile header | pass | not run |
| settings.spec.ts › settings popup opens and closes | pass | not run |
| settings.spec.ts › night theme applies and persists across reload | pass | not run |
| settings.spec.ts › amoledblack theme applies and persists across reload | pass | not run |
| settings.spec.ts › dark OS preference picks the night theme by default | pass | not run |
| settings.spec.ts › open links in new tab toggles target on story links | pass | not run |
| settings.spec.ts › font size and list spacing change the feed layout | pass | not run |
| user.spec.ts › author link opens the user profile | pass | not run |
| user.spec.ts › profile renders karma, age and about HTML | pass | not run |
| user.spec.ts › unknown user shows an error | pass | not run |

## Screenshots (baseline left, upgraded right)

| Screen | pixel diff |
|---|---|
| [feed-ask.png](side-by-side/feed-ask.png.png) | missing upgraded |
| [feed-error.png](side-by-side/feed-error.png.png) | missing upgraded |
| [feed-jobs.png](side-by-side/feed-jobs.png.png) | missing upgraded |
| [feed-newest.png](side-by-side/feed-newest.png.png) | missing upgraded |
| [feed-news-page-2.png](side-by-side/feed-news-page-2.png.png) | missing upgraded |
| [feed-news.png](side-by-side/feed-news.png.png) | missing upgraded |
| [feed-show.png](side-by-side/feed-show.png.png) | missing upgraded |
| [header-home.png](side-by-side/header-home.png.png) | missing upgraded |
| [item-ask.png](side-by-side/item-ask.png.png) | missing upgraded |
| [item-story.png](side-by-side/item-story.png.png) | missing upgraded |
| [mobile-feed.png](side-by-side/mobile-feed.png.png) | missing upgraded |
| [mobile-item.png](side-by-side/mobile-item.png.png) | missing upgraded |
| [mobile-user.png](side-by-side/mobile-user.png.png) | missing upgraded |
| [settings-font-spacing.png](side-by-side/settings-font-spacing.png.png) | missing upgraded |
| [settings-open.png](side-by-side/settings-open.png.png) | missing upgraded |
| [theme-amoledblack.png](side-by-side/theme-amoledblack.png.png) | missing upgraded |
| [theme-night.png](side-by-side/theme-night.png.png) | missing upgraded |
| [user-pg.png](side-by-side/user-pg.png.png) | missing upgraded |
| [user-unknown.png](side-by-side/user-unknown.png.png) | missing upgraded |

## Run it

```bash
cd parity && npm ci && npx playwright install chromium
npx playwright test            # both projects
node scripts/compose-report.mjs
```
