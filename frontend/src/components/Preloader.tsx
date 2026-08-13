"use client";

import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hide = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 600);
    };

    const video = videoRef.current;
    if (!video) { hide(); return; }

    // Hide after video ends OR after max 4 seconds, whichever comes first
    const timer = setTimeout(hide, 4000);
    video.addEventListener("ended", () => { clearTimeout(timer); hide(); });

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-600"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <video
        ref={videoRef}
        src="/Loading-MP4.mp4"
        autoPlay
        muted
        playsInline
        className="w-48 h-48 object-contain"
      />
    </div>
  );
}
