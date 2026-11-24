// Builds report/side-by-side/*.png (baseline left, upgraded right), pixel-diff % and report/README.md.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'report');
const shots = join(root, 'shots');
const out = join(root, 'side-by-side');
mkdirSync(out, { recursive: true });

function pad(img, w, h) {
  const p = new PNG({ width: w, height: h });
  p.data.fill(255);
  PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0);
  return p;
}

const rows = [];
const names = existsSync(join(shots, 'baseline')) ? readdirSync(join(shots, 'baseline')).filter(f => f.endsWith('.png')).sort() : [];
for (const f of names) {
  const upPath = join(shots, 'upgraded', f);
  if (!existsSync(upPath)) { rows.push({ name: f, diff: 'missing upgraded' }); continue; }
  const a = PNG.sync.read(readFileSync(join(shots, 'baseline', f)));
  const b = PNG.sync.read(readFileSync(upPath));
  const w = Math.max(a.width, b.width), h = Math.max(a.height, b.height);
  const pa = pad(a, w, h), pb = pad(b, w, h);
  const diffPx = pixelmatch(pa.data, pb.data, null, w, h, { threshold: 0.1 });
  const gap = 16;
  const sbs = new PNG({ width: w * 2 + gap, height: h });
  sbs.data.fill(200);
  PNG.bitblt(pa, sbs, 0, 0, w, h, 0, 0);
  PNG.bitblt(pb, sbs, 0, 0, w, h, w + gap, 0);
  writeFileSync(join(out, f), PNG.sync.write(sbs));
  rows.push({ name: f.replace(/\.png$/, ''), diff: (100 * diffPx / (w * h)).toFixed(2) + '%', size: a.width === b.width && a.height === b.height ? '' : ` (${a.width}x${a.height} vs ${b.width}x${b.height})` });
}

const results = existsSync(join(root, 'results.json')) ? JSON.parse(readFileSync(join(root, 'results.json'), 'utf8')) : { suites: [] };
const tests = new Map();
const walk = (s, file) => {
  for (const spec of s.specs || []) for (const t of spec.tests) {
    const key = `${file || s.file} › ${spec.title}`;
    const last = t.results[t.results.length - 1];
    tests.set(key, { ...(tests.get(key) || {}), [t.projectName]: last ? (last.status === 'passed' ? (t.results.length > 1 ? 'pass (retry)' : 'pass') : last.status) : 'not run' });
  }
  for (const c of s.suites || []) walk(c, file || s.file);
};
for (const s of results.suites) walk(s, s.file);
const count = p => [...tests.values()].filter(t => (t[p] || '').startsWith('pass')).length;

let md = `# Parity report\n\nSame Playwright specs run against **baseline** (Angular 9, http://localhost:4000) and **upgraded** (http://localhost:4200).\n`;
md += `API responses come from \`parity/fixtures/\` (snapshot of the public HN APIs) so both apps render identical data; only \`@live\` specs hit the real APIs, which is why \`retries: 1\` is set.\n\n`;
md += `Baseline: ${count('baseline')}/${tests.size} passed. Upgraded: ${count('upgraded')}/${tests.size} passed.\n\n`;
md += `| Page / flow | baseline | upgraded |\n|---|---|---|\n`;
for (const [k, v] of tests) md += `| ${k} | ${v.baseline || 'not run'} | ${v.upgraded || 'not run'} |\n`;
md += `\n## Screenshots (baseline left, upgraded right)\n\n| Screen | pixel diff |\n|---|---|\n`;
for (const r of rows) md += `| [${r.name}](side-by-side/${r.name}.png) | ${r.diff}${r.size || ''} |\n`;
md += `\n## Run it\n\nThe baseline is master plus the profile-endpoint fix (commit a601f45, the first commit of the upgrade PR); plain master 404s on user profiles.\n\n\`\`\`bash\n# baseline (Angular 9) on :4000\ngit worktree add ../baseline a601f45 && cd ../baseline\nnvm use 12 && yarn install && npx ng serve --port 4000\n# upgraded (Angular 21) on :4200, from this branch\nnvm use 20 && yarn install && npx ng serve --port 4200\n# suite + report\ncd parity && npm ci && npx playwright install chromium\nnpx playwright test            # both projects\nnode scripts/compose-report.mjs\n\`\`\`\n`;
writeFileSync(join(root, 'README.md'), md);
console.log(md);
