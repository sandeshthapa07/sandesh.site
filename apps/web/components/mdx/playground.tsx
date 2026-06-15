"use client"

import * as React from "react"
import { Play, RotateCcw } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type Language = "html" | "js" | "css"

interface PlaygroundProps {
  code: string
  language?: Language
  title?: string
  height?: number
}

function buildSrcdoc(code: string, language: Language): string {
  if (language === "html") return code

  if (language === "js") {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{font-family:monospace;font-size:13px;padding:10px 12px;margin:0;background:#fff;color:#111;line-height:1.5}
  .line{padding:1px 0;white-space:pre-wrap;word-break:break-all}
  .err{color:#c0392b}
  .dim{color:#888}
</style>
</head>
<body>
<div id="out"></div>
<script>
const out=document.getElementById('out');
function write(text,cls){const d=document.createElement('div');d.className='line'+(cls?' '+cls:'');d.textContent=text;out.appendChild(d)}
const _log=console.log.bind(console);
console.log=(...a)=>{write(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' '));_log(...a)};
console.error=(...a)=>{write(a.join(' '),'err')};
console.warn=(...a)=>{write(a.join(' '),'dim')};
window.onerror=(m,_,l)=>{write('Error: '+m+(l?' (line '+l+')':''),'err');return true};
window.onunhandledrejection=e=>{write('Unhandled: '+e.reason,'err')};
try{${code}}catch(e){write('Error: '+e.message,'err')}
</script>
</body>
</html>`
  }

  // css
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body{margin:0;padding:16px;font-family:sans-serif;font-size:14px}
  ${code}
</style>
</head>
<body>
  <h1>Heading</h1>
  <p>A paragraph of sample text to style.</p>
  <button>Button</button>
  <ul><li>List item one</li><li>List item two</li></ul>
</body>
</html>`
}

export function Playground({
  code: initialCode,
  language = "html",
  title,
  height = 220,
}: Readonly<PlaygroundProps>) {
  const [code, setCode] = React.useState(() => initialCode.trim())
  const [activeCode, setActiveCode] = React.useState(() => initialCode.trim())
  const [runKey, setRunKey] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const defaultTitle =
    language === "js" ? "script.js" : language === "css" ? "style.css" : "index.html"

  function run() {
    setActiveCode(code)
    setRunKey((k) => k + 1)
  }

  function reset() {
    const base = initialCode.trim()
    setCode(base)
    setActiveCode(base)
    setRunKey((k) => k + 1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = code.slice(0, start) + "  " + code.slice(end)
      setCode(next)
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2
          textareaRef.current.selectionEnd = start + 2
        }
      })
    }
    // Ctrl/Cmd+Enter runs the code
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      run()
    }
  }

  const isDirty = code !== activeCode

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-card text-sm">
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {title ?? defaultTitle}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <RotateCcw aria-hidden className="size-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={run}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity",
              isDirty
                ? "bg-foreground text-background hover:opacity-80"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Play aria-hidden className="size-3" />
            {isDirty ? "Run" : "Run"}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid lg:grid-cols-2">
        {/* Code editor */}
        <div className="border-b lg:border-b-0 lg:border-r">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="block w-full resize-none bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none"
            style={{ height, tabSize: 2 }}
            aria-label="Code editor"
          />
        </div>

        {/* Live preview */}
        <div className="flex flex-col">
          <div className="border-b px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">Preview</span>
          </div>
          <iframe
            key={runKey}
            srcDoc={buildSrcdoc(activeCode, language)}
            sandbox="allow-scripts"
            title="Live preview"
            className="w-full flex-1 bg-white"
            style={{ height: height - 29, border: "none" }}
          />
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
        <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">
          {typeof navigator !== "undefined" && /mac/i.test(navigator.platform) ? "⌘" : "Ctrl"}
        </kbd>
        {" + "}
        <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[10px]">↵</kbd>
        {" to run"}
      </div>
    </div>
  )
}
