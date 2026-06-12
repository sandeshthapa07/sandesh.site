const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/

type VideoProps = {
  src: string
  title: string
  poster?: string
}

export function Video({ src, title, poster }: VideoProps) {
  const youtubeId = src.match(YOUTUBE_ID)?.[1]

  return (
    <figure className="my-6">
      <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        ) : (
          <video
            controls
            preload="metadata"
            playsInline
            poster={poster}
            className="size-full"
          >
            <source
              src={src}
              type={src.endsWith(".webm") ? "video/webm" : "video/mp4"}
            />
            Your browser does not support embedded videos.{" "}
            <a href={src}>Download the video</a> instead.
          </video>
        )}
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        {title}
      </figcaption>
    </figure>
  )
}
