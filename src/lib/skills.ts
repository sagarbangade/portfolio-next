import { caseStudies, experience, projects, skills } from "./data";

export type Evidence = { kind: "client" | "job" | "project"; label: string; sub: string; href: string; external?: boolean };

/** Extra words a skill goes by in the job, case study and project text. */
const aliases: Record<string, string[]> = {
  "React (v16–19)": ["react"],
  "Micro-frontends (Module Federation)": ["micro-frontend", "module federation"],
  "Material UI": ["material ui", "mui"],
  "Tailwind CSS": ["tailwind"],
  "Express.js": ["express"],
  "REST API design": ["rest api"],
  Microservices: ["microservice"],
  Serverless: ["serverless", "aws lambda"],
  "LLM APIs": ["llm"],
  "RAG architecture": ["rag"],
  "GenAI workflows": ["genai", "gemini"],
  "Agentic pipelines": ["ai agent"],
  "Prompt engineering": ["prompt"],
  "AWS Lambda": ["lambda"],
  "AWS OpenSearch": ["opensearch"],
  "JavaScript (ES6+)": ["javascript"],
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whole-word match that also accepts a plural, so "Java" never matches "JavaScript" but "prompt" matches "prompts". */
function matcher(skill: string) {
  const base = skill.replace(/\s*\(.*\)\s*/, "").toLowerCase();
  const words = [base, ...(aliases[skill] ?? [])];
  const re = new RegExp(`(^|[^a-z0-9])(${words.map(escape).join("|")})s?(?![a-z0-9])`, "i");
  return (text: string) => re.test(text);
}

const sources: { evidence: Evidence; text: string }[] = [
  ...caseStudies.map((c) => ({
    evidence: { kind: "client" as const, label: c.name, sub: c.client, href: "#work" },
    text: [c.name, c.headline, ...c.points, ...c.stack].join(" · "),
  })),
  ...experience.map((e) => ({
    evidence: { kind: "job" as const, label: e.role, sub: `${e.company} · ${e.geo.city}`, href: "#experience" },
    text: [e.summary, ...e.highlights, ...e.stack].join(" · "),
  })),
  ...projects.map((p) => ({
    evidence: { kind: "project" as const, label: p.name, sub: `${p.live ? "Live demo" : "GitHub"} · ${p.year}`, href: p.live ?? p.repo ?? "#projects", external: true },
    text: [p.name, p.blurb, ...p.stack].join(" · "),
  })),
];

export function evidenceFor(skill: string): Evidence[] {
  const hit = matcher(skill);
  return sources.filter((s) => hit(s.text)).map((s) => s.evidence);
}

/** Every skill with where it was used, computed once from the same data the rest of the page shows. */
export const skillIndex = skills.map((g) => ({
  ...g,
  items: g.items.map((name) => ({ name, evidence: evidenceFor(name) })),
}));
