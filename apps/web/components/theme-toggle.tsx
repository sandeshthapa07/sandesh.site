"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {/* Both icons render; CSS picks one, so SSR output never mismatches */}
            <Sun aria-hidden className="dark:hidden" />
            <Moon aria-hidden className="hidden dark:block" />
          </Button>
        }
      />
      <TooltipContent>
        Toggle theme <kbd data-slot="kbd">d</kbd>
      </TooltipContent>
    </Tooltip>
  )
}
