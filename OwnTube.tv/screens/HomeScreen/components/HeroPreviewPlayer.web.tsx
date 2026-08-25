import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Web-only muted autoplay HLS preview for the hero backdrop (Netflix-style). Uses
// video.js (already bundled; v8 plays HLS natively). No controls, looped, muted,
// object-fit cover. Native builds render the still image instead (VideoView is the
// full player and is not used here).
export const HeroPreviewPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      autoplay: "muted",
      muted: true,
      controls: false,
      loop: true,
      preload: "auto",
      fluid: false,
      sources: [{ src, type: "application/x-mpegURL" }],
    });

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    };
  }, [src]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <video
        ref={videoRef}
        className="video-js"
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};
