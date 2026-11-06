import { Fragment } from "react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ArrowRight, ArrowUp, ArrowUpRight, BrainCircuit, Download, GraduationCap, HeartPulse, Mail, MapPin } from "lucide-react";
import { AvailabilityHint, CopyEmailButton, LocalTime } from "@/components/bits";
import { CommandPalette } from "@/components/command-palette";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { ProjectGrid } from "@/components/work";
import { SkillsExplorer } from "@/components/skills";
import { CountUp, StackDeck } from "@/components/scroll";
import { EducationJourney } from "@/components/education-journey";
import { ExperienceJourney, type JourneyStep } from "@/components/experience-globe";
import { caseStudies, education, experience, formatMonth, formatTenure, impact, monthsSince, profile } from "@/lib/data";
import { getHeroPhoto, type Photo } from "@/lib/photos";
import { getChannels, type Channel } from "@/lib/youtube";
import { ChannelShelf } from "@/components/youtube";

export const revalidate = 3600;

const hasResume = existsSync(join(process.cwd(), "public", profile.resume.slice(1)));
const resumeFile = "Sagar_Eknath_Bangade_Resume.pdf";

export default async function Home() {
  const photo = getHeroPhoto();
  const channels = await getChannels();

  return (
    <>
      <Hero photo={photo} />
      <Work />
      <Experience />
      <Projects />
      <Skills />
      <EducationSection />
      <Media shelves={channels} />
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
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-6">
          <div className="min-w-0">
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

            <h1
              className="fade-up mt-8 text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.05em] lg:text-[clamp(4rem,6.4vw,6rem)]"
              style={{ animationDelay: "80ms" }}
            >
              <span className="sr-only">
                {profile.name}, {profile.role}
              </span>
              <span aria-hidden>
                Sagar Eknath
                <br />
                {photo && (
                  <span className="relative mr-[0.2em] inline-block h-[0.72em] w-[1.55em] -translate-y-[0.06em] overflow-hidden rounded-full border border-line-strong align-middle shadow-xl shadow-black/30 lg:hidden">
                    <Image src={photo.src} alt="" fill priority sizes="(min-width: 640px) 260px, 140px" className="object-cover" style={{ objectPosition: photo.position }} />
                  </span>
                )}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-accent">Bangade</span>
                <span className="text-accent">.</span>
              </span>
            </h1>

            <div className="fade-up mt-8 max-w-3xl" style={{ animationDelay: "160ms" }}>
              <p className="text-pretty text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                Full Stack Software Engineer building fast, scalable web products with React, Next.js, Node.js and AWS.
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
          </div>

          {photo && (
            <figure className="fade-up relative mx-auto hidden w-full self-end lg:-mr-10 lg:block lg:w-[115%] xl:-mr-16" style={{ animationDelay: "220ms" }}>
              {/* Frameless: the cut-out portrait sits straight on the page, lit from behind by the accent glow. */}
              <div aria-hidden className="absolute left-1/2 top-[18%] size-[78%] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
              <div aria-hidden className="absolute left-1/2 top-[30%] size-[46%] -translate-x-1/2 rounded-full bg-gold/15 blur-2xl" />
              <div className="relative aspect-[1312/1199] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 0px"
                  className={photo.cutout ? "object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]" : "rounded-[28px] object-cover"}
                  style={photo.cutout ? undefined : { objectPosition: photo.position }}
                />
              </div>
              <figcaption className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-line-strong bg-elev/80 px-3 py-1.5 font-mono text-[11px] text-muted shadow-lg backdrop-blur">
                <span className="relative flex size-2">
                  <span className="ping-soft absolute inline-flex size-full rounded-full bg-ok" />
                  <span className="relative inline-flex size-2 rounded-full bg-ok" />
                </span>
                {photo.caption}
              </figcaption>
            </figure>
          )}
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
              className="relative grid origin-top overflow-hidden rounded-3xl border border-line bg-elev shadow-2xl shadow-black/25 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-bg" style={{ opacity: "calc(var(--dim, 0) * 0.55)" }} />

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
                    <SectorIcon sector={c.sector} />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">
                    <span className="text-accent">Case {String(i + 1).padStart(2, "0")}</span> · {c.client}
                  </span>
                </div>
                <h3 id={`case-${c.id}`} className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-[1.9rem] sm:leading-tight">
                  {c.name}
                </h3>
                <p className="mt-3 text-pretty text-base leading-relaxed text-fg/80">{c.headline}</p>
                <ul className="mt-5 space-y-2">
                  {c.points.map((d) => (
                    <li key={d} className="flex gap-3 text-[14.5px] leading-relaxed text-muted">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="text-pretty">{d}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
                  {c.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex flex-col gap-6 border-t border-line bg-[radial-gradient(120%_80%_at_100%_0%,var(--accent-soft),transparent_60%)] p-6 sm:p-8 lg:border-l lg:border-t-0">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Headline result</p>
                  <p className="mt-2 text-5xl font-semibold tracking-tight text-accent sm:text-6xl">{c.metric.value}</p>
                  <p className="mt-1.5 text-sm text-muted">{c.metric.label}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">What changed</p>
                  <ol className="mt-3 space-y-2.5">
                    {c.shifts.map(([from, to]) => (
                      <li key={from} className="rounded-xl border border-line bg-bg/50 p-3">
                        <span className="block text-xs text-subtle line-through decoration-subtle/50">{from}</span>
                        <span className="mt-1 flex items-start gap-1.5 text-sm font-medium text-fg">
                          <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                          {to}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          </li>
        ))}
      </StackDeck>
    </Section>
  );
}

function SectorIcon({ sector }: { sector: "healthcare" | "elearning" | "fmcg" }) {
  const Icon = sector === "healthcare" ? HeartPulse : sector === "elearning" ? GraduationCap : BrainCircuit;
  return <Icon className="size-5" aria-hidden />;
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
    <Section id="media" index="06" eyebrow="YouTube" title="Podcast, vlogs and gaming" intro="When I'm not coding: a podcast on building software, plus my vlog and gaming channels.">
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
      index="04"
      eyebrow="Skills"
      title="Tools I ship with"
      intro="The core stack first, then everything else on my resume. Pick any skill to see exactly where I've used it."
      revealChildren={false}
    >
      <SkillsExplorer />
    </Section>
  );
}

function EducationSection() {
  return (
    <Section
      id="education"
      index="05"
      eyebrow="Education"
      title="Where I learned"
      intro="From a computer engineering diploma in Nagpur to a B.Tech in AI and a remote full-stack program. Scroll through each one."
      revealChildren={false}
    >
      <EducationJourney items={education} />
    </Section>
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
        <div>
          <p>
            © {new Date().getFullYear()} {profile.name} · {profile.role}, Bengaluru
          </p>
          <p className="mt-1.5 text-xs">
            <span lang="ja" className="font-serif text-sm italic text-fg/80">
              諦めないのが俺の忍道だ
            </span>{" "}
            · Not giving up is my ninja way.
          </p>
        </div>
        <a href="#top" className="inline-flex items-center gap-1.5 transition hover:text-fg">
          Back to top <ArrowUp className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
