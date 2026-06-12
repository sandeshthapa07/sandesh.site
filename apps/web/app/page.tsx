import type { CSSProperties } from "react"
import Link from "next/link"
import { AtSign, GitBranch, Layers, Mail, Palette, PanelsTopLeft } from "lucide-react"

import { LinkPreview } from "@/components/link-preview"
import { NewsletterForm } from "@/components/newsletter-form"
import { PageContainer } from "@/components/page-container"
import { PostListItem } from "@/components/post-list-item"
import { Section } from "@/components/section"
import { getAllPosts } from "@/lib/posts"
import { projects, site } from "@/lib/site"

const projectIcons = [PanelsTopLeft, Layers, Palette]

function InlineLink({
  href,
  children,
  external = false,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
}) {
  const className =
    "inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
  if (external && href.startsWith("http")) {
    return (
      <LinkPreview href={href} className={className}>
        {children}
      </LinkPreview>
    )
  }
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export default function Page() {
  const posts = getAllPosts()
  const github = site.socials.find((s) => s.label === "GitHub")
  const linkedin = site.socials.find((s) => s.label === "LinkedIn")

  return (
    <PageContainer>
      {/* Intro */}
      <section
        className="reveal"
        style={{ "--reveal-i": 0 } as CSSProperties}
        aria-label="Introduction"
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="size-11 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,oklch(0.93_0_0),oklch(0.7_0_0)_60%,oklch(0.55_0_0))] shadow-sm dark:bg-[radial-gradient(circle_at_30%_30%,oklch(0.65_0_0),oklch(0.4_0_0)_60%,oklch(0.28_0_0))]"
          />
          <div>
            <h1 className="font-semibold">{site.name}</h1>
            <p className="text-muted-foreground">
              {site.role} at {site.company}
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5 text-muted-foreground">
          <p>
            I&apos;m a frontend developer at{" "}
            <InlineLink href={site.companyUrl} external>
              {site.company}
            </InlineLink>
            , where we
            build products with React and Next.js. I{" "}
            <em className="font-serif text-[1.05em] text-foreground">
              care deeply
            </em>{" "}
            about craft and accessibility, and I like interfaces that feel
            fast and effortless.
          </p>
          <p>
            I write about what I learn and discover here. You can reach me on{" "}
            {linkedin ? (
              <InlineLink href={linkedin.href} external>
                <AtSign aria-hidden className="size-3.5" />
                thapasandes
              </InlineLink>
            ) : null}{" "}
            and via{" "}
            <InlineLink href={`mailto:${site.email}`} external>
              <Mail aria-hidden className="size-3.5" />
              email
            </InlineLink>
            , or see my code on{" "}
            {github ? (
              <InlineLink href={github.href} external>
                <GitBranch aria-hidden className="size-3.5" />
                GitHub
              </InlineLink>
            ) : null}
            .
          </p>
        </div>
      </section>

      {/* Projects */}
      <Section title="Projects" revealIndex={1} className="mt-20">
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 2).map((project, i) => {
            const Icon = projectIcons[i % projectIcons.length]!
            const card = (
              <div className="card-lift flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs">
                <div className="flex h-32 items-center justify-center">
                  <Icon aria-hidden className="size-9 text-foreground/70" strokeWidth={1.5} />
                </div>
                <p className="mt-4 font-medium">{project.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            )
            return project.href ? (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl"
              >
                {card}
              </a>
            ) : (
              <div key={project.title}>{card}</div>
            )
          })}
        </div>
      </Section>

      {/* Writing */}
      <Section title="Writing" revealIndex={2} className="mt-20">
        <div className="mt-4 grid gap-1">
          {posts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <Section title="Newsletter" revealIndex={3} className="mt-20">
        <p className="mt-1.5 text-muted-foreground">
          I share what I&apos;m working on, new posts and interesting
          resources.
        </p>
        <NewsletterForm />
      </Section>
    </PageContainer>
  )
}
