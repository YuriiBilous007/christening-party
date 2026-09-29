"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoplayAttemptedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoplayAttemptedRef.current) return;
    autoplayAttemptedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.1;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.1;

    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/music.mp3"
        preload="none"
        loop
      />
      <button
        className="music-toggle"
        type="button"
        aria-pressed={playing}
        aria-label={playing ? "Поставити музику на паузу" : "Увімкнути музику"}
        title={playing ? "Пауза" : "Увімкнути музику"}
        onClick={toggleMusic}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {playing ? (
            <path d="M7 5h4v14H7zM15 5h4v14h-4z" />
          ) : (
            <path d="M7 4.8a1 1 0 0 1 1.5-.86l11 6.4a1.9 1.9 0 0 1 0 3.3l-11 6.4a1 1 0 0 1-1.5-.86z" />
          )}
        </svg>
      </button>
    </>
  );
}
