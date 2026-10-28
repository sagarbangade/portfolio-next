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
  tagline:
    "I make big applications feel small: splitting monoliths into micro-frontends, cutting bundle sizes, and building component libraries other teams actually want to use.",
  summary:
    "Full Stack Software Engineer building scalable web applications with React, Next.js, Node.js and AWS. I work across frontend architecture, backend development, API design, micro-frontend systems and serverless, and I care about products that are fast, maintainable and pleasant to use.",
  roles: ["React", "Next.js", "Node.js", "AWS Lambda", "Micro-frontends", "Design systems", "LLM apps"],
};

export const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "github", label: "GitHub" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export type Experience = {
  id: string;
  role: string;
  company: string;
  companyFull: string;
  location: string;
  start: string;
  end: string | null;
  current?: boolean;
  summary: string;
  highlights: string[];
  metric?: { value: string; label: string };
  stack: string[];
};

export const experience: Experience[] = [
  {
    id: "inspironlabs",
    role: "Software Engineer",
    company: "InspironLabs",
    companyFull: "InspironLabs Pvt. Ltd.",
    location: "Bengaluru, India",
    start: "2025-04",
    end: null,
    current: true,
    summary:
      "Building enterprise web products end to end: React + MUI frontends on a shared design system, and Node.js, Python, PHP and AWS Lambda services behind them.",
    highlights: [
      "Developed responsive React + MUI applications and improved load times with code splitting and lazy loading.",
      "Built reusable MUI + Storybook components that sped up UI work and kept design consistent across products.",
      "Integrated Redux for predictable, efficient state management across complex screens.",
      "Raised design consistency and accessibility across modules with shared themes and layout patterns.",
      "Implemented APIs and serverless solutions with Node.js, Python, PHP and AWS Lambda for enterprise applications.",
    ],
    metric: { value: "2", label: "platforms re-architected" },
    stack: ["React", "Next.js", "MUI", "Storybook", "Redux", "Module Federation", "Node.js", "Python", "PHP", "AWS Lambda"],
  },
  {
    id: "immverseai",
    role: "AI/ML Intern",
    company: "ImmverseAI",
    companyFull: "ImmverseAI Innovations Pvt. Ltd.",
    location: "Nagpur, India",
    start: "2023-12",
    end: "2024-06",
    summary:
      "Prototyped conversational AI features and researched emerging models to steer the product roadmap.",
    highlights: [
      "Prototyped NLP/LLM chatbot features through API integrations, lifting user engagement by 22%.",
      "Researched new AI models and tools, and turned findings into insights that guided the team's roadmap.",
      "Worked with the dev team to integrate AI models into the existing application architecture.",
    ],
    metric: { value: "+22%", label: "user engagement" },
    stack: ["Python", "NLP", "LLM APIs", "Prompt engineering", "REST APIs"],
  },
  {
    id: "asterisc",
    role: "Full Stack Java Developer Intern",
    company: "Asterisc Technocrat",
    companyFull: "Asterisc Technocrat Pvt. Ltd.",
    location: "Nagpur, India",
    start: "2022-10",
    end: "2023-12",
    summary:
      "Shipped modular enterprise Java applications and learned the full delivery lifecycle from feature design to production.",
    highlights: [
      "Developed modular JSP / Servlet / Hibernate applications, cutting the UAT defect rate by 15%.",
      "Designed and implemented new features with senior developers, aligned with project requirements.",
      "Deployed applications to test and production environments across the full development lifecycle.",
    ],
    metric: { value: "−15%", label: "UAT defect rate" },
    stack: ["Java", "JSP", "Servlets", "Hibernate", "MySQL", "Oracle"],
  },
];

export type ProjectCategory = "ai" | "fullstack" | "frontend" | "mobile" | "tools";

export type Project = {
  name: string;
  blurb: string;
  details?: string[];
  stack: string[];
  categories: ProjectCategory[];
  repo?: string;
  live?: string;
  liveLabel?: string;
  year: number;
  accent?: string;
};

export const featured: (Project & { org: string; tags: string[] })[] = [
  {
    name: "Healthcare Platform 2.0",
    org: "InspironLabs",
    blurb:
      "Migrated a legacy healthcare application to a micro-frontend architecture, so each module scales and deploys on its own.",
    details: [
      "Split the monolith into independently deployable remotes with Webpack Module Federation.",
      "Built and maintained a shared Storybook component library for cross-team design consistency.",
    ],
    tags: ["Micro-frontends", "Design system"],
    stack: ["React", "Next.js", "Module Federation", "Storybook", "Material UI"],
    categories: ["frontend"],
    year: 2025,
  },
  {
    name: "E-Learning Platform",
    org: "InspironLabs",
    blurb:
      "Shipped features for a large-scale e-learning platform while modernizing legacy code across three runtimes.",
    details: [
      "Implemented backend services and AWS Lambda functions in Python, Node.js and PHP.",
      "Contributed to a scalable serverless architecture backed by MySQL.",
    ],
    tags: ["Serverless", "Legacy modernization"],
    stack: ["Node.js", "Python", "PHP", "AWS Lambda", "Serverless", "MySQL"],
    categories: ["fullstack"],
    year: 2025,
  },
];

const gh = (repo: string) => `https://github.com/sagarbangade/${repo}`;

export const projects: Project[] = [
  {
    name: "BusinessForge AI Agent",
    blurb:
      "AI lead-generation agent that finds local businesses, audits their web presence (SSL, mobile, SEO, uptime), scores their tech need and drafts a tailored cold email with Gemini.",
    stack: ["React 19", "TypeScript", "Tailwind 4", "Gemini", "Leaflet", "GSAP"],
    categories: ["ai", "fullstack"],
    repo: gh("BusinessForge-AI-Agent"),
    year: 2026,
  },
  {
    name: "Lumina",
    blurb:
      "Premium D2C storefront with an AI virtual try-on: catalog, cart, auth and checkout on Firebase, with Gemini rendering products on the shopper.",
    stack: ["React 19", "Vite", "Firebase", "Cloudinary", "Gemini", "Zustand"],
    categories: ["ai", "fullstack"],
    repo: gh("e-commerce-react-js"),
    year: 2026,
  },
  {
    name: "AI Website Exporter",
    blurb:
      "Manifest V3 Chrome extension that exports a tab as one ZIP: network log with bodies, HAR, parsed scripts, CSSOM, storage, MHTML, a full-page screenshot, source-map sources and an offline copy that renders.",
    stack: ["Chrome MV3", "JavaScript", "DevTools Protocol", "Offscreen API"],
    categories: ["tools"],
    repo: gh("web-page-cloner-chrome-extension"),
    year: 2026,
  },
  {
    name: "EquiShare",
    blurb:
      "Collaborative expense splitting for trips and groups, with AES-encrypted group chat and settlements simplified down to who owes whom.",
    stack: ["React", "TypeScript", "Tailwind", "Firebase", "Vite"],
    categories: ["fullstack"],
    repo: gh("EquiShare-collaborative-expense-sharing"),
    year: 2026,
  },
  {
    name: "Fine-tuning LLMs on a 6 GB GPU",
    blurb:
      "Field guide to fine-tuning Qwen2.5-0.5B on an RTX 4050 laptop with Soup CLI: VRAM tricks, real benchmarks and a live SSE + FastAPI training dashboard.",
    stack: ["Python", "Hugging Face", "Qwen2.5", "FastAPI", "SSE"],
    categories: ["ai"],
    repo: gh("soup-finetune-guide"),
    year: 2026,
  },
  {
    name: "Athvan Nara",
    blurb:
      "Medicine reminder app for Android with daily, every-N-days and custom schedules, local notifications and jelly-smooth Moti animations.",
    stack: ["React Native", "Expo", "TypeScript", "AsyncStorage", "Moti"],
    categories: ["mobile"],
    repo: gh("reminder-app-rn"),
    live: "https://github.com/sagarbangade/reminder-app-rn/releases/latest",
    liveLabel: "APK",
    year: 2025,
  },
  {
    name: "FoodieAI",
    blurb:
      "Voice-first food assistant: talk to Gemini, get the top 5 nearby restaurants from Google Maps, filter by diet and hear answers back with Cloud TTS.",
    stack: ["React", "Gemini", "Google Maps", "Speech-to-Text", "Text-to-Speech"],
    categories: ["ai", "frontend"],
    repo: gh("FoodieAI"),
    live: "https://foodie-ai-beta.vercel.app",
    year: 2025,
  },
  {
    name: "MoneyMap",
    blurb:
      "Personal finance tracker with expense and income CRUD, budget analytics and JWT-secured accounts, split into React client and Express API.",
    stack: ["MongoDB", "Express", "React", "Node.js", "JWT"],
    categories: ["fullstack"],
    repo: gh("Personal-Finance-Tracker"),
    live: "https://moneymap.skillsfoster.com/",
    year: 2025,
  },
  {
    name: "MediAlert AI",
    blurb:
      "Real-time medical emergency assistant that gives first-aid guidance by chat or voice, with multi-thread conversations and offline speech.",
    stack: ["React", "Gemini", "Web Speech API", "shadcn/ui", "Tailwind"],
    categories: ["ai", "frontend"],
    repo: gh("MediAlert-AI-Assistant"),
    live: "https://medi-alert-ai-assistant.vercel.app",
    year: 2025,
  },
  {
    name: "ShinobiPath",
    blurb:
      "Travel itinerary planner to create, organize and share trips, with maps, an AI chatbot and Firebase auth and storage.",
    stack: ["React", "Firebase", "Firestore", "Maps", "SCSS"],
    categories: ["fullstack"],
    repo: gh("ShinobiPath-Itinerary-Planner"),
    live: "https://shinobi-path-itinerary-planner.vercel.app",
    year: 2025,
  },
  {
    name: "Employee Management",
    blurb:
      "Full-stack HR CRUD with profile photos on Cloudinary, validated forms and Redux state over a MongoDB + Express API.",
    stack: ["React", "Redux", "Chakra UI", "Formik", "Express", "MongoDB"],
    categories: ["fullstack"],
    repo: gh("Employee-Management-MERN"),
    live: "https://employee-management-mern-phi.vercel.app",
    year: 2025,
  },
  {
    name: "Genjutsu Beats",
    blurb: "A music player with a playlist, custom controls and an anime-inspired interface.",
    stack: ["React", "JavaScript", "Audio API"],
    categories: ["frontend"],
    repo: gh("Genjutsu-Beats-Music-Player"),
    live: "https://genjutsu-beats-music-player.vercel.app",
    year: 2025,
  },
  {
    name: "IntelliCrack",
    blurb:
      "Crack detection and analysis for civil structures using computer vision and deep learning, from my B.Tech in AI.",
    stack: ["Python", "Computer Vision", "Deep Learning", "TensorFlow"],
    categories: ["ai"],
    repo: gh("IntelliCrack"),
    year: 2024,
  },
  {
    name: "Grocery Android App",
    blurb: "A native Android grocery shopping app with product listings and a cart, written in Kotlin.",
    stack: ["Kotlin", "Android"],
    categories: ["mobile"],
    repo: gh("Grocery-Android-App"),
    year: 2023,
  },
];

export const projectFilters: { id: "all" | ProjectCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & LLM" },
  { id: "fullstack", label: "Full-stack" },
  { id: "frontend", label: "Frontend" },
  { id: "mobile", label: "Mobile" },
  { id: "tools", label: "Tools" },
];

export const skills: { id: string; label: string; items: string[] }[] = [
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Redux", "Material UI", "Tailwind CSS", "Storybook", "Module Federation", "Vite", "Bootstrap", "React Native"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "Serverless", "Flask", "FastAPI", "Hibernate", "JSP / Servlets"],
  },
  {
    id: "languages",
    label: "Languages",
    items: ["TypeScript", "JavaScript (ES6+)", "Python", "Java", "PHP", "SQL", "C", "C++", "Kotlin"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    items: ["AWS Lambda", "AWS EC2", "AWS S3", "Google Cloud APIs", "Firebase", "Docker", "GitHub Actions", "Git", "Linux"],
  },
  {
    id: "data",
    label: "Data",
    items: ["MongoDB", "MySQL", "Firestore", "Oracle"],
  },
  {
    id: "ai",
    label: "AI & ML",
    items: ["LLM APIs", "Gemini", "NLP", "Fine-tuning", "TensorFlow", "NumPy", "Pandas", "Computer Vision"],
  },
  {
    id: "practices",
    label: "Practices",
    items: ["Performance optimization", "Component-driven development", "Micro-frontends", "Accessibility", "Agile / Scrum"],
  },
];

export const education = [
  {
    title: "B.Tech in Artificial Intelligence",
    school: "G. H. Raisoni Institute of Engineering and Technology",
    location: "Nagpur, India",
    period: "12/2021 – 06/2024",
    kind: "Degree",
  },
  {
    title: "Diploma in Computer Engineering",
    school: "Nagpur Institute of Technology Polytechnic",
    location: "Nagpur, India",
    period: "08/2019 – 12/2021",
    kind: "Diploma",
  },
  {
    title: "Full-Stack Web Development Program",
    school: "Masai School",
    location: "Remote",
    period: "08/2024 – 04/2025",
    kind: "Course",
  },
  {
    title: "Diploma in Network Administration",
    school: "Jetking Nagpur",
    location: "Nagpur, India",
    period: "10/2020 – 01/2022",
    kind: "Course",
  },
];

/** Whole months between a YYYY-MM start and today, used for live tenure labels. */
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
