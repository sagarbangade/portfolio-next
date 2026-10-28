import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ArrowRight, ArrowUp, ArrowUpRight, Download, GraduationCap, MapPin, Star } from "lucide-react";
import { AvailabilityHint, CopyEmailButton, LocalTime, PaletteHint, RoleTicker } from "@/components/bits";
import { CommandPalette } from "@/components/command-palette";
import { ExperienceTabs } from "@/components/experience";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { PhotoSwitcher } from "@/components/photos";
import { ProjectGrid } from "@/components/work";
import { SkillsMatrix } from "@/components/skills";
import { education, experience, featured, formatTenure, monthsSince, profile, skills } from "@/lib/data";
import { getGitHubSnapshot, languageColors, type GitHubSnapshot } from "@/lib/github";
import { getPhotos, type Photo } from "@/lib/photos";

export const revalidate = 3600;

const hasResume = existsSync(join(process.cwd(), "public", profile.resume.slice(1)));

export default async function Home() {
  const gh = await getGitHubSnapshot();
  const photos = getPhotos();
  const careerMonths = monthsSince(experience[experience.length - 1].start);

  return (
    <>
      <Hero gh={gh} careerMonths={careerMonths} photo={photos[0]} />
      <Marquee />
      <About gh={gh} photos={photos} />
      <Section id="experience" index="02" eyebrow="Experience" title="Where I've shipped">
        <ExperienceTabs />
      </Section>
      <Work />
      <GitHubLive gh={gh} />
      <Section
        id="skills"
        index="05"
        eyebrow="Toolkit"
        title="The stack I reach for"
        intro={`${skills.reduce((n, g) => n + g.items.length, 0)} tools across the stack, from component libraries to Lambda functions to fine-tuned models.`}
      >
        <SkillsMatrix />
      </Section>
      <Education />
      <Contact />
      <Footer />
      <CommandPalette hasResume={hasResume} />
    </>
  );
}

function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  aside,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-20 sm:py-28" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div data-reveal className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="text-accent">{index}</span>
              <span className="h-px w-8 bg-line-strong" />
              {eyebrow}
            </p>
            <h2 id={`${id}-title`} className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {title}
            </h2>
            {intro && <p className="mt-4 text-pretty text-base text-muted sm:text-lg">{intro}</p>}
          </div>
          {aside}
        </div>
        <div data-reveal>{children}</div>
      </div>
    </section>
  );
}

function Hero({ gh, careerMonths, photo }: { gh: GitHubSnapshot; careerMonths: number; photo?: Photo }) {
  const stats = [
    { value: `${Math.floor(careerMonths / 12)}+ yrs`, label: "shipping software, incl. internships" },
    { value: "+22%", label: "user engagement from LLM chatbot features" },
    { value: "−15%", label: "UAT defect rate on enterprise Java apps" },
    { value: `${gh.publicRepos}`, label: "public repos on GitHub, live count" },
  ];

  return (
    <section id="top" className="noise relative overflow-hidden" aria-label="Introduction">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div aria-hidden className="glow absolute -top-48 left-1/2 -z-10 h-[560px] w-[900px] max-w-[160vw] -translate-x-1/2" />

      <div className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-40">
        <div className="fade-up flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elev/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="ping-soft absolute inline-flex size-full rounded-full bg-ok" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            Open to interesting full-stack work
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elev/70 px-3 py-1.5 font-mono text-xs text-muted backdrop-blur">
            <MapPin className="size-3.5" /> Bengaluru · <LocalTime /> IST
          </span>
        </div>

        <h1 className="fade-up mt-8 text-[clamp(3rem,10.5vw,8.25rem)] font-semibold leading-[0.9] tracking-[-0.05em]" style={{ animationDelay: "80ms" }}>
          Sagar Eknath
          <br />
          {photo && (
            <span className="relative mr-[0.2em] inline-block h-[0.72em] w-[1.55em] -translate-y-[0.06em] overflow-hidden rounded-full border border-line-strong align-middle shadow-xl shadow-black/30 transition-[width] duration-500 ease-out hover:w-[2.3em]">
              <Image
                src={photo.src}
                alt=""
                fill
                priority
                sizes="(min-width: 640px) 320px, 160px"
                className="object-cover"
                style={{ objectPosition: photo.position }}
              />
            </span>
          )}
          <span className="font-serif font-normal italic tracking-[-0.02em] text-accent">Bangade</span>
          <span className="text-accent">.</span>
        </h1>

        <div className="mt-10 grid items-end gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div className="fade-up" style={{ animationDelay: "160ms" }}>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
              <span className="text-fg">{profile.role} at {profile.company}.</span> {profile.tagline}
            </p>
            <p className="mt-5 font-mono text-sm text-subtle">
              <span className="text-accent">❯</span> currently building with <RoleTicker />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                data-testid="cta-work"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-[#0a0a0b] transition hover:brightness-110"
              >
                See my work <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </a>
              {hasResume ? (
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="cta-resume"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition hover:border-fg"
                >
                  Résumé <Download className="size-4" />
                </a>
              ) : (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition hover:border-fg"
                >
                  <LinkedInIcon className="size-4" /> LinkedIn
                </a>
              )}
              <PaletteHint className="hidden sm:inline-flex" />
            </div>
          </div>

          <Terminal />
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4" data-testid="hero-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="fade-up bg-bg/80 p-5 backdrop-blur sm:p-6" style={{ animationDelay: `${260 + i * 70}ms` }}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight sm:text-4xl">{s.value}</dd>
              <dd className="mt-1.5 text-pretty text-xs leading-snug text-muted sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Terminal() {
  const lines: [string, string][] = [
    ["role", `"${profile.role}"`],
    ["company", `"${profile.company}"`],
    ["based", `"Bengaluru, IN"`],
    ["focus", `["micro-frontends", "design systems", "serverless"]`],
    ["degree", `"B.Tech, Artificial Intelligence"`],
    ["ninja_way", `"never give up"`],
  ];
  return (
    <div
      data-spotlight
      className="fade-up overflow-hidden rounded-2xl border border-line bg-elev/80 font-mono text-[12.5px] leading-relaxed shadow-2xl shadow-black/20 backdrop-blur sm:text-[13px]"
      style={{ animationDelay: "240ms" }}
      aria-label="Profile summary as a terminal"
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-subtle">~/sagar — zsh</span>
      </div>
      <div className="overflow-x-auto p-4 sm:p-5">
        <p>
          <span className="text-accent">❯</span> <span className="text-fg">whoami</span> <span className="text-subtle">--json</span>
        </p>
        <p className="text-subtle">{"{"}</p>
        {lines.map(([k, v], i) => (
          <p key={k} className="whitespace-nowrap pl-4">
            <span className="text-gold">&quot;{k}&quot;</span>
            <span className="text-subtle">: </span>
            <span className="text-fg/85">{v}</span>
            {i < lines.length - 1 && <span className="text-subtle">,</span>}
          </p>
        ))}
        <p className="text-subtle">{"}"}</p>
        <p className="mt-1">
          <span className="text-accent">❯</span> <span className="caret inline-block h-4 w-2 translate-y-0.5 bg-fg/70" />
        </p>
      </div>
    </div>
  );
}

function Marquee() {
  const items = ["React", "Next.js", "TypeScript", "Node.js", "AWS Lambda", "Module Federation", "Storybook", "Redux", "MUI", "Python", "PHP", "Tailwind", "Gemini", "MongoDB", "MySQL", "Docker"];
  return (
    <div className="marquee-wrap relative overflow-hidden border-y border-line py-4" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
      <div className="marquee flex w-max gap-10 font-mono text-sm text-subtle">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="text-accent/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function About({ gh, photos }: { gh: GitHubSnapshot; photos: Photo[] }) {
  return (
    <Section id="about" index="01" eyebrow="About" title="Frontend architecture, full-stack range.">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div data-spotlight className="relative self-start overflow-hidden rounded-2xl border border-line bg-elev">
          {photos.length > 0 && <PhotoSwitcher photos={photos} />}
          <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {photos.length === 0 && (
              <Image
                src={gh.avatar}
                alt="Portrait of Sagar Eknath Bangade"
                width={80}
                height={80}
                className="size-16 rounded-2xl border border-line-strong object-cover sm:size-20"
              />
            )}
            <div>
              <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
              <p className="text-sm text-muted">{profile.role}</p>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-subtle">Now</dt>
              <dd className="mt-1">Software Engineer, InspironLabs</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-subtle">Based in</dt>
              <dd className="mt-1">Bengaluru, India</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-subtle">Studied</dt>
              <dd className="mt-1">B.Tech, Artificial Intelligence</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-subtle">Ask me about</dt>
              <dd className="mt-1">React architecture</dd>
            </div>
          </dl>
          <figure className="mt-8 border-t border-line pt-6">
            <blockquote lang="ja" className="font-serif text-2xl italic leading-snug text-fg/90">
              諦めないのが俺の忍道だ
            </blockquote>
            <figcaption className="mt-2 text-xs text-subtle">Not giving up is my ninja way. The motto I code by.</figcaption>
          </figure>
          </div>
        </div>

        <div className="space-y-6 text-pretty text-lg leading-relaxed text-muted">
          <p>
            <span className="text-fg">{profile.summary}</span>
          </p>
          <p>
            My path went from AI/ML to full-stack. I started with enterprise Java at Asterisc, prototyped LLM chatbot features
            at ImmverseAI during my B.Tech in Artificial Intelligence, then went deep on frontend architecture at InspironLabs:
            breaking a legacy healthcare monolith into micro-frontends with Module Federation and building the Storybook design
            system that keeps it consistent.
          </p>
          <p>
            Outside work I build things that scratch an itch: an AI agent that audits local businesses and writes their cold
            emails, a Chrome extension that exports an entire web page as a replayable archive, and a guide to fine-tuning LLMs
            on a 6&nbsp;GB laptop GPU.
          </p>
          <ul className="grid gap-3 pt-2 text-base sm:grid-cols-2">
            {[
              ["Micro-frontends", "Module Federation, independent deploys"],
              ["Design systems", "MUI + Storybook libraries teams adopt"],
              ["Serverless", "AWS Lambda in Node.js, Python and PHP"],
              ["Applied AI", "Gemini and LLM features that ship"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-xl border border-line bg-elev/60 p-4">
                <p className="text-sm font-medium text-fg">{t}</p>
                <p className="mt-0.5 text-sm text-subtle">{d}</p>
              </li>
            ))}
          </ul>
          <p className="text-base text-subtle">Fun fact: I&apos;m fascinated by aliens and all things weird. Ask me about it.</p>
        </div>
      </div>
    </Section>
  );
}

function Work() {
  return (
    <Section
      id="work"
      index="03"
      eyebrow="Selected work"
      title="Products, platforms and side quests"
      intro="Platform work from my day job first, then things I've built on my own: AI agents, browser tooling, mobile apps and full-stack products, most of them live."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {featured.map((p, i) => (
          <article key={p.name} data-spotlight className="relative overflow-hidden rounded-2xl border border-line bg-elev p-6 sm:p-8">
            <div aria-hidden className="absolute -right-6 -top-10 select-none font-serif text-[9rem] italic leading-none text-fg/[0.04]">
              0{i + 1}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">{p.org}</span>
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
                  {t}
                </span>
              ))}
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{p.name}</h3>
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted">{p.blurb}</p>
            <ul className="mt-5 space-y-2.5">
              {p.details?.map((d) => (
                <li key={d} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" />
                  {d}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-14">
        <ProjectGrid />
      </div>
    </Section>
  );
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < day) return "today";
  const days = Math.round(diff / day);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

function GitHubLive({ gh }: { gh: GitHubSnapshot }) {
  const totalLang = gh.languages.reduce((n, l) => n + l.count, 0) || 1;
  const tiles = [
    { label: "Public repos", value: gh.publicRepos },
    { label: "Followers", value: gh.followers },
    { label: "Stars earned", value: gh.stars },
    { label: "Coding on GitHub since", value: gh.since },
  ];
  return (
    <Section
      id="github"
      index="04"
      eyebrow="Live from GitHub"
      title="What I'm pushing lately"
      intro="Pulled from the GitHub API and refreshed every hour, so this section stays current without a redeploy."
      aside={
        <a
          href={`${profile.github}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong px-4 py-2 text-sm transition hover:border-fg md:self-auto"
        >
          <GitHubIcon className="size-4" /> @{profile.githubUser} <ArrowUpRight className="size-4" />
        </a>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {tiles.map((t) => (
              <div key={t.label} className="bg-elev p-5">
                <dd className="text-3xl font-semibold tracking-tight tabular-nums">{t.value}</dd>
                <dt className="mt-1 text-xs text-muted">{t.label}</dt>
              </div>
            ))}
          </dl>
          <div className="rounded-2xl border border-line bg-elev p-5">
            <p className="text-sm font-medium">Languages across my repos</p>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface" role="img" aria-label="Language share across public repositories">
              {gh.languages.map((l) => (
                <span key={l.name} style={{ width: `${(l.count / totalLang) * 100}%`, background: languageColors[l.name] ?? "var(--subtle)" }} />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted">
              {gh.languages.map((l) => (
                <li key={l.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: languageColors[l.name] ?? "var(--subtle)" }} />
                  <span className="truncate">{l.name}</span>
                  <span className="ml-auto font-mono text-subtle">{Math.round((l.count / totalLang) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-elev">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="text-sm font-medium">Recently pushed</p>
            <p className="font-mono text-[11px] text-subtle">{gh.ok ? `synced ${relativeTime(gh.fetchedAt)}` : "offline snapshot"}</p>
          </div>
          {gh.recent.length ? (
            <ul className="divide-y divide-line" data-testid="github-recent">
              {gh.recent.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noreferrer" className="group flex items-start gap-4 px-5 py-4 transition hover:bg-surface/60">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span className="truncate">{r.name}</span>
                        <ArrowUpRight className="size-3.5 shrink-0 text-subtle opacity-0 transition group-hover:opacity-100" />
                      </p>
                      {r.description && <p className="mt-1 line-clamp-1 text-sm text-muted">{r.description}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-subtle">
                      <span className="font-mono">{relativeTime(r.pushedAt)}</span>
                      <span className="flex items-center gap-3">
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full" style={{ background: languageColors[r.language] ?? "var(--subtle)" }} />
                            <span className="hidden sm:inline">{r.language}</span>
                          </span>
                        )}
                        {r.stars > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="size-3" />
                            {r.stars}
                          </span>
                        )}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">
              GitHub didn&apos;t answer this time.{" "}
              <a className="text-accent underline-offset-4 hover:underline" href={profile.github} target="_blank" rel="noreferrer">
                See the latest on GitHub
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

function Education() {
  return (
    <Section id="education" index="06" eyebrow="Education" title="Foundations">
      <ol className="grid gap-4 sm:grid-cols-2">
        {education.map((e) => (
          <li key={e.title} data-spotlight className="flex gap-4 rounded-2xl border border-line bg-elev p-5 sm:p-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-accent">
              <GraduationCap className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">
                {e.kind} · {e.period}
              </p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight">{e.title}</h3>
              <p className="mt-1 text-sm text-muted">
                {e.school} · {e.location}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div data-reveal className="noise relative overflow-hidden rounded-3xl border border-line bg-elev px-6 py-14 sm:px-12 sm:py-20">
          <div aria-hidden className="bg-grid absolute inset-0" />
          <div aria-hidden className="glow absolute -bottom-40 left-1/2 h-[420px] w-[720px] max-w-[150vw] -translate-x-1/2" />
          <div className="relative">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="text-accent">07</span>
              <span className="h-px w-8 bg-line-strong" />
              Contact
            </p>
            <h2 id="contact-title" className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Let&apos;s build something <span className="font-serif font-normal italic text-accent">together</span>.
            </h2>
            <p lang="ja" className="mt-3 font-serif text-xl italic text-subtle">
              一緒に何かを作ろう
            </p>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
              I&apos;m open to interesting full-stack work, frontend architecture problems and collaborations. Email is the fastest
              way to reach me, and I reply to everything.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0b] transition hover:brightness-110"
              >
                Say hello <ArrowUpRight className="size-4" />
              </a>
              <CopyEmailButton size="lg" className="justify-between sm:justify-center" />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-fg">
                <LinkedInIcon className="size-4" /> linkedin.com/in/sagar-bangade
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-fg">
                <GitHubIcon className="size-4" /> github.com/sagarbangade
              </a>
              <span className="inline-flex items-center gap-2 font-mono text-xs">
                <MapPin className="size-3.5" /> <LocalTime /> in Bengaluru <AvailabilityHint />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name}. Designed and built in Bengaluru.
        </p>
        <div className="flex items-center gap-5">
          <span className="font-mono text-xs">
            {formatTenure(monthsSince("2022-10"))} of shipping
          </span>
          <a href="#top" className="inline-flex items-center gap-1.5 transition hover:text-fg">
            Back to top <ArrowUp className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
