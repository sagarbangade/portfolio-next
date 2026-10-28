import { profile } from "./data";

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type GitHubSnapshot = {
  ok: boolean;
  avatar: string;
  publicRepos: number;
  followers: number;
  since: number;
  stars: number;
  languages: { name: string; count: number }[];
  recent: Repo[];
  fetchedAt: string;
};

const FALLBACK: GitHubSnapshot = {
  ok: false,
  avatar: "https://avatars.githubusercontent.com/u/109343765?v=4",
  publicRepos: 73,
  followers: 49,
  since: 2022,
  stars: 46,
  languages: [
    { name: "JavaScript", count: 24 },
    { name: "HTML", count: 9 },
    { name: "TypeScript", count: 8 },
    { name: "Java", count: 5 },
    { name: "Python", count: 5 },
    { name: "Jupyter Notebook", count: 3 },
  ],
  recent: [],
  fetchedAt: new Date(0).toISOString(),
};

const HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "sagarbangade-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

/** Live GitHub data, cached and revalidated hourly so the page stays current without a redeploy. */
export async function getGitHubSnapshot(): Promise<GitHubSnapshot> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${profile.githubUser}`, { headers: HEADERS, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`, {
        headers: HEADERS,
        next: { revalidate: 3600 },
      }),
    ]);
    if (!userRes.ok || !reposRes.ok) return FALLBACK;

    const user = (await userRes.json()) as { avatar_url: string; public_repos: number; followers: number; created_at: string };
    const repos = ((await reposRes.json()) as ApiRepo[]).filter((r) => !r.fork && !r.archived);

    const langCounts = new Map<string, number>();
    for (const r of repos) if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);

    const hidden = new Set([profile.githubUser, "MyFirstProject", "craftycommerce", "FoodFiesta", "dolly-camera"]);

    return {
      ok: true,
      avatar: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      since: new Date(user.created_at).getUTCFullYear(),
      stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      languages: [...langCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      recent: repos
        .filter((r) => !hidden.has(r.name))
        .slice(0, 6)
        .map((r) => ({
          name: r.name,
          description: r.description,
          url: r.html_url,
          homepage: r.homepage || null,
          language: r.language,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at,
        })),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return FALLBACK;
  }
}

export const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Kotlin: "#A97BFF",
  "Jupyter Notebook": "#DA5B0B",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
  PHP: "#4F5D95",
};
