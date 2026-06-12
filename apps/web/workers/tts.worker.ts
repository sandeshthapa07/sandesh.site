/**
 * Web Worker that runs the Transformers.js text-to-speech model off the main
 * thread, so model download and inference never block the UI.
 *
 * Protocol:
 *   in:  { id: number, text: string }
 *   out: { type: "progress", progress: number }            — model download %
 *        { type: "result", id, audio, samplingRate }       — audio buffer is transferred
 *        { type: "error", id, message }
 */
import { pipeline } from "@huggingface/transformers"

type SpeechOutput = { audio: Float32Array; sampling_rate: number }
type Synthesizer = (text: string) => Promise<SpeechOutput>

const post = self.postMessage.bind(self) as (
  message: unknown,
  transfer?: Transferable[],
) => void

let synthPromise: Promise<Synthesizer> | null = null

function getSynthesizer(): Promise<Synthesizer> {
  if (!synthPromise) {
    synthPromise = pipeline("text-to-speech", "Xenova/mms-tts-eng", {
      dtype: "q8",
      progress_callback: (info) => {
        if (info.status === "progress" && typeof info.progress === "number") {
          post({ type: "progress", progress: Math.round(info.progress) })
        }
      },
    }).then((synth) => synth as unknown as Synthesizer)
    // Allow retrying after a failed download instead of caching the rejection.
    synthPromise.catch(() => {
      synthPromise = null
    })
  }
  return synthPromise
}

self.onmessage = async (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data
  try {
    const synth = await getSynthesizer()
    const out = await synth(text)
    post(
      { type: "result", id, audio: out.audio, samplingRate: out.sampling_rate },
      [out.audio.buffer],
    )
  } catch (error) {
    post({
      type: "error",
      id,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
