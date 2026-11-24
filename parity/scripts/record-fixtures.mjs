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
  writeFileSync(join(out, name), JSON.stringify(data, null, 1));
  console.log('saved', name);
}

const feeds = {};
for (const [feed, page] of [['news', 1], ['news', 2], ['newest', 1], ['show', 1], ['ask', 1], ['jobs', 1]]) {
  feeds[`${feed}-${page}`] = await get(`${HNAPI}/${feed}?page=${page}`);
  save(`feed-${feed}-${page}.json`, feeds[`${feed}-${page}`]);
}

const news = feeds['news-1'];
const story = news.find(s => s.comments_count >= 3 && s.comments_count <= 80) || news[0];
const ask = feeds['ask-1'].find(s => s.comments_count >= 1 && s.comments_count <= 80) || feeds['ask-1'][0];
const ids = new Set([story.id, ask.id]);
for (const id of ids) save(`item-${id}.json`, await get(`${HNAPI}/item/${id}`));

const users = new Set(['pg', story.user]);
for (const u of users) save(`user-${u}.json`, await get(`${HNPWA}/user/${u}.json`));

save('meta.json', { recordedAt: new Date().toISOString(), storyId: story.id, askId: ask.id, storyUser: story.user });
