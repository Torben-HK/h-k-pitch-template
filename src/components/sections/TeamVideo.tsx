"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSplitLines } from "@/components/typography/useSplitLines";
import { useSplitScale } from "@/components/typography/useSplitScale";

const CONTROLS_HIDE_DELAY = 2000;

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export default function TeamVideo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const isHoveringControlsRef = useRef(false);
  const skipNextFullscreenResetRef = useRef(false);
  const isScrubbingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsActive, setControlsActive] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);

  const clearControlsTimer = () => {
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  };

  const resetVideoUiState = () => {
    clearControlsTimer();
    isHoveringControlsRef.current = false;
    setIsHoveringControls(false);
    setControlsActive(false);
    setShowControls(false);
    setIsPlaying(false);
  };

  const scrollVideoToViewportCenter = () => {
    const wrap = videoWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const targetY = Math.max(
      0,
      window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2
    );
    window.scrollTo({ top: targetY, behavior: "auto" });
  };

  const resetAndCenterAfterFullscreenExit = (video: HTMLVideoElement) => {
    video.pause();
    resetVideoUiState();
    scrollVideoToViewportCenter();
  };

  const requestWrapperFullscreen = async () => {
    const wrapper = videoWrapRef.current as FullscreenElement | null;
    if (!wrapper) return;

    const requestFullscreen =
      wrapper.requestFullscreen ||
      wrapper.webkitRequestFullscreen ||
      wrapper.mozRequestFullScreen ||
      wrapper.msRequestFullscreen;

    if (!requestFullscreen) return;
    await requestFullscreen.call(wrapper);
  };

  const exitWrapperFullscreen = async () => {
    const doc = document as FullscreenDocument;
    const exitFullscreen =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (!exitFullscreen) return;
    await exitFullscreen.call(doc);
  };

  useSplitScale({ scope: sectionRef });
  useSplitLines({ scope: sectionRef });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  useGSAP(
    () => {
      if (!videoWrapRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;

      if (prefersReducedMotion || isMobile) {
        gsap.set(videoWrapRef.current, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        videoWrapRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: videoWrapRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    if (isMobileViewport) {
      resetVideoUiState();
      return;
    }

    const doc = document as FullscreenDocument;

    const getFullscreenElement = () =>
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    const handleFullscreenChange = () => {
      const video = videoRef.current;
      if (!video) return;

      const fullscreenElement = getFullscreenElement();
      const active = fullscreenElement === videoWrapRef.current;
      setIsFullscreen(active);

      if (!active) {
        if (skipNextFullscreenResetRef.current) {
          skipNextFullscreenResetRef.current = false;
          return;
        }
        resetAndCenterAfterFullscreenExit(video);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    const video = videoRef.current;
    if (!video) {
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
        document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      };
    }

    setVolume(video.volume);
    setIsPlaying(!video.paused && !video.ended);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setVolume(video.volume);
    const onTimeUpdate = () => {
      if (isScrubbingRef.current) return;
      if (video.duration > 0) {
        setProgress(video.currentTime / video.duration);
      } else {
        setProgress(0);
      }
    };
    const onLoadedMetadata = () => {
      if (video.duration > 0) {
        setProgress(video.currentTime / video.duration);
      } else {
        setProgress(0);
      }
    };
    const onEnded = async () => {
      const active = getFullscreenElement() === videoWrapRef.current;
      if (active) {
        skipNextFullscreenResetRef.current = true;
        try {
          await exitWrapperFullscreen();
        } catch {
          // Ignore fullscreen exit errors.
          skipNextFullscreenResetRef.current = false;
        }
      }
      resetAndCenterAfterFullscreenExit(video);
    };

    video.addEventListener("webkitendfullscreen", handleFullscreenChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("ended", onEnded);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      video.removeEventListener("webkitendfullscreen", handleFullscreenChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
      clearControlsTimer();
    };
  }, [isMobileViewport]);

  const startControlsHideTimer = () => {
    if (!controlsActive || isHoveringControlsRef.current) {
      return;
    }

    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = window.setTimeout(() => {
      if (!isHoveringControlsRef.current) {
        setShowControls(false);
      }
    }, CONTROLS_HIDE_DELAY);
  };
  const showControlsTemporarily = () => {
    if (!controlsActive) return;
    setShowControls(true);
    startControlsHideTimer();
  };

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.ended) {
      video.currentTime = 0;
    }

    video.muted = false;
    video.volume = volume;
    setControlsActive(true);
    setShowControls(true);

    try {
      await requestWrapperFullscreen();
    } catch {
      // Ignore fullscreen errors and continue playback.
    }

    try {
      await video.play();
    } catch {
      // Ignore playback errors.
    }
    startControlsHideTimer();
  };

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    showControlsTemporarily();

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // Ignore playback errors.
      }
      return;
    }

    video.pause();
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    showControlsTemporarily();
  };

  const handleExitFullscreen = async () => {
    showControlsTemporarily();
    try {
      await exitWrapperFullscreen();
    } catch {
      // Ignore exit fullscreen errors.
    }
  };

  const handleTimelinePointerDown = () => {
    isScrubbingRef.current = true;
    showControlsTemporarily();
  };

  const handleTimelinePointerUp = () => {
    isScrubbingRef.current = false;
    showControlsTemporarily();
  };

  const handleTimelineChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const nextProgress = Number(event.target.value);
    setProgress(nextProgress);

    if (video.duration > 0) {
      video.currentTime = nextProgress * video.duration;
    }

    if (video.ended && nextProgress < 1) {
      setIsPlaying(false);
    }

    showControlsTemporarily();
  };

  return (
    <section
      ref={sectionRef}
      className="mt-36 flex w-full flex-col items-center gap-20 lg:mt-96 lg:gap-48"
    >
      <div className="content-wrap flex flex-col items-center gap-10 text-center lg:gap-16">
        <div className="flex flex-col gap-2">
          <h2 className="split-scale">IHR SEID KEIN PROJEKT FÜR UNS.</h2>
          <h3 className="split-scale">IHR SEID UNSERE NÄCHSTE ERFOLGSGESCHICHTE.</h3>
        </div>

        <p className="split-lines">
          Strategie wirkt nur mit Menschen, die Verantwortung übernehmen. Hier ist das Team, das
          Ihr Wachstum aktiv vorantreibt.
        </p>
      </div>

      <div
        ref={videoWrapRef}
        className="relative w-full aspect-video max-h-[70svh] overflow-hidden bg-[#080716] lg:h-[100svh] lg:w-screen lg:aspect-auto lg:max-h-none"
        onPointerMove={isMobileViewport ? undefined : showControlsTemporarily}
        onPointerDown={isMobileViewport ? undefined : showControlsTemporarily}
        onPointerEnter={isMobileViewport ? undefined : () => {
          if (!controlsActive) return;
          isHoveringControlsRef.current = true;
          setIsHoveringControls(true);
          setShowControls(true);
          if (controlsTimerRef.current !== null) {
            window.clearTimeout(controlsTimerRef.current);
            controlsTimerRef.current = null;
          }
        }}
        onPointerLeave={isMobileViewport ? undefined : () => {
          if (!controlsActive) return;
          isHoveringControlsRef.current = false;
          setIsHoveringControls(false);
          startControlsHideTimer();
        }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          controls={isMobileViewport}
          preload="metadata"
          src="/assets/sections/team-video/team-video-master.mp4"
          onClick={isMobileViewport ? undefined : async () => {
            if (!isFullscreen) return;
            showControlsTemporarily();
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              try {
                await video.play();
              } catch {
                // Ignore playback errors.
              }
              return;
            }
            video.pause();
          }}
        />

        {!isMobileViewport && (
          <button
            type="button"
            data-cursor="interactive"
            onClick={handlePlay}
            className={
              "group absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity duration-200 " +
              (isPlaying ? "pointer-events-none opacity-0" : "opacity-100")
            }
            aria-label="Play video"
          >
            <span className="flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(219,193,141,0.33)] bg-[linear-gradient(90deg,#082940_0%,#080716_100%)] text-[#DBC18D] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition duration-300 ease-out group-hover:scale-[1.05] group-hover:border-[rgba(219,193,141,0.6)] group-hover:bg-[linear-gradient(90deg,#0D3C57_0%,#080716_100%)] group-hover:shadow-[0_14px_40px_rgba(0,0,0,0.55)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-1 -translate-x-[3px]"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}

        {!isMobileViewport && (
          <div
            className={
              "absolute inset-x-0 bottom-0 z-20 p-4 transition-opacity duration-200 lg:p-6 " +
              (controlsActive && showControls
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0")
            }
          >
            <div className="mx-auto flex w-full max-w-3xl items-center gap-5 rounded-[18px] border border-[#DBC18D33] bg-[linear-gradient(90deg,rgba(8,41,64,0.85)_0%,rgba(8,7,22,0.92)_100%)] px-4 py-3 backdrop-blur">
              <button
                type="button"
                data-cursor="interactive"
                onClick={handlePlayPause}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DBC18D55] text-[#DBC18D] transition-colors hover:border-[#DBC18D] hover:text-white"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="flex flex-1 items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={progress}
                  data-cursor="interactive"
                  onChange={handleTimelineChange}
                  onPointerDown={handleTimelinePointerDown}
                  onPointerUp={handleTimelinePointerUp}
                  onBlur={handleTimelinePointerUp}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#37515F] accent-[#DBC18D]"
                  aria-label="Timeline"
                />
              </div>

              <div className="flex w-full max-w-[130px] items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                  className="text-[#DBC18D]"
                >
                  <path d="M3 10v4h4l5 4V6L7 10H3z" />
                  <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.05A4.47 4.47 0 0 0 16.5 12z" />
                  <path d="M14 3.23v2.06A7 7 0 0 1 19 12a7 7 0 0 1-5 6.71v2.06A9 9 0 0 0 21 12a9 9 0 0 0-7-8.77z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  data-cursor="interactive"
                  onChange={handleVolumeChange}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#37515F] accent-[#DBC18D]"
                  aria-label="Volume"
                />
              </div>

              <button
                type="button"
                data-cursor="interactive"
                onClick={handleExitFullscreen}
                className={
                  "flex h-11 w-11 items-center justify-center rounded-full border transition-colors " +
                  (isFullscreen
                    ? "border-[#DBC18D55] text-[#DBC18D] hover:border-[#DBC18D] hover:text-white"
                    : "border-[#37515F] text-[#8da3b0]")
                }
                disabled={!isFullscreen}
                aria-label="Exit fullscreen"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm8 11h3v-3h-2v1h-1v2zm1-11V7h-1V5h-2v5h5V8h-2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

