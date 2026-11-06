import { Fragment } from "react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ArrowRight, ArrowUp, ArrowUpRight, Download, GraduationCap, Heart, Mail, MapPin } from "lucide-react";
import { AvailabilityHint, CopyEmailButton, LocalTime } from "@/components/bits";
import { CommandPalette } from "@/components/command-palette";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { ProjectGrid } from "@/components/work";
import { SkillsExplorer } from "@/components/skills";
import { CountUp, StackDeck } from "@/components/scroll";
import { ExperienceJourney, type JourneyStep } from "@/components/experience-globe";
import { caseStudies, education, experience, formatMonth, formatTenure, impact, monthsSince, profile } from "@/lib/data";
import { getGitHubSnapshot, type GitHubSnapshot } from "@/lib/github";
import { getPhotos, type Photo } from "@/lib/photos";
import { getChannels, type Channel } from "@/lib/youtube";
import { ChannelShelf } from "@/components/youtube";

export const revalidate = 3600;

const hasResume = existsSync(join(process.cwd(), "public", profile.resume.slice(1)));
const resumeFile = "Sagar_Eknath_Bangade_Resume.pdf";

export default async function Home() {
  const gh = await getGitHubSnapshot();
  const photo = getPhotos()[0];
  const channels = await getChannels();

  return (
    <>
      <Hero photo={photo} />
      <Work />
      <Experience />
      <Projects />
      <Media shelves={channels} />
      <Skills />
      <About gh={gh} photo={photo} />
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
  revealChildren = true,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  /** Off for sections whose children run their own scroll effects. */
  revealChildren?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-24" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div data-reveal className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="text-accent">{index}</span>
              <span className="sd-line h-px w-8 bg-line-strong" />
              {eyebrow}
            </p>
            <h2 id={`${id}-title`} className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {title}
            </h2>
            {intro && <p className="mt-4 text-pretty text-base text-muted sm:text-lg">{intro}</p>}
          </div>
          {aside}
        </div>
        {revealChildren ? <div data-reveal>{children}</div> : children}
      </div>
    </section>
  );
}

function ResumeButton({ variant = "primary", label = "Download resume" }: { variant?: "primary" | "ghost"; label?: string }) {
  if (!hasResume) return null;
  return (
    <a
      href={profile.resume}
      download={resumeFile}
      data-testid={variant === "primary" ? "cta-resume" : undefined}
      className={
        variant === "primary"
          ? "group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-[#0a0a0b] transition hover:brightness-110"
          : "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition hover:border-fg"
      }
    >
      <Download className="size-4 transition group-hover:translate-y-0.5" /> {label}
      <span className="sr-only">(PDF)</span>
    </a>
  );
}

function Hero({ photo }: { photo?: Photo }) {
  return (
    <section id="top" className="sd-hero noise relative overflow-hidden" aria-label="Introduction">
      <div aria-hidden className="sd-hero-grid bg-grid absolute inset-0 -z-10" />
      <div aria-hidden className="sd-hero-glow glow absolute -top-48 left-1/2 -z-10 h-[560px] w-[900px] max-w-[160vw] -translate-x-1/2" />

      <div className="sd-hero-out mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <div className="fade-up flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elev/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="ping-soft absolute inline-flex size-full rounded-full bg-ok" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            Open to full-stack roles
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elev/70 px-3 py-1.5 text-xs text-muted backdrop-blur">
            <MapPin className="size-3.5" /> {profile.location}
          </span>
        </div>

        <h1 className="fade-up mt-8 text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.05em]" style={{ animationDelay: "80ms" }}>
          <span className="sr-only">{profile.name}, {profile.role}</span>
          <span aria-hidden>
            Sagar Eknath
            <br />
            {photo && (
              <span className="relative mr-[0.2em] inline-block h-[0.72em] w-[1.55em] -translate-y-[0.06em] overflow-hidden rounded-full border border-line-strong align-middle shadow-xl shadow-black/30">
                <Image src={photo.src} alt="" fill priority sizes="(min-width: 640px) 260px, 140px" className="object-cover" style={{ objectPosition: photo.position }} />
              </span>
            )}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-accent">Bangade</span>
            <span className="text-accent">.</span>
          </span>
        </h1>

        <div className="fade-up mt-8 max-w-3xl" style={{ animationDelay: "160ms" }}>
          <p className="text-pretty text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            {profile.role}. {profile.headline.replace(/^I build/, "Building")}
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted sm:text-lg">{profile.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ResumeButton />
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-3 text-sm font-medium transition hover:border-fg"
            >
              <Mail className="size-4" /> Get in touch
            </a>
            <a
              href="#work"
              data-testid="cta-work"
              className="group inline-flex items-center gap-1.5 px-2 py-3 text-sm text-muted transition hover:text-fg"
            >
              See my work <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4" data-testid="hero-stats">
          {impact.map((s, i) => (
            <div key={s.label} className="fade-up flex flex-col-reverse bg-bg/80 p-5 backdrop-blur sm:p-6" style={{ animationDelay: `${260 + i * 70}ms` }}>
              <dt className="mt-1.5 text-pretty text-xs leading-snug text-muted sm:text-sm">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Work() {
  return (
    <Section
      id="work"
      index="01"
      eyebrow="Selected work"
      title="Production systems I've built"
      intro="Client work at InspironLabs for US healthcare, US e-learning and FMCG companies. Code is private, so here's what I did and why it mattered."
      revealChildren={false}
    >
      <StackDeck>
        {caseStudies.map((c, i) => (
          <li
            key={c.id}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
            className="mb-4 last:mb-0 deck:sticky deck:top-[calc(6.5rem+var(--i)*1.5rem)] deck:mb-[16vh]"
          >
            <article
              data-spotlight
              aria-labelledby={`case-${c.id}`}
              className="relative grid origin-top gap-8 overflow-hidden rounded-2xl border border-line bg-elev p-6 shadow-2xl shadow-black/25 sm:p-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-bg" style={{ opacity: "calc(var(--dim, 0) * 0.55)" }} />
              <div>
                <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-subtle">
                  <span className="text-accent">0{i + 1}</span> {c.client}
                </p>
                <h3 id={`case-${c.id}`} className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  {c.name}
                </h3>
                <p className="mt-3 text-pretty text-base leading-relaxed text-fg/85">{c.headline}</p>
                <ul className="mt-5 space-y-2.5">
                  {c.points.map((d) => (
                    <li key={d} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                      <ArrowRight className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                      <span className="text-pretty">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-between gap-6 lg:border-l lg:border-line lg:pl-10">
                <div>
                  <p className="text-5xl font-semibold tracking-tight text-accent sm:text-6xl">{c.metric.value}</p>
                  <p className="mt-2 text-sm text-muted">{c.metric.label}</p>
                </div>
                <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
                  {c.stack.map((s) => (
                    <li key={s} className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </StackDeck>
    </Section>
  );
}

function Experience() {
  const total = monthsSince(experience[experience.length - 1].start);
  // Oldest first, so scrolling tells the story from the first internship to the current role.
  const steps: JourneyStep[] = [...experience].reverse().map((job) => ({
    id: job.id,
    role: job.role,
    company: job.company,
    companyFull: job.companyFull,
    location: job.location,
    city: job.geo.city,
    lat: job.geo.lat,
    lon: job.geo.lon,
    period: `${formatMonth(job.start)} – ${job.end ? formatMonth(job.end) : "Present"}`,
    tenure: formatTenure(monthsSince(job.start, job.end)),
    current: job.current,
    summary: job.summary,
    highlights: job.highlights,
    stack: job.stack,
  }));
  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title="Where I've worked"
      intro={`${formatTenure(total)} from Nagpur to Bengaluru, across enterprise Java, applied AI and full-stack product engineering.`}
      aside={<ResumeButton variant="ghost" label="Full resume" />}
      revealChildren={false}
    >
      <ExperienceJourney steps={steps} />
    </Section>
  );
}

function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      eyebrow="Side projects"
      title="Things I build for fun"
      intro="Open-source work outside the day job: AI agents, browser tooling, LLM fine-tuning and full-stack apps."
      revealChildren={false}
      aside={
        <a
          href={`${profile.github}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong px-4 py-2 text-sm transition hover:border-fg md:self-auto"
        >
          <GitHubIcon className="size-4" /> All repositories <ArrowUpRight className="size-4" />
        </a>
      }
    >
      <ProjectGrid />
    </Section>
  );
}

function Media({ shelves }: { shelves: Channel[] }) {
  const yt = profile.youtube;
  const channels = [
    { label: "Vlogs", desc: "Life, travel and behind the scenes", href: yt.vlogs },
    { label: "GameOS by Sagar", desc: "Gaming streams and play-throughs", href: yt.gaming },
  ].filter(() => shelves.length === 0);
  return (
    <Section id="media" index="04" eyebrow="YouTube" title="Podcast, vlogs and gaming" intro="When I'm not coding: a podcast on building software, plus my vlog and gaming channels.">
      <div className={`grid gap-4 ${channels.length ? "lg:grid-cols-[1.6fr_1fr]" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-line bg-elev">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt.podcast}`}
              title="Podcast episode with Sagar Bangade"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
          <p className="px-5 py-3.5 text-sm text-muted">
            <span className="text-fg">Podcast</span> · a conversation about building software and my path into it
          </p>
        </div>
        {channels.length > 0 && (
          <ul className="grid gap-3">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  data-spotlight
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-line bg-elev p-5 transition hover:border-line-strong"
                >
                  <span>
                    <span className="block font-medium">{c.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{c.desc}</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-subtle transition group-hover:text-accent" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {shelves.length > 0 && (
        <div className="mt-4 grid gap-4">
          {shelves.map((c) => (
            <ChannelShelf key={c.id} channel={c} />
          ))}
        </div>
      )}
    </Section>
  );
}

function Skills() {
  return (
    <Section
      id="skills"
      index="05"
      eyebrow="Skills"
      title="Tools I ship with"
      intro="The core stack first, then everything else on my resume. Pick any skill to see exactly where I've used it."
      revealChildren={false}
    >
      <SkillsExplorer />
    </Section>
  );
}

function About({ gh, photo }: { gh: GitHubSnapshot; photo?: Photo }) {
  return (
    <Section id="about" index="06" eyebrow="About" title="A bit about me">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        {photo && (
          <figure className="sd-parallax group relative mx-auto w-full max-w-sm self-start lg:max-w-none" style={{ "--par": "36px" } as React.CSSProperties}>
            <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[28px] border border-accent/40 bg-accent-soft transition duration-500 group-hover:rotate-6" />
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-line-strong shadow-2xl shadow-black/30">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-cover"
                style={{ objectPosition: photo.position }}
              />
            </div>
            <figcaption className="absolute -bottom-4 left-5 rounded-full border border-line-strong bg-elev px-3 py-1.5 font-mono text-[11px] text-muted shadow-lg">
              <span className="text-accent">●</span> {photo.caption}
            </figcaption>
          </figure>
        )}

        <div>
          <ReadAlong
            className="space-y-5 text-pretty text-lg leading-relaxed text-muted"
            paragraphs={[
              {
                className: "text-fg",
                text: "I’m Sagar, a full-stack engineer from Nagpur, now working in Bengaluru. I like taking big, tangled applications and making them fast, stable and easy for other engineers to work in.",
              },
              {
                text: "I started on enterprise Java at Asterisc, moved into AI during my B.Tech in Artificial Intelligence, shipping LLM chatbot features at ImmverseAI, and now build full-stack products at InspironLabs, from React frontends to serverless backends and RAG pipelines.",
              },
              { text: "Outside work I build open-source tools, talk tech on podcasts, and run a vlog and a gaming channel on YouTube." },
            ]}
          />

          <figure className="mt-8 border-l-2 border-accent pl-5">
            <blockquote lang="ja" className="font-serif text-2xl italic leading-snug text-fg/90">
              諦めないのが俺の忍道だ
            </blockquote>
            <figcaption className="mt-1 text-sm text-subtle">&ldquo;Not giving up is my ninja way.&rdquo; The motto I work by.</figcaption>
          </figure>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <LinkCard href={profile.github} icon={<GitHubIcon className="size-4" />} title="GitHub" desc={`${gh.publicRepos} public repos · coding since ${gh.since}`} />
            <LinkCard href={profile.sponsors} icon={<Heart className="size-4" />} title="Sponsor my open source" desc="GitHub Sponsors" />
          </div>

          <h3 className="mt-12 flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="size-4 text-accent" /> Education
          </h3>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-elev">
            {education.map((e) => (
              <li key={e.title} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-fg">{e.title}</p>
                  <p className="text-sm text-muted">
                    {e.school}, {e.location}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs text-subtle sm:text-right">
                  {e.period} · {e.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/** Paragraphs whose words brighten one after another as the block scrolls through the viewport. */
function ReadAlong({ paragraphs, className }: { paragraphs: { text: string; className?: string }[]; className?: string }) {
  const total = paragraphs.reduce((n, p) => n + p.text.split(" ").length, 0);
  let k = 0;
  return (
    <div className={`sd-read ${className ?? ""}`}>
      {paragraphs.map((p) => (
        <p key={p.text} className={p.className}>
          {p.text.split(" ").map((word, j) => {
            const start = 10 + (k++ / total) * 38;
            return (
              <Fragment key={j}>
                <span className="sd-word" style={{ "--s": `${start.toFixed(1)}%`, "--e": `${(start + 6).toFixed(1)}%` } as React.CSSProperties}>
                  {word}
                </span>{" "}
              </Fragment>
            );
          })}
        </p>
      ))}
    </div>
  );
}

function LinkCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-line bg-elev p-4 transition hover:border-line-strong"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted group-hover:text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted">{desc}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-subtle transition group-hover:text-fg" />
    </a>
  );
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div data-reveal className="noise relative overflow-hidden rounded-3xl border border-line bg-elev px-6 py-14 sm:px-12 sm:py-20">
          <div aria-hidden className="bg-grid absolute inset-0" />
          <div aria-hidden className="sd-glow-rise glow absolute -bottom-40 left-1/2 h-[420px] w-[720px] max-w-[150vw] -translate-x-1/2" />
          <div className="relative">
            <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-subtle">
              <span className="text-accent">07</span>
              <span className="h-px w-8 bg-line-strong" />
              Contact
            </p>
            <h2 id="contact-title" className="sd-zoom mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Let&apos;s build something <span className="font-serif font-normal italic text-accent">together</span>.
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
              Hiring for a full-stack, React or Next.js role, or have a project in mind? Email me. I reply to everything.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0b] transition hover:brightness-110"
              >
                <Mail className="size-4" /> Email me
              </a>
              <ResumeButton variant="ghost" />
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
          © {new Date().getFullYear()} {profile.name} · {profile.role}, Bengaluru
        </p>
        <a href="#top" className="inline-flex items-center gap-1.5 transition hover:text-fg">
          Back to top <ArrowUp className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
