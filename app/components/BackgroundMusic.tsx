"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const manualControlRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let disposed = false;
    let started = false;
    function removeListeners() {
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchend", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    }
    function startOnInteraction(event: Event) {
      if (manualControlRef.current || started) return;
      if (event.target instanceof Element && event.target.closest(".music-toggle")) return;
      // Call play synchronously inside the gesture handler for iOS Safari.
      attemptPlayback();
    }
    function attemptPlayback() {
      void audio!.play().then(() => {
        if (disposed) return;
        started = true;
        removeListeners();
      }).catch(() => {
        // Keep listening when autoplay is blocked; the next tap can unlock it.
      });
    }
    audio.volume = 0.1;
    document.addEventListener("click", startOnInteraction);
    document.addEventListener("touchend", startOnInteraction, { passive: true });
    document.addEventListener("keydown", startOnInteraction);
    attemptPlayback();
    return () => {
      disposed = true;
      removeListeners();
    };
  }, []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    manualControlRef.current = true;
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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
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
