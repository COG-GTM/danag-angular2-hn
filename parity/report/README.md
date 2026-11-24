# Parity report

Same Playwright specs run against **baseline** (Angular 9, http://localhost:4000) and **upgraded** (http://localhost:4200).
API responses come from `parity/fixtures/` (snapshot of the public HN APIs) so both apps render identical data; only `@live` specs hit the real APIs, which is why `retries: 1` is set.

Baseline: 24/24 passed. Upgraded: 24/24 passed.

| Page / flow | baseline | upgraded |
|---|---|---|
| feeds.spec.ts › root redirects to the news feed page 1 | pass | pass |
| feeds.spec.ts › news feed lists every story with title, meta and pagination | pass | pass |
| feeds.spec.ts › newest feed lists every story with title, meta and pagination | pass | pass |
| feeds.spec.ts › show feed lists every story with title, meta and pagination | pass | pass |
| feeds.spec.ts › ask feed lists every story with title, meta and pagination | pass | pass |
| feeds.spec.ts › jobs feed lists every story with title, meta and pagination | pass | pass |
| feeds.spec.ts › news pagination: More goes to page 2 numbered from 31, Prev goes back | pass | pass |
| feeds.spec.ts › feed shows an error message when the API fails | pass | pass |
| header.spec.ts › header links navigate between feeds and mark the active one | pass | pass |
| item.spec.ts › comments link opens item details with the full comment tree | pass | pass |
| item.spec.ts › collapsing a comment hides its text and replies | pass | pass |
| item.spec.ts › ask story without URL links title to its own item page | pass | pass |
| live.spec.ts › live API: news feed and a profile load | pass | pass |
| mobile.spec.ts › mobile feed and item header with back button | pass | pass |
| mobile.spec.ts › mobile profile header | pass | pass |
| settings.spec.ts › settings popup opens and closes | pass | pass |
| settings.spec.ts › night theme applies and persists across reload | pass | pass |
| settings.spec.ts › amoledblack theme applies and persists across reload | pass | pass |
| settings.spec.ts › dark OS preference picks the night theme by default | pass | pass |
| settings.spec.ts › open links in new tab toggles target on story links | pass | pass |
| settings.spec.ts › font size and list spacing change the feed layout | pass | pass |
| user.spec.ts › author link opens the user profile | pass | pass |
| user.spec.ts › profile renders karma, age and about HTML | pass | pass |
| user.spec.ts › unknown user shows an error | pass | pass |

## Screenshots (baseline left, upgraded right)

| Screen | pixel diff |
|---|---|
| [feed-ask](side-by-side/feed-ask.png) | 0.00% |
| [feed-error](side-by-side/feed-error.png) | 0.00% |
| [feed-jobs](side-by-side/feed-jobs.png) | 0.00% |
| [feed-newest](side-by-side/feed-newest.png) | 0.00% |
| [feed-news-page-2](side-by-side/feed-news-page-2.png) | 0.00% |
| [feed-news](side-by-side/feed-news.png) | 0.00% |
| [feed-show](side-by-side/feed-show.png) | 0.00% |
| [header-home](side-by-side/header-home.png) | 0.00% |
| [item-ask](side-by-side/item-ask.png) | 0.00% |
| [item-story](side-by-side/item-story.png) | 0.00% |
| [mobile-feed](side-by-side/mobile-feed.png) | 0.00% |
| [mobile-item](side-by-side/mobile-item.png) | 0.00% |
| [mobile-user](side-by-side/mobile-user.png) | 0.00% |
| [settings-font-spacing](side-by-side/settings-font-spacing.png) | 0.00% |
| [settings-open](side-by-side/settings-open.png) | 0.00% |
| [theme-amoledblack](side-by-side/theme-amoledblack.png) | 0.00% |
| [theme-night](side-by-side/theme-night.png) | 0.00% |
| [user-pg](side-by-side/user-pg.png) | 0.00% |
| [user-unknown](side-by-side/user-unknown.png) | 0.00% |

## Run it

```bash
cd parity && npm ci && npx playwright install chromium
npx playwright test            # both projects
node scripts/compose-report.mjs
```
