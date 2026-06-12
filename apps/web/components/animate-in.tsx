"use client"

import { motion, useReducedMotion } from "motion/react"

export function AnimateIn({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
