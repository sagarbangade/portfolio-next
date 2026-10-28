import { ReticleDev } from "./reticle-dev";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { EmailCopiedToast } from "@/components/bits";
import { Effects } from "@/components/effects";
import { Nav } from "@/components/nav";
import { profile } from "@/lib/data";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const description = `${profile.role} at ${profile.company} in Bengaluru. React, Next.js, Node.js and AWS: micro-frontends, design systems and serverless.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} · ${profile.role}`, template: `%s · ${profile.shortName}` },
  description,
  applicationName: `${profile.shortName} Portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  keywords: ["Sagar Bangade", "Full Stack Engineer", "React", "Next.js", "Micro-frontends", "Node.js", "AWS", "Bengaluru", "InspironLabs"],
  openGraph: {
    type: "profile",
    title: `${profile.name} · ${profile.role}`,
    description,
    url: "/",
    siteName: profile.shortName,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: `${profile.name} · ${profile.role}`, description },
  alternates: { canonical: "/" },
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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  worksFor: { "@type": "Organization", name: "InspironLabs Pvt. Ltd." },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "G. H. Raisoni Institute of Engineering and Technology" },
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: ["React", "Next.js", "Node.js", "AWS Lambda", "Micro-frontends", "Storybook", "TypeScript"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        {process.env.NODE_ENV === "development" ? <ReticleDev /> : null}
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Effects />
        <Nav />
        <main>{children}</main>
        <EmailCopiedToast />
      </body>
    </html>
  );
}
