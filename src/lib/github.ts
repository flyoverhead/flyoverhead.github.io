import { writeFileSync } from 'node:fs';
import type { RepoRef } from './schema.ts';

export interface RepoInfo {
  name: string;
  label?: string;
  description: string;
  language: string | null;
  stars: number;
  url: string;
}

export class GitHubError extends Error {}

interface FetchOptions {
  owner: string;
  fetch?: typeof fetch;
  token?: string;
}

export async function fetchRepos(refs: RepoRef[], opts: FetchOptions): Promise<RepoInfo[]> {
  const doFetch = opts.fetch ?? fetch;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const repos: RepoInfo[] = [];
  for (const ref of refs) {
    let res: Response;
    try {
      res = await doFetch(`https://api.github.com/repos/${opts.owner}/${ref.name}`, { headers });
    } catch (err) {
      throw new GitHubError(`GitHub request failed for ${ref.name}: ${(err as Error).message}`);
    }
    if (res.status === 404) {
      console.warn(`repo ${opts.owner}/${ref.name} not found, skipping`);
      continue;
    }
    if (!res.ok) {
      throw new GitHubError(`GitHub returned ${res.status} for ${ref.name}`);
    }
    const r = await res.json();
    repos.push({
      name: ref.name,
      ...(ref.label ? { label: ref.label } : {}),
      description: r.description ?? '',
      language: r.language ?? null,
      stars: r.stargazers_count,
      url: r.html_url,
    });
  }
  return repos;
}

export async function updateSnapshot(opts: FetchOptions & { refs: RepoRef[]; path: string }): Promise<'updated' | 'kept'> {
  try {
    const repos = await fetchRepos(opts.refs, opts);
    writeFileSync(opts.path, `${JSON.stringify(repos, null, 2)}\n`);
    return 'updated';
  } catch (err) {
    if (!(err instanceof GitHubError)) throw err;
    console.log(`${err.message}; using committed snapshot`);
    return 'kept';
  }
}
