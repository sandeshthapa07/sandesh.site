import { Accessibility, Blocks, Sparkles, Zap } from "lucide-react"
import type { Metadata } from "next"
import { Caveat } from "next/font/google"
import Link from "next/link"

import { AnimateIn } from "@/components/animate-in"
import { LinkPreview } from "@/components/link-preview"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { Signature } from "@/components/signature"
import { site } from "@/lib/site"
import { headers } from "next/headers"

const signatureFont = Caveat({ subsets: ["latin"], weight: "600" })

export const metadata: Metadata = {
  title: "About",
  description: `Who ${site.name} is, what he works on at ${site.company}, and what he cares about.`,
}

const focusAreas = [
  {
    icon: Blocks,
    title: "Design systems",
    description: "Components that scale without losing their craft.",
  },
  {
    icon: Accessibility,
    title: "Accessibility",
    description: "Interfaces everyone can use, keyboard-first.",
  },
  {
    icon: Sparkles,
    title: "Motion",
    description: "Micro-interactions that guide, never distract.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Fast by default — the platform over the framework.",
  },
]

export default async function AboutPage() {
  const headerList = await headers()
  console.log("headerList", headerList.get("x-forwarded-for"))
  return (
    <PageContainer>
      <AnimateIn>
        <PageHeader
          title="About"
          description={`${site.role} at ${site.company}`}
        />
      </AnimateIn>

      <AnimateIn
        delay={0.1}
        className="mt-8 max-w-prose space-y-4 leading-relaxed text-muted-foreground"
      >
        <p>
          I&apos;m {site.name}, a frontend developer at{" "}
          <LinkPreview
            href={site.companyUrl}
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            {site.company}
          </LinkPreview>
          , where I work on React and Next.js applications with a shadcn-based
          design system. My day-to-day is turning ambiguous designs into
          interfaces that hold up — to real users, real data, and real
          keyboards.
        </p>
        <p>
          I like small, well-crafted things: design systems, native platform
          APIs, and websites that stay fast and accessible. Lately I&apos;ve
          been exploring view transitions and how AI agents interact with the
          web — this site speaks WebMCP for exactly that reason.
        </p>
        <p>
          When I&apos;m not shipping interfaces, I&apos;m writing about what I
          learn on the{" "}
          <Link
            href="/blog"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            blog
          </Link>
          .
        </p>
      </AnimateIn>

      <section aria-labelledby="focus-heading" className="mt-12">
        <AnimateIn delay={0.15}>
          <h2
            id="focus-heading"
            className="text-xl font-semibold tracking-tight"
          >
            What I care about
          </h2>
        </AnimateIn>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {focusAreas.map((area, i) => (
            <li key={area.title}>
              <AnimateIn
                delay={0.2 + i * 0.08}
                className="flex h-full items-start gap-3 rounded-xl border bg-card/50 p-4"
              >
                <area.icon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <p className="text-sm font-medium">{area.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              </AnimateIn>
            </li>
          ))}
        </ul>
      </section>

      <Signature name={site.name} className={signatureFont.className} />
    </PageContainer>
  )
}
