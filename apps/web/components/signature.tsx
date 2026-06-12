"use client"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

export function Signature({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <figure aria-label={`Signature of ${name}`} className="mt-16">
      <motion.p
        aria-hidden
        className={cn("text-4xl text-foreground/90 sm:text-5xl", className)}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {name}
      </motion.p>
      <svg
        aria-hidden
        viewBox="0 0 320 24"
        className="mt-1 h-6 w-64 text-muted-foreground"
        fill="none"
      >
        <motion.path
          d="M4 14 C 60 4, 120 20, 180 10 S 290 14, 316 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.4, ease: "easeInOut" }}
        />
      </svg>
    </figure>
  )
}
