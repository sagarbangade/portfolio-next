export const profile = {
  name: "Sagar Eknath Bangade",
  shortName: "Sagar Bangade",
  role: "Full Stack Software Engineer",
  company: "InspironLabs",
  location: "Bengaluru, India",
  timezone: "Asia/Kolkata",
  email: "sagar.bangade.dev@gmail.com",
  github: "https://github.com/sagarbangade",
  githubUser: "sagarbangade",
  linkedin: "https://linkedin.com/in/sagar-bangade",
  resume: "/Sagar_Eknath_Bangade_Resume.pdf",
  sponsors: "https://github.com/sponsors/sagarbangade",
  youtube: {
    podcast: "hxM5Ot0G8zE",
    vlogs: "https://www.youtube.com/channel/UCd93GgRkwFrNJjROYdWSu2w",
    gaming: "https://www.youtube.com/@GameOSbySagar",
  },
  headline: "I build fast, scalable web products with React, Next.js, Node.js and AWS.",
  tagline:
    "Software Engineer at InspironLabs, Bengaluru. I modernise large React codebases, split monoliths into micro-frontends and microservices, run serverless backends at scale, and ship production RAG / LLM features.",
  summary:
    "Full Stack Software Engineer with about two years of experience, including internships, shipping enterprise web applications for US healthcare, e-learning and FMCG clients.",
};

export const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "media", label: "YouTube" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

/** Headline numbers for the hero. Every one of them is on the resume. */
export const impact = [
  { value: "1,100+", label: "AWS Lambda functions engineered and maintained" },
  { value: "16 → 19", label: "React upgrade led on a US healthcare platform" },
  { value: "+22%", label: "user engagement from GenAI chatbot features" },
  { value: "−15%", label: "UAT defects after refactoring shared modules" },
];

export type CaseStudy = {
  id: string;
  name: string;
  client: string;
  headline: string;
  /** Industry, used to pick the card's icon. */
  sector: "healthcare" | "elearning" | "fmcg";
  metric: { value: string; label: string };
  /** The before → after of the project, in a few words each. */
  shifts: [string, string][];
  points: string[];
  stack: string[];
};

/** Client work at InspironLabs: the most important things on the page. */
export const caseStudies: CaseStudy[] = [
  {
    id: "healthcare",
    name: "Modernising a US healthcare admin platform",
    client: "US Healthcare · InspironLabs",
    headline:
      "Took a multi-branch React 16 application to React 19, then broke the monolith apart so teams could ship without stepping on each other.",
    sector: "healthcare",
    metric: { value: "React 19", label: "upgraded from v16" },
    shifts: [
      ["React 16", "React 19"],
      ["Monolith", "Micro-frontends + microservices"],
      ["One-off UI", "Shared MUI + Storybook library"],
    ],
    points: [
      "Led the React 16 → 19 upgrade and cleared a deep backlog of legacy defects along the way.",
      "Improved load performance with route-level code splitting.",
      "Split the monolith into micro-frontends with Module Federation and moved backend logic into separate microservices, so one failure no longer cascades.",
      "Built and documented a shared MUI + Storybook component library with common design tokens, used across several squads.",
    ],
    stack: ["React 19", "TypeScript", "Module Federation", "Microservices", "Material UI", "Storybook", "Redux"],
  },
  {
    id: "elearning",
    name: "Serverless backend and payments for a US e-learning platform",
    client: "US E-Learning · InspironLabs",
    headline:
      "Kept a large learning platform responsive by moving heavy work into a serverless backend, and built the payment and subscription stack.",
    sector: "elearning",
    metric: { value: "1,100+", label: "AWS Lambda functions" },
    shifts: [
      ["Heavy jobs in the app", "Serverless background work"],
      ["No subscriptions", "Stripe + RevenueCat billing"],
      ["Scattered logs", "OpenSearch + Kibana monitoring"],
    ],
    points: [
      "Engineered and maintained a serverless backend of 1,100+ AWS Lambda functions that run background jobs without slowing the core app.",
      "Built the Next.js payment service on Stripe and integrated RevenueCat for subscriptions on my own.",
      "Set up AWS OpenSearch with Kibana for log monitoring, plus automated email workflows.",
    ],
    stack: ["Next.js", "Node.js", "Python", "AWS Lambda", "Stripe", "RevenueCat", "OpenSearch", "Kibana"],
  },
  {
    id: "rag",
    name: "Enterprise AI knowledge base for an FMCG company",
    client: "FMCG · InspironLabs",
    headline:
      "Designed the data side of a RAG system so the LLM answers from reviewed, well-structured company knowledge instead of guessing.",
    sector: "fmcg",
    metric: { value: "RAG", label: "with human-in-the-loop review" },
    shifts: [
      ["Raw documents", "Human-reviewed knowledge"],
      ["Free-form text", "Structured retrieval entities"],
      ["LLM guesses", "Grounded answers"],
    ],
    points: [
      "Architected human-in-the-loop portals for ingesting and reviewing source data before it reaches the model.",
      "Modelled the relational database entities used for retrieval, giving grounded, context-rich LLM responses.",
    ],
    stack: ["RAG", "LLM APIs", "Python", "PostgreSQL", "React", "Next.js"],
  },
];

export type Experience = {
  id: string;
  role: string;
  company: string;
  companyFull: string;
  location: string;
  /** City shown on the experience globe, with its coordinates in degrees. */
  geo: { city: string; lat: number; lon: number };
  start: string;
  end: string | null;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    id: "inspironlabs",
    role: "Software Engineer",
    company: "InspironLabs",
    companyFull: "InspironLabs Pvt. Ltd.",
    location: "Bengaluru, India",
    geo: { city: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    start: "2025-04",
    end: null,
    current: true,
    summary:
      "Full-stack features for enterprise clients across healthcare, e-learning and FMCG: React, Next.js, TypeScript, MUI and Redux on the frontend, Node.js/Express and Python REST APIs behind them.",
    highlights: [
      "Led a React 16 → 19 upgrade and split a monolith into micro-frontends (Module Federation) and microservices.",
      "Engineered and maintained 1,100+ AWS Lambda functions for asynchronous background work.",
      "Built a Next.js payment service on Stripe and integrated RevenueCat subscriptions, OpenSearch and Kibana monitoring.",
      "Architected data ingestion and review portals for an enterprise RAG knowledge base.",
      "Created a shared MUI + Storybook component library adopted by multiple squads.",
    ],
    stack: ["React", "Next.js", "TypeScript", "Redux", "MUI", "Storybook", "Node.js", "Python", "AWS Lambda", "Stripe"],
  },
  {
    id: "immverseai",
    role: "AI/ML Intern",
    company: "ImmverseAI",
    companyFull: "ImmverseAI Innovations Pvt. Ltd.",
    location: "Nagpur, India",
    geo: { city: "Nagpur", lat: 21.1458, lon: 79.0882 },
    start: "2023-12",
    end: "2024-06",
    summary: "Prototyped and shipped GenAI features on top of hosted LLM APIs.",
    highlights: [
      "Shipped production GenAI / LLM chatbot features that lifted user engagement by 22%.",
      "Wired LLM calls into the existing backend with structured prompts, token optimisation and resilient fallbacks.",
      "Benchmarked new models and developer tools every sprint and wrote short reports that shaped the roadmap.",
    ],
    stack: ["Python", "LLM APIs", "Prompt engineering", "REST APIs"],
  },
  {
    id: "asterisc",
    role: "Full Stack Java Developer Intern",
    company: "Asterisc Technocrat",
    companyFull: "Asterisc Technocrat Pvt. Ltd.",
    location: "Nagpur, India",
    geo: { city: "Nagpur", lat: 21.1458, lon: 79.0882 },
    start: "2022-10",
    end: "2023-12",
    summary: "End-to-end feature work on enterprise Java applications, from SQL schema to production deploy.",
    highlights: [
      "Built modular features with JSP, Servlets and Hibernate, and refactored shared logic into reusable modules, cutting UAT defects by 15%.",
      "Owned tickets end to end: schema changes, backend controllers, frontend views and production deployments.",
    ],
    stack: ["Java", "JSP", "Servlets", "Hibernate", "SQL"],
  },
];

export type Project = {
  name: string;
  blurb: string;
  stack: string[];
  repo?: string;
  live?: string;
  liveLabel?: string;
  year: number;
};

const gh = (repo: string) => `https://github.com/sagarbangade/${repo}`;

/** Side projects, best first. */
export const projects: Project[] = [
  {
    name: "BusinessForge AI Agent",
    blurb:
      "AI lead-generation agent: finds local businesses, audits their web presence (SSL, mobile, SEO, uptime), scores how much they need help and drafts a tailored cold email with Gemini.",
    stack: ["React 19", "TypeScript", "Gemini", "Tailwind", "Leaflet"],
    repo: gh("BusinessForge-AI-Agent"),
    year: 2026,
  },
  {
    name: "Lumina",
    blurb:
      "D2C storefront with AI virtual try-on. Catalog, cart, auth and checkout on Firebase, with Gemini rendering products on the shopper.",
    stack: ["React 19", "Firebase", "Gemini", "Cloudinary", "Zustand"],
    repo: gh("e-commerce-react-js"),
    year: 2026,
  },
  {
    name: "AI Website Exporter",
    blurb:
      "Chrome extension (Manifest V3) that exports any tab as one ZIP: network log, HAR, scripts, CSS, storage, a full-page screenshot and an offline copy that still renders.",
    stack: ["Chrome MV3", "JavaScript", "DevTools Protocol"],
    repo: gh("web-page-cloner-chrome-extension"),
    year: 2026,
  },
  {
    name: "Fine-tuning LLMs on a 6 GB GPU",
    blurb:
      "Practical guide to fine-tuning Qwen2.5-0.5B on an RTX 4050 laptop: VRAM tricks, real benchmarks and a live FastAPI training dashboard.",
    stack: ["Python", "Hugging Face", "FastAPI", "SSE"],
    repo: gh("soup-finetune-guide"),
    year: 2026,
  },
  {
    name: "EquiShare",
    blurb:
      "Group expense splitting with AES-encrypted chat and settlements reduced to the fewest possible payments.",
    stack: ["React", "TypeScript", "Firebase", "Tailwind"],
    repo: gh("EquiShare-collaborative-expense-sharing"),
    year: 2026,
  },
  {
    name: "FoodieAI",
    blurb:
      "Voice-first food assistant: ask Gemini, get the top five nearby restaurants from Google Maps, filter by diet and hear the answer read back.",
    stack: ["React", "Gemini", "Google Maps", "Speech APIs"],
    repo: gh("FoodieAI"),
    live: "https://foodie-ai-beta.vercel.app",
    year: 2025,
  },
];

export const skills: { id: string; label: string; items: string[] }[] = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["React (v16–19)", "Next.js", "TypeScript", "Redux", "Material UI", "Storybook", "Tailwind CSS", "Micro-frontends (Module Federation)"],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    items: ["Node.js", "Express.js", "FastAPI", "Django", "Laravel", "REST API design", "Microservices", "Serverless"],
  },
  {
    id: "ai",
    label: "AI & LLM",
    items: ["LLM APIs", "RAG architecture", "GenAI workflows", "Agentic pipelines", "Prompt engineering", "PyTorch", "TensorFlow"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    items: ["AWS Lambda", "S3", "EC2", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
  },
  {
    id: "data",
    label: "Databases & search",
    items: ["PostgreSQL", "MySQL", "MongoDB", "AWS OpenSearch", "Kibana"],
  },
  {
    id: "languages",
    label: "Languages & testing",
    items: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "PHP", "SQL", "Jest", "Cypress"],
  },
];

/** The headline tools, each with one line of proof taken from the resume. `skill` names the matching entry in `skills`. */
export const coreStack: { id: "react" | "nextjs" | "typescript" | "nodejs" | "aws" | "python"; name: string; skill: string; proof: string }[] = [
  { id: "react", name: "React", skill: "React (v16–19)", proof: "Led a React 16 → 19 upgrade on a US healthcare platform" },
  { id: "nextjs", name: "Next.js", skill: "Next.js", proof: "Built the Stripe + RevenueCat payment service" },
  { id: "typescript", name: "TypeScript", skill: "TypeScript", proof: "Everyday language across client frontends" },
  { id: "nodejs", name: "Node.js", skill: "Node.js", proof: "REST APIs and microservices for enterprise apps" },
  { id: "aws", name: "AWS", skill: "AWS Lambda", proof: "1,100+ Lambda functions running background jobs" },
  { id: "python", name: "Python", skill: "Python", proof: "REST APIs, RAG retrieval and LLM features" },
];

/**
 * What the education panel shows for each school. Real photos only where one of the actual campus
 * exists; otherwise the institute's own logo, or a typographic card. Never a stand-in building.
 */
export type EducationVisual =
  | {
      type: "photo";
      src: string;
      alt: string;
      caption: string;
      /** CSS object-position, to keep the key detail (a sign, an entrance) in frame when cropped. */
      position?: string;
      /** Only for photos that aren't Sagar's own. */
      credit?: { label: string; url: string };
    }
  | { type: "brand"; mark: string; logo?: string; color: string }
  | { type: "remote" };

export type Education = {
  id: string;
  kind: "degree" | "diploma" | "course";
  title: string;
  school: string;
  location: string;
  period: string;
  note: string;
  summary: string;
  /** Board or university the qualification is from. */
  awardedBy: string;
  /** How long it ran for Sagar, and how (lateral entry, online, part-time). */
  format: string;
  /** What the program covers, per the institute's own published material. */
  topics: string[];
  link?: { label: string; url: string };
  visual: EducationVisual;
};

/** Oldest first: the order the scroll story plays in. */
export const education: Education[] = [
  {
    id: "diploma",
    kind: "diploma",
    title: "Diploma in Computer Engineering",
    school: "Nagpur Institute of Technology Polytechnic",
    location: "Nagpur",
    period: "2019 – 2021",
    note: "87.40%",
    summary: "Where it started. A full computer engineering diploma under the state technical board, finished with 87.40%.",
    awardedBy: "MSBTE · Maharashtra State Board of Technical Education",
    format: "Full-time · Mahurzari campus, Katol Road",
    topics: ["C & C++", "Java", "Python", "Data structures", "DBMS", "Operating systems", "Computer networks", "Web development"],
    link: { label: "NIT Group", url: "https://nit.edu.in/nit-group/" },
    visual: {
      type: "photo",
      src: "/education/nit-campus.jpg",
      alt: "The NIT Campus entrance arch in Mahurzari, Nagpur, with the college building behind the trees",
      caption: "NIT Campus, Mahurzari, Nagpur",
      credit: { label: "Nagpur Institute of Technology", url: "https://nit.edu.in/about-us/" },
    },
  },
  {
    id: "jetking",
    kind: "course",
    title: "Diploma in Network Administration",
    school: "Jetking",
    location: "Nagpur",
    period: "2020 – 2022",
    note: "Course",
    summary: "Hands-on networking and systems administration, taken alongside the computer engineering diploma.",
    awardedBy: "Jetking Infotrain",
    format: "Classroom course · Nagpur Learning Center",
    topics: ["Computer hardware", "Networking fundamentals", "Routing & switching", "Server administration", "Network security"],
    link: { label: "Jetking", url: "https://www.jetking.com/" },
    visual: {
      type: "photo",
      src: "/photos/jetking.webp",
      alt: "Sai Sagar Plaza in Nagpur with the Jetking Nagpur Learning Center banner on the first floor",
      caption: "Jetking Nagpur Learning Center",
      position: "50% 45%",
    },
  },
  {
    id: "btech",
    kind: "degree",
    title: "B.Tech in Artificial Intelligence",
    school: "G. H. Raisoni Institute of Engineering and Technology",
    location: "Nagpur",
    period: "2021 – 2024",
    note: "CGPA 7.78 / 10",
    summary: "Joined straight into second year after the diploma. Focused on machine learning and computer vision, and built IntelliCrack, crack detection for civil structures, as a project here.",
    awardedBy: "RTMNU · Rashtrasant Tukadoji Maharaj Nagpur University",
    format: "Full-time · Direct second-year entry",
    topics: ["Python", "Machine learning", "Deep learning", "Computer vision", "TensorFlow", "Data science"],
    link: { label: "IntelliCrack on GitHub", url: "https://github.com/sagarbangade/IntelliCrack" },
    visual: {
      type: "photo",
      src: "/education/ghr-campus.jpg",
      alt: "The G. H. Raisoni campus building in Nagpur with its curved glass front",
      caption: "G. H. Raisoni campus, Nagpur",
      position: "45% 50%",
    },
  },
  {
    id: "masai",
    kind: "course",
    title: "Full-Stack Web Development (MERN)",
    school: "Masai School",
    location: "Remote",
    period: "2024 – 2025",
    note: "Course",
    summary: "Masai’s full-stack program on the MERN stack, with daily DSA practice and their industry accreditation round. Done fully remote.",
    awardedBy: "Masai School",
    format: "Online · Remote",
    topics: ["HTML, CSS & JavaScript", "React + Redux", "Node.js", "Express", "MongoDB", "DSA"],
    link: { label: "About the course", url: "https://www.masaischool.com/blog/masai-full-stack-developer-course" },
    visual: {
      type: "photo",
      src: "/photos/masai-school.webp",
      alt: "The entrance of the Masai School office with the masai sign above the glass doors",
      caption: "Masai School",
      position: "50% 62%",
    },
  },
];

/** Whole months between a YYYY-MM start and today (or an end month, inclusive). */
export function monthsSince(start: string, end?: string | null) {
  const [sy, sm] = start.split("-").map(Number);
  const to = end ? new Date(`${end}-01T00:00:00Z`) : new Date();
  return (to.getUTCFullYear() - sy) * 12 + (to.getUTCMonth() + 1 - sm) + (end ? 1 : 0);
}

export function formatTenure(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ") || "1 mo";
}

export function formatMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
