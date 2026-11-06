import { ReticleDev } from "./reticle-dev";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { EmailCopiedToast } from "@/components/bits";
import { Effects } from "@/components/effects";
import { Nav } from "@/components/nav";
import { education, profile, projects, skills } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });

// Kept under ~60 characters so Google shows it in full; the name comes first because that's what people search.
const title = `${profile.shortName} | Full Stack Software Engineer, Bengaluru`;
const description =
  "Sagar Bangade is a Full Stack Software Engineer in Bengaluru building with React, Next.js, Node.js and AWS: micro-frontends, serverless backends and RAG apps.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${profile.shortName}` },
  description,
  applicationName: `${profile.shortName} Portfolio`,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    "Sagar Bangade",
    "Sagar Eknath Bangade",
    "Full Stack Software Engineer",
    "Full Stack Developer Bengaluru",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Node.js",
    "AWS Lambda",
    "Serverless",
    "Micro-frontends",
    "Module Federation",
    "RAG",
    "LLM",
    "Software Engineer Bangalore",
    "Full Stack Developer India",
    "React Developer Bangalore",
    "Next.js Developer India",
    "Sagar Bangade portfolio",
    "Sagar Bangade resume",
    "InspironLabs",
  ],
  category: "technology",
  publisher: profile.name,
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "profile",
    firstName: "Sagar",
    lastName: "Bangade",
    username: profile.githubUser,
    title,
    description,
    url: "/",
    siteName: profile.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
  appleWebApp: { title: profile.shortName, statusBarStyle: "black-translucent" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  ],
  colorScheme: "dark light",
};

// Runs before paint: picks the saved or system theme and marks JS as available so reveal animations can hide content safely.
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})()`;

const resumeUrl = `${siteUrl}${profile.resume}`;

const person = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: profile.name,
  alternateName: [profile.shortName, "Sagar"],
  givenName: "Sagar",
  additionalName: "Eknath",
  familyName: "Bangade",
  jobTitle: profile.role,
  description: profile.summary,
  image: { "@type": "ImageObject", url: `${siteUrl}/photos/desk.jpg`, caption: profile.name },
  url: siteUrl,
  email: `mailto:${profile.email}`,
  nationality: { "@type": "Country", name: "India" },
  worksFor: { "@type": "Organization", name: "InspironLabs Pvt. Ltd.", address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" } },
  homeLocation: { "@type": "Place", name: "Bengaluru, India" },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  hasOccupation: {
    "@type": "Occupation",
    name: profile.role,
    occupationLocation: { "@type": "City", name: "Bengaluru" },
    skills: skills.flatMap((g) => g.items).join(", "),
  },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "G. H. Raisoni Institute of Engineering and Technology", address: "Nagpur, India" },
    { "@type": "EducationalOrganization", name: "Nagpur Institute of Technology Polytechnic", address: "Nagpur, India" },
  ],
  hasCredential: education.slice(0, 2).map((e) => ({
    "@type": "EducationalOccupationalCredential",
    credentialCategory: e.title.startsWith("B.Tech") ? "degree" : "diploma",
    name: e.title,
    recognizedBy: { "@type": "EducationalOrganization", name: e.school },
  })),
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Python", "AWS Lambda", "Serverless architecture", "Micro-frontends", "Module Federation", "Microservices", "RAG", "Large language models", "Storybook", "Stripe"],
  sameAs: [profile.github, profile.linkedin, profile.youtube.vlogs, profile.youtube.gaming],
  subjectOf: { "@type": "DigitalDocument", name: `${profile.name} resume`, url: resumeUrl, encodingFormat: "application/pdf" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#page`,
      url: siteUrl,
      name: title,
      description,
      inLanguage: "en-IN",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#person` },
      primaryImageOfPage: { "@type": "ImageObject", url: `${siteUrl}/opengraph-image` },
      dateModified: new Date().toISOString(),
    },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: profile.name, inLanguage: "en-IN", publisher: { "@id": `${siteUrl}/#person` } },
    person,
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#projects`,
      name: `Open-source projects by ${profile.name}`,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: p.name,
          description: p.blurb,
          codeRepository: p.repo,
          ...(p.live ? { url: p.live } : {}),
          keywords: p.stack.join(", "),
          dateCreated: String(p.year),
          author: { "@id": `${siteUrl}/#person` },
        },
      })),
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="me" href={profile.github} />
        <link rel="me" href={profile.linkedin} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        {process.env.NODE_ENV === "development" ? <ReticleDev /> : null}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Effects />
        <Nav />
        <main id="main">{children}</main>
        <EmailCopiedToast />
      </body>
    </html>
  );
}
