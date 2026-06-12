import type { Metadata } from "next"

import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"
import { site } from "@/lib/site"

import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
}

export default function ContactPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Contact"
        description="Have a question, a project, or just want to say hi? Drop me a message."
      />
      <ContactForm />
      <p className="mt-8 text-sm text-muted-foreground">
        Prefer email? Reach me directly at{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          {site.email}
        </a>
        .
      </p>
    </PageContainer>
  )
}
