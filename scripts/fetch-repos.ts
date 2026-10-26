import { loadSiteData } from '../src/lib/data.ts';
import { updateSnapshot } from '../src/lib/github.ts';

const result = await updateSnapshot({
  refs: loadSiteData().repos,
  owner: 'flyoverhead',
  path: 'src/data/repos.snapshot.json',
  token: process.env.GITHUB_TOKEN,
});
console.log(`repos snapshot: ${result}`);
