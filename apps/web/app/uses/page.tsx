import type { Metadata } from "next"
import { Fragment } from "react"

import { Separator } from "@workspace/ui/components/separator"

import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
import { uses } from "@/lib/site"

export const metadata: Metadata = {
  title: "Uses",
  description: "The tools, software, and setup I use day to day.",
}

export default function UsesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Uses"
        description="The tools and setup I reach for every day."
      />

      <div className="mt-8">
        {uses.map((group, i) => (
          <Fragment key={group.title}>
            {i > 0 ? <Separator className="my-8" /> : null}
            <Section title={group.title}>
              <ul className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <li key={item.name} className="leading-relaxed">
                    <span className="font-medium">{item.name}</span>
                    {item.note ? (
                      <span className="text-muted-foreground"> — {item.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Section>
          </Fragment>
        ))}
      </div>
    </PageContainer>
  )
}
