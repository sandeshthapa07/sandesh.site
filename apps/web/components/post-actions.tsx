"use client"

import * as React from "react"
import {
  ArrowUpRight,
  AudioLines,
  Download,
  Ellipsis,
  FastForward,
  Pause,
  Play,
  Rewind,
  X,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import { site } from "@/lib/site"

type SpeechOutput = { audio: Float32Array; sampling_rate: number }

type WorkerResponse =
  | { type: "progress"; progress: number }
  | { type: "result"; id: number; audio: Float32Array; samplingRate: number }
  | { type: "error"; id: number; message: string }

/**
 * In-browser text-to-speech via Transformers.js, running in a Web Worker so
 * the ~40MB model download and inference never block the main thread. The
 * worker (and its loaded model) is shared across posts for the session.
 */
let worker: Worker | null = null
let requestId = 0
const pending = new Map<
  number,
  { resolve: (out: SpeechOutput) => void; reject: (error: Error) => void }
>()
let onModelProgress: ((pct: number) => void) | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/tts.worker.ts", import.meta.url), {
      type: "module",
    })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data
      if (message.type === "progress") {
        onModelProgress?.(message.progress)
        return
      }
      const request = pending.get(message.id)
      if (!request) return
      pending.delete(message.id)
      if (message.type === "result") {
        request.resolve({
          audio: message.audio,
          sampling_rate: message.samplingRate,
        })
      } else {
        request.reject(new Error(message.message))
      }
    }
    worker.onerror = (event) => {
      const error = new Error(event.message || "Text-to-speech worker failed")
      for (const request of pending.values()) request.reject(error)
      pending.clear()
      worker?.terminate()
      worker = null
    }
  }
  return worker
}

function synthesize(text: string): Promise<SpeechOutput> {
  return new Promise((resolve, reject) => {
    const id = requestId++
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, text })
  })
}

/** Split text into sentence-aligned chunks the TTS model handles comfortably. */
function chunkText(text: string, max = 280): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]?\s*|[^.!?]+$/g) ?? [text]
  const chunks: string[] = []
  let current = ""
  for (const sentence of sentences) {
    if (current && (current + sentence).length > max) {
      chunks.push(current.trim())
      current = ""
    }
    current += sentence
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

/** Fully generated narrations, kept for the session so reopening is instant. */
const audioCache = new Map<string, { audio: Float32Array; samplingRate: number }>()

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/** Encode mono float samples as a 16-bit PCM WAV file. */
function encodeWavBlob(audio: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + audio.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }
  writeString(0, "RIFF")
  view.setUint32(4, 36 + audio.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, audio.length * 2, true)
  for (let i = 0; i < audio.length; i++) {
    const sample = Math.max(-1, Math.min(1, audio[i]!))
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }
  return new Blob([buffer], { type: "audio/wav" })
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 2]

const playerIconButton =
  "rounded-full p-2 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-40"

type Phase = "idle" | "model" | "buffering" | "ready"

/**
 * Streaming narration player. Generation and playback overlap: once ~20% of
 * the chunks are buffered, playback starts while the worker keeps producing
 * the rest. Chunks are scheduled back-to-back on the AudioContext timeline,
 * so there are no gaps between them. If playback ever catches up with
 * generation it stalls at the buffered edge and resumes automatically.
 */
function Listen({
  slug,
  title,
  cover,
  text,
}: {
  slug: string
  title: string
  cover?: string
  text: string
}) {
  const [open, setOpen] = React.useState(false)
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [progress, setProgress] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [position, setPosition] = React.useState(0)
  const [generated, setGenerated] = React.useState(0)
  const [done, setDone] = React.useState(false)
  const [rate, setRate] = React.useState(1)

  const ctxRef = React.useRef<AudioContext | null>(null)
  const buffersRef = React.useRef<AudioBuffer[]>([])
  const startsRef = React.useRef<number[]>([])
  const generatedRef = React.useRef(0)
  const doneRef = React.useRef(false)
  const activeSourcesRef = React.useRef(new Set<AudioBufferSourceNode>())
  const scheduleTokenRef = React.useRef(0)
  const chainEndRef = React.useRef(0)
  const anchorRef = React.useRef<{ ctxTime: number; pos: number } | null>(null)
  const pausedAtRef = React.useRef(0)
  const desiredPlayingRef = React.useRef(false)
  const rateRef = React.useRef(1)
  const cancelledRef = React.useRef(false)

  const getPosition = React.useCallback(() => {
    const ctx = ctxRef.current
    const anchor = anchorRef.current
    if (!ctx || !anchor) return pausedAtRef.current
    return Math.min(
      generatedRef.current,
      anchor.pos + (ctx.currentTime - anchor.ctxTime) * rateRef.current,
    )
  }, [])

  const stopAll = React.useCallback(() => {
    scheduleTokenRef.current++
    for (const source of activeSourcesRef.current) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }
    activeSourcesRef.current.clear()
  }, [])

  const onChainDrained = React.useCallback(() => {
    anchorRef.current = null
    pausedAtRef.current = generatedRef.current
    setPosition(generatedRef.current)
    if (doneRef.current) {
      // Natural end of the narration.
      desiredPlayingRef.current = false
      setPlaying(false)
    }
    // Otherwise: playback caught up with generation; the next appended
    // chunk resumes the chain automatically.
  }, [])

  const startSource = React.useCallback(
    (buffer: AudioBuffer, when: number, offset: number, token: number) => {
      const ctx = ctxRef.current
      if (!ctx) return
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = rateRef.current
      source.connect(ctx.destination)
      source.onended = () => {
        if (scheduleTokenRef.current !== token) return
        activeSourcesRef.current.delete(source)
        if (activeSourcesRef.current.size === 0) onChainDrained()
      }
      source.start(when, offset)
      activeSourcesRef.current.add(source)
    },
    [onChainDrained],
  )

  /** Stop everything and schedule all buffered chunks from a global offset. */
  const scheduleFrom = React.useCallback(
    (startPos: number) => {
      const ctx = ctxRef.current
      const buffers = buffersRef.current
      if (!ctx || buffers.length === 0) return
      stopAll()
      const token = scheduleTokenRef.current
      const starts = startsRef.current
      const pos = Math.max(
        0,
        Math.min(startPos, Math.max(0, generatedRef.current - 0.01)),
      )
      let index = starts.findIndex(
        (start, i) => pos < start + buffers[i]!.duration,
      )
      if (index === -1) index = buffers.length - 1
      const base = ctx.currentTime + 0.08
      let when = base
      for (let i = index; i < buffers.length; i++) {
        const buffer = buffers[i]!
        const inner = i === index ? pos - starts[i]! : 0
        startSource(buffer, when, inner, token)
        when += (buffer.duration - inner) / rateRef.current
      }
      chainEndRef.current = when
      anchorRef.current = { ctxTime: base, pos }
      desiredPlayingRef.current = true
      setPosition(pos)
      setPlaying(true)
    },
    [startSource, stopAll],
  )

  /** Register a freshly generated chunk and extend the playing chain. */
  const appendChunk = React.useCallback(
    (out: SpeechOutput) => {
      const ctx = (ctxRef.current ??= new AudioContext())
      const buffer = ctx.createBuffer(1, out.audio.length, out.sampling_rate)
      buffer.getChannelData(0).set(out.audio)
      const startAt = generatedRef.current
      startsRef.current.push(startAt)
      buffersRef.current.push(buffer)
      generatedRef.current += buffer.duration
      setGenerated(generatedRef.current)
      if (!desiredPlayingRef.current) return
      if (activeSourcesRef.current.size > 0) {
        // Chain still running: append gaplessly at its scheduled end.
        startSource(buffer, chainEndRef.current, 0, scheduleTokenRef.current)
        chainEndRef.current += buffer.duration / rateRef.current
      } else {
        // Playback drained while waiting for this chunk: resume from it.
        scheduleFrom(startAt)
      }
    },
    [scheduleFrom, startSource],
  )

  React.useEffect(() => {
    if (!playing) return
    const tick = setInterval(() => setPosition(getPosition()), 250)
    return () => clearInterval(tick)
  }, [playing, getPosition])

  React.useEffect(
    () => () => {
      cancelledRef.current = true
      onModelProgress = null
      stopAll()
      void ctxRef.current?.close()
    },
    [stopAll],
  )

  function resetAudioState() {
    stopAll()
    buffersRef.current = []
    startsRef.current = []
    generatedRef.current = 0
    doneRef.current = false
    anchorRef.current = null
    pausedAtRef.current = 0
    desiredPlayingRef.current = false
    setGenerated(0)
    setDone(false)
    setPosition(0)
    setPlaying(false)
  }

  async function openPlayer() {
    setOpen(true)
    cancelledRef.current = false
    // A finished narration (cached from this or a previous open) replays
    // instantly; a partial one is regenerated from scratch.
    const cached = audioCache.get(slug)
    if (doneRef.current && buffersRef.current.length > 0) {
      setPhase("ready")
      scheduleFrom(0)
      return
    }
    resetAudioState()
    try {
      if (cached) {
        doneRef.current = true
        setDone(true)
        appendChunk({ audio: cached.audio, sampling_rate: cached.samplingRate })
        setPhase("ready")
        scheduleFrom(0)
        return
      }

      setProgress(0)
      setPhase("model")
      onModelProgress = setProgress
      const chunks = chunkText(text)
      const startAfter = Math.max(1, Math.ceil(chunks.length * 0.2))
      const parts: SpeechOutput[] = []
      for (let i = 0; i < chunks.length; i++) {
        const out = await synthesize(chunks[i]!)
        if (cancelledRef.current) return
        if (i === 0) onModelProgress = null // model is loaded now
        parts.push(out)
        // The transferred buffer is consumed by appendChunk; copy for the cache.
        appendChunk({
          audio: new Float32Array(out.audio),
          sampling_rate: out.sampling_rate,
        })
        if (i + 1 < startAfter) {
          setPhase("buffering")
          setProgress(Math.round(((i + 1) / startAfter) * 100))
        } else if (i + 1 === startAfter) {
          setPhase("ready")
          scheduleFrom(0)
        }
      }
      doneRef.current = true
      setDone(true)

      const total = parts.reduce((sum, part) => sum + part.audio.length, 0)
      const audio = new Float32Array(total)
      let offset = 0
      for (const part of parts) {
        audio.set(part.audio, offset)
        offset += part.audio.length
      }
      audioCache.set(slug, { audio, samplingRate: parts[0]!.sampling_rate })
      if (audioCache.size > 3) {
        audioCache.delete(audioCache.keys().next().value!)
      }
    } catch (error) {
      console.error("Text-to-speech failed", error)
      closePlayer()
    }
  }

  function closePlayer() {
    cancelledRef.current = true
    onModelProgress = null
    stopAll()
    desiredPlayingRef.current = false
    anchorRef.current = null
    pausedAtRef.current = 0
    setPosition(0)
    setPlaying(false)
    setOpen(false)
    setPhase(doneRef.current ? "ready" : "idle")
  }

  function togglePlay() {
    if (playing) {
      const pos = getPosition()
      stopAll()
      desiredPlayingRef.current = false
      anchorRef.current = null
      pausedAtRef.current = pos
      setPosition(pos)
      setPlaying(false)
    } else {
      const atEnd =
        doneRef.current && pausedAtRef.current >= generatedRef.current - 0.1
      scheduleFrom(atEnd ? 0 : pausedAtRef.current)
    }
  }

  function seekTo(seconds: number) {
    const clamped = Math.max(
      0,
      Math.min(seconds, Math.max(0, generatedRef.current - 0.05)),
    )
    if (desiredPlayingRef.current) {
      scheduleFrom(clamped)
    } else {
      pausedAtRef.current = clamped
      setPosition(clamped)
    }
  }

  function seekBy(delta: number) {
    seekTo((playing ? getPosition() : pausedAtRef.current) + delta)
  }

  function onTimelineClick(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    seekTo(((event.clientX - rect.left) / rect.width) * generatedRef.current)
  }

  function cycleRate() {
    const next =
      PLAYBACK_RATES[
        (PLAYBACK_RATES.indexOf(rateRef.current) + 1) % PLAYBACK_RATES.length
      ]!
    const pos = playing ? getPosition() : pausedAtRef.current
    rateRef.current = next
    setRate(next)
    if (playing) {
      scheduleFrom(pos)
    }
  }

  function downloadAudio() {
    const narration = audioCache.get(slug)
    if (!narration) return
    const url = URL.createObjectURL(
      encodeWavBlob(narration.audio, narration.samplingRate),
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${slug}.wav`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const ratio = generated > 0 ? Math.min(1, position / generated) : 0

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label={open ? "Close player" : "Listen to this post"}
              onClick={() => (open ? closePlayer() : void openPlayer())}
            />
          }
        >
          <AudioLines aria-hidden />
        </TooltipTrigger>
        <TooltipContent>
          {open ? "Close player" : "Listen to this post"}
        </TooltipContent>
      </Tooltip>

      {open ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
          <section
            aria-label="Audio player"
            className="pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-4 text-neutral-50 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny local cover art, skip the optimizer
                  <img
                    src={cover}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="size-12 shrink-0 rounded-lg bg-linear-to-br from-violet-500 via-fuchsia-600 to-red-500"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{title}</p>
                  <p className="truncate text-sm text-neutral-400">
                    {site.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close player"
                onClick={closePlayer}
                className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            {phase === "ready" ? (
              <>
                <div className="mt-4 flex items-center gap-3 text-xs font-medium text-neutral-400 tabular-nums">
                  <span>{formatTime(position)}</span>
                  <button
                    type="button"
                    aria-label="Seek"
                    onClick={onTimelineClick}
                    className="group relative h-4 flex-1 cursor-pointer"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15" />
                    <span
                      className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-neutral-200 transition-[width] duration-200 group-hover:bg-white"
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </button>
                  <span>
                    {formatTime(generated)}
                    {done ? "" : "+"}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Download audio"
                    onClick={downloadAudio}
                    disabled={!done}
                    title={done ? undefined : "Available once generation finishes"}
                    className={playerIconButton}
                  >
                    <Download aria-hidden className="size-4.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Back 10 seconds"
                      onClick={() => seekBy(-10)}
                      className={playerIconButton}
                    >
                      <Rewind aria-hidden className="size-4.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={playing ? "Pause" : "Play"}
                      onClick={togglePlay}
                      className={cn(playerIconButton, "text-white")}
                    >
                      {playing ? (
                        <Pause aria-hidden className="size-5" />
                      ) : (
                        <Play aria-hidden className="size-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Forward 10 seconds"
                      onClick={() => seekBy(10)}
                      className={playerIconButton}
                    >
                      <FastForward aria-hidden className="size-4.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Playback speed ${rate}x`}
                    onClick={cycleRate}
                    className={cn(
                      playerIconButton,
                      "min-w-10 text-xs font-semibold tabular-nums",
                    )}
                  >
                    {rate}×
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4" role="status">
                <p className="text-xs text-neutral-400">
                  {phase === "model"
                    ? `Downloading voice model… ${progress}%`
                    : `Preparing audio… ${progress}%`}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-neutral-200 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}

function MenuItemLabel({
  label,
  description,
  external = false,
}: {
  label: string
  description: string
  external?: boolean
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 font-medium">
        {label}
        {external ? (
          <ArrowUpRight aria-hidden className="size-3.5 text-muted-foreground" />
        ) : null}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </span>
  )
}

export function PostActions({
  slug,
  title,
  text,
  cover,
}: {
  slug: string
  title: string
  text: string
  cover?: string
}) {
  const markdownPath = `/blog/${slug}/markdown`
  const markdownUrl = `${site.url}${markdownPath}`
  const askPrompt = encodeURIComponent(
    `Read ${markdownUrl}, I want to ask questions about it.`,
  )

  function copyLink() {
    void navigator.clipboard.writeText(window.location.href)
  }

  async function copyPage() {
    const markdown = await fetch(markdownPath).then((res) => res.text())
    await navigator.clipboard.writeText(markdown)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Listen slug={slug} title={title} cover={cover} text={text} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
              aria-label="Page actions"
            />
          }
        >
          <Ellipsis aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuItem onClick={copyLink}>
            <MenuItemLabel label="Copy Link" description="Copy URL to clipboard" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void copyPage()}>
            <MenuItemLabel
              label="Copy Page"
              description="Copy page as Markdown for LLMs"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <a href={markdownPath} target="_blank" rel="noopener noreferrer" />
            }
          >
            <MenuItemLabel
              label="View as Markdown"
              description="View this page as plain text"
              external
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <a
                href={`https://chatgpt.com/?hints=search&q=${askPrompt}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MenuItemLabel
              label="Open in ChatGPT"
              description="Ask ChatGPT about this page"
              external
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <a
                href={`https://claude.ai/new?q=${askPrompt}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MenuItemLabel
              label="Open in Claude"
              description="Ask Claude about this page"
              external
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            render={
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(
                  `Issue on "${title}"`,
                )}`}
              />
            }
          >
            <MenuItemLabel
              label="Report an issue"
              description="Suggest feedback or report a problem"
              external
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
