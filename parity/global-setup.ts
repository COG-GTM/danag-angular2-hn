import { rmSync } from 'node:fs';
import { join } from 'node:path';

// Drop screenshots from earlier runs so compose-report never compares a stale image.
export default function globalSetup() {
  rmSync(join(__dirname, 'report', 'shots'), { recursive: true, force: true });
}
