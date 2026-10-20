export const SITE_TITLE = 'yuwkaaa';
export const SITE_DESCRIPTION =
	'Web security research: published CVEs, the tooling behind them, and CTF writeups.';

/** GitHub account the project list is built from. */
export const GITHUB_USER = 'yuwkaaa';

/** Repos whose name matches this are research, not projects. */
export const CVE_REPO = /^CVE-\d{4}-\d+/i;

export const NAV = [
	{ href: '/', label: 'home', sub: 'index' },
	{ href: '/projects/', label: 'projects', sub: 'built' },
	{ href: '/research/', label: 'research', sub: 'cve & ctf' },
];
