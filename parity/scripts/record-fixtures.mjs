// Snapshot the live HN APIs once so baseline and upgraded runs render identical data.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
mkdirSync(out, { recursive: true });
const HNAPI = 'https://node-hnapi.herokuapp.com';
const HNPWA = 'https://api.hnpwa.com/v0';

async function get(url) {
  const res = await fetch(url);
  const text = await res.text();
  return JSON.parse(text);
}
function save(name, data) {
  if (!/^[\w.-]+\.json$/.test(name) || name.includes('..')) throw new Error(`unsafe fixture name: ${name}`);
  writeFileSync(join(out, name), JSON.stringify(data, null, 1));
  console.log('saved', name);
}

const feeds = {};
for (const [feed, page] of [['news', 1], ['news', 2], ['newest', 1], ['show', 1], ['ask', 1], ['jobs', 1]]) {
  feeds[`${feed}-${page}`] = await get(`${HNAPI}/${feed}?page=${page}`);
  save(`feed-${feed}-${page}.json`, feeds[`${feed}-${page}`]);
}

const news = feeds['news-1'];
// The collapse spec needs a live top-level comment that has replies.
const hasThread = item => (item.comments || []).some(c => !c.deleted && (c.comments || []).length > 0);
let story, storyItem;
for (const s of news.filter(s => s.comments_count >= 3 && s.comments_count <= 80)) {
  const item = await get(`${HNAPI}/item/${s.id}`);
  if (hasThread(item)) { story = s; storyItem = item; break; }
}
if (!story) throw new Error('no news story with a threaded comment; re-run later');
const ask = feeds['ask-1'].find(s => s.comments_count >= 1 && s.comments_count <= 80) || feeds['ask-1'][0];
save(`item-${story.id}.json`, storyItem);
if (ask.id !== story.id) save(`item-${ask.id}.json`, await get(`${HNAPI}/item/${ask.id}`));

const users = new Set(['pg', story.user]);
for (const u of users) save(`user-${u}.json`, await get(`${HNPWA}/user/${u}.json`));

save('meta.json', { recordedAt: new Date().toISOString(), storyId: story.id, askId: ask.id, storyUser: story.user });
