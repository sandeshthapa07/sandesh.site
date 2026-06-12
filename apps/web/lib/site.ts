export const site = {
  name: "Sandesh Thapa",
  role: "Frontend Developer",
  company: "AITC International",
  companyUrl: "https://aitc.ai",
  email: "sandesh.thapa@aitc.ai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sandesh.site",
  description:
    "Frontend developer at AITC International building with React and Next.js. I write about what I learn and discover along the way.",
  // `key` is the second chord of the "g then …" navigation hotkey.
  nav: [
    { href: "/", label: "Home", key: "H" },
    { href: "/about", label: "About", key: "A" },
    { href: "/blog", label: "Blog", key: "B" },
    { href: "/uses", label: "Uses", key: "U" },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/sandeshthapa07" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/thapasandes/" },
    { label: "Email", href: "mailto:sandesh.thapa@aitc.ai" },
  ],
} as const

export type Project = {
  title: string
  description: string
  tech: string[]
  href?: string
}

export const projects: Project[] = [
  {
    title: "This portfolio",
    description: "A minimal site that speaks WebMCP.",
    tech: ["Next.js", "React", "Tailwind CSS", "MDX"],
    href: "https://github.com/sandeshthapa07",
  },
  {
    title: "Design system",
    description: "Accessible components on Base UI.",
    tech: ["React", "Base UI", "Tailwind CSS", "Turborepo"],
  },
  {
    title: "Internal dashboards",
    description: "Data-heavy tools for AITC teams.",
    tech: ["React", "Next.js", "TypeScript"],
  },
]

export type UsesGroup = {
  title: string
  items: { name: string; note?: string }[]
}

export const uses: UsesGroup[] = [
  {
    title: "Editor & Terminal",
    items: [
      { name: "VS Code", note: "with Vim keybindings" },
      { name: "Windows Terminal + PowerShell" },
      { name: "Geist Mono", note: "editor and terminal font" },
    ],
  },
  {
    title: "Development",
    items: [
      { name: "React & Next.js", note: "daily drivers" },
      { name: "TypeScript" },
      { name: "Tailwind CSS" },
      { name: "pnpm + Turborepo", note: "monorepo tooling" },
    ],
  },
  {
    title: "Apps & Services",
    items: [
      { name: "Figma", note: "design handoff and prototyping" },
      { name: "GitHub" },
      { name: "Claude Code", note: "AI pair programming" },
    ],
  },
]
