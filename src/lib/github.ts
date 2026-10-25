import { CVE_REPO, GITHUB_USER } from '../consts';
import featured from '../data/featured.json';

export type Repo = {
	name: string;
	description: string | null;
	html_url: string;
	language: string | null;
	stargazers_count: number;
	pushed_at?: string;
	topics?: string[];
	archived?: boolean;
	fork?: boolean;
};

/**
 * Repo list, read once at build time. GITHUB_TOKEN lifts the rate limit from
 * 60/hour to 1000/hour; GitHub Actions sets it for free.
 *
 * A failed call must not produce a silently empty page, so it falls back to the
 * hand-written list in data/featured.json and says so in the build log.
 */
let cached: Promise<Repo[]> | null = null;

export function getRepos(): Promise<Repo[]> {
	// Every page asks for the list; the API should be hit once per build.
	cached ??= fetchRepos();
	return cached;
}

async function fetchRepos(): Promise<Repo[]> {
	const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
	const url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`;

	let repos: Repo[];
	try {
		const res = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': `${GITHUB_USER}.github.io`,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});
		if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
		repos = (await res.json()) as Repo[];
		console.log(`[github] ${repos.length} repos read from the API`);
	} catch (err) {
		console.warn(`[github] ${err instanceof Error ? err.message : err}`);
		console.warn('[github] falling back to src/data/featured.json');
		repos = featured.fallback as Repo[];
	}

	const hide = new Set(featured.hide);
	const describe = featured.describe as Record<string, string>;

	const live = repos.filter((r) => !r.fork && !r.archived && !hide.has(r.name));
	const kept = live.filter(isSecurityWork);
	console.log(
		`[github] ${kept.length} of ${repos.length} repos listed ` +
			`(${repos.length - live.length} fork/archived/hidden, ` +
			`${live.length - kept.length} off-topic)`,
	);

	return kept.map((r) => ({ ...r, description: describe[r.name] ?? r.description }));
}

/**
 * The site is a security portfolio, so the repo list is default-deny: a repo
 * shows only if data/featured.json names it, or it carries one of the topics
 * listed there, or it is a CVE repo. Anything else — coursework, this site —
 * stays off without having to be hidden by name.
 */
function isSecurityWork(repo: Repo): boolean {
	if (CVE_REPO.test(repo.name)) return true;
	if ((featured.show as string[]).includes(repo.name)) return true;
	const topics = new Set(featured.showTopics as string[]);
	return (repo.topics ?? []).some((t) => topics.has(t));
}

/** Repos named CVE-YYYY-NNNNN are research; everything else is a project. */
export function splitRepos(repos: Repo[]) {
	const pin = featured.pin;
	const rank = (r: Repo) => {
		const i = pin.indexOf(r.name);
		return i === -1 ? pin.length : i;
	};
	const sorted = [...repos].sort(
		(a, b) => rank(a) - rank(b) || b.stargazers_count - a.stargazers_count,
	);
	return {
		advisories: sorted.filter((r) => CVE_REPO.test(r.name)),
		projects: sorted.filter((r) => !CVE_REPO.test(r.name)),
	};
}
