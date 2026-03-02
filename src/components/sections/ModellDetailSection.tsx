"use client";

import { useRef } from "react";
import type { TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSplitLines } from "@/components/typography/useSplitLines";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { Section } from "@/components/layout/Section";

const detailSlides = [
  {
    title: "S1 – STRATEGIE & MARKE",
    subline: "Fundament schaffen, bevor Maßnahmen starten.",
    mediaType: "videoLeft",
    mediaSrc: "/assets/sections/modell-detail/video-mock-up 1_1.mp4",
    body: "Hier entsteht Klarheit. Ohne sie wird Wachstum beliebig und zufällig.",
    list: [
      "Bestandsaufnahme Marketing- & Vertriebssystem",
      "Positionierungs-Workshop",
      "Zielgruppen- & Entscheideranalyse",
      "Argumentationslogik für Entscheider",
      "Angebots- & Leistungsarchitektur",
      "Corporate Identity & Messaging",
      "Wettbewerbsanalyse"
    ]
  },
  {
    title: "S2 – SICHTBARKEIT",
    subline: "Relevanz in Entscheidungsphasen aufbauen.",
    mediaType: "video",
    mediaSrc: "/assets/sections/modell-detail/section 2 video.mp4",
    panelStyle: "overlay",
    body: "Nicht Reichweite ist das Ziel – sondern Wahrnehmung bei den richtigen Entscheidern.",
    list: [
      "SEO & GEO (inkl. Nischen wie „Lift & Shift“)",
      "Sichtbarkeit in KI-Systemen & LLMs",
      "LinkedIn-Strategie & Reputationsmarketing über Thought Leadership Contents",
      "Blogmarketing, White Papers & Fachartikel",
      "Videomarketing (Erklärung komplexer Leistungen)",
      "Podcasting",
      "Event Marketing",
      "Empfehlungsmarketing",
      "Website-Relaunch, Landing Pages & Conversion-Optimierung",
      "Reichweitenkampagnen",
      "Retargeting & Sichtbarkeits-Logiken",
      "Fotoshootings"
    ]
  },
  {
    title: "S3 – SYSTEME",
    subline: "Neukunden- und Recruitingprozesse reproduzierbar machen.",
    mediaType: "videoLeft",
    mediaSrc: "/assets/sections/modell-detail/video-mock-up 2.mp4",
    body: "Wachstum darf nicht vom Zufall oder einzelnen Personen abhängen.",
    list: [
      "Strukturierter Neukunden-Funnel",
      "Event-Formate mit strukturiertem Follow-up",
      "LinkedIn-Automations & Account-Based-Marketing",
      "CRM-Setup & Lead-Management",
      "Newsletter-Marketing",
      "KPI-Tracking & Performance-Dashboards",
      "Social Recruiting",
      "Recruiting-Funnels & Bewerber-Landingpages"
    ]
  },
  {
    title: "S4 – STRUKTUR",
    subline: "Organisation stabilisieren, während sie wächst.",
    mediaType: "video",
    mediaSrc: "/assets/sections/modell-detail/video-background-struktur.mp4",
    panelStyle: "overlay",
    body: "Mehr Nachfrage bedeutet mehr Komplexität. Struktur verhindert Unruhe.",
    list: [
      "Prozessanalyse & Optimierung",
      "Rollen- und Verantwortlichkeitsdefinition",
      "interne KPI-Systeme",
      "Automatisierung von Standardprozessen",
      "Schnittstellenoptimierung zwischen Marketing & Vertrieb"
    ]
  },
  {
    title: "S5 – SKALIERUNG",
    subline: "Führung und Organisation auf die nächste Stufe bringen.",
    mediaType: "video",
    mediaSrc: "/assets/sections/modell-detail/video-background-skalierung.mp4",
    panelStyle: "overlay",
    body: "Wachstum endet nicht bei Leads. Es endet in der Führung.",
    list: [
      "Führungsworkshops",
      "Vertriebstrainings",
      "Strategische Roadmaps",
      "Skalierungsplanung für neue Geschäftsfelder",
      "Organisationsentwicklung",
      "Management-Sparring"
    ]
  }
];

export default function ModellDetailSection() {
  const LOCK_IDLE_MS = 500;
  const GESTURE_IDLE_MS = 120;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const listRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isListScrollLockRef = useRef(false);
  const isPostSlideBoundaryLockRef = useRef(false);
  const postSlideLockDirectionRef = useRef<1 | -1 | 0>(0);
  const gestureActiveRef = useRef(false);
  const gestureIdleTimerRef = useRef<number | null>(null);
  const listScrollUnlockTimerRef = useRef<number | null>(null);

  useSplitScale({ scope: sectionRef });
  useSplitLines({ scope: sectionRef });

  const clearListScrollLock = () => {
    if (listScrollUnlockTimerRef.current !== null) {
      window.clearTimeout(listScrollUnlockTimerRef.current);
      listScrollUnlockTimerRef.current = null;
    }
    isListScrollLockRef.current = false;
  };

  const refreshListScrollLock = () => {
    isListScrollLockRef.current = true;
    if (listScrollUnlockTimerRef.current !== null) {
      window.clearTimeout(listScrollUnlockTimerRef.current);
      listScrollUnlockTimerRef.current = null;
    }
    listScrollUnlockTimerRef.current = window.setTimeout(() => {
      isListScrollLockRef.current = false;
      listScrollUnlockTimerRef.current = null;
    }, LOCK_IDLE_MS);
  };

  const clearGestureIdleTimer = () => {
    if (gestureIdleTimerRef.current !== null) {
      window.clearTimeout(gestureIdleTimerRef.current);
      gestureIdleTimerRef.current = null;
    }
  };

  const markGestureActivity = () => {
    const isNewGesture = !gestureActiveRef.current;
    gestureActiveRef.current = true;
    clearGestureIdleTimer();
    gestureIdleTimerRef.current = window.setTimeout(() => {
      gestureActiveRef.current = false;
      gestureIdleTimerRef.current = null;
    }, GESTURE_IDLE_MS);
    return isNewGesture;
  };

  const activatePostSlideBoundaryLock = (direction: 1 | -1) => {
    isPostSlideBoundaryLockRef.current = true;
    postSlideLockDirectionRef.current = direction;
  };

  const clearPostSlideBoundaryLock = () => {
    isPostSlideBoundaryLockRef.current = false;
    postSlideLockDirectionRef.current = 0;
  };

  const isScrollBlocked = () =>
    isAnimatingRef.current || isListScrollLockRef.current || isPostSlideBoundaryLockRef.current;

  useGSAP(
    () => {
      if (!stackRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        if (!stackRef.current) return;

        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;

        const count = cards.length;
        const SLIDE_SWITCH_THRESHOLD = 0.30;
        const SLIDE_SWITCH_BIAS = 1 - SLIDE_SWITCH_THRESHOLD;

        cards.forEach((card, index) => {
          gsap.set(card, {
            yPercent: index === 0 ? 0 : 100,
            autoAlpha: index === 0 ? 1 : 0,
            zIndex: index + 1
          });
        });

        let trigger: ScrollTrigger | null = null;
        let touchStartY = 0;
        let listScrollTween: gsap.core.Tween | null = null;
        let controlledList: HTMLDivElement | null = null;
        const scrollState = { value: 0, target: 0 };
        const clampIndex = (value: number) =>
          Math.min(count - 1, Math.max(0, value));

        const getMaxScroll = (listEl: HTMLDivElement) =>
          Math.max(0, listEl.scrollHeight - listEl.clientHeight);

        const clampScroll = (listEl: HTMLDivElement, value: number) =>
          Math.min(getMaxScroll(listEl), Math.max(0, value));

        const setControlledList = (listEl: HTMLDivElement) => {
          if (controlledList === listEl) return;
          listScrollTween?.kill();
          controlledList = listEl;
          scrollState.value = listEl.scrollTop;
          scrollState.target = listEl.scrollTop;
        };

        const animateListTo = (listEl: HTMLDivElement, nextTarget: number) => {
          setControlledList(listEl);
          scrollState.target = clampScroll(listEl, nextTarget);

          listScrollTween?.kill();
          listScrollTween = gsap.to(scrollState, {
            value: scrollState.target,
            duration: 0.22,
            ease: "power2.out",
            overwrite: true,
            onUpdate: () => {
              if (!controlledList) return;
              controlledList.scrollTop = clampScroll(controlledList, scrollState.value);
            }
          });
        };

        const releaseListController = () => {
          listScrollTween?.kill();
          listScrollTween = null;
          controlledList = null;
        };

        const canScrollList = (listEl: HTMLDivElement | null) => {
          if (!listEl) return false;
          return listEl.scrollHeight > listEl.clientHeight + 1;
        };

        const animateToIndex = (targetIndex: number) => {
          if (isAnimatingRef.current) return;

          const currentIndex = activeIndexRef.current;
          if (targetIndex === currentIndex) return;

          const direction = targetIndex > currentIndex ? 1 : -1;
          const nextCard = cards[targetIndex];
          const currentCard = cards[currentIndex];

          isAnimatingRef.current = true;

          const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: "power2.out" },
            onComplete: () => {
              activeIndexRef.current = targetIndex;
              isAnimatingRef.current = false;
              releaseListController();
              const nextList = listRefs.current[targetIndex];
              if (!nextList || !canScrollList(nextList)) {
                activatePostSlideBoundaryLock(direction);
                return;
              }
              const maxScroll = getMaxScroll(nextList);
              const atTop = nextList.scrollTop <= 0.5;
              const atBottom = nextList.scrollTop >= maxScroll - 0.5;
              if ((direction > 0 && atBottom) || (direction < 0 && atTop)) {
                activatePostSlideBoundaryLock(direction);
              } else {
                clearPostSlideBoundaryLock();
              }
            }
          });

          if (direction > 0) {
            gsap.set(nextCard, { yPercent: 100, autoAlpha: 1 });
            tl.to(nextCard, { yPercent: 0 });
          } else {
            tl.to(currentCard, { yPercent: 100, autoAlpha: 0 });
            gsap.set(nextCard, { yPercent: 0, autoAlpha: 1 });
          }
        };
        trigger = ScrollTrigger.create({
          trigger: stackRef.current,
          start: "top top",
          end: () => `+=${(count - 1) * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const desiredIndex = clampIndex(
              Math.floor(self.progress * (count - 1) + SLIDE_SWITCH_BIAS)
            );
            if (isScrollBlocked()) return;
            const currentIndex = activeIndexRef.current;
            if (!isAnimatingRef.current && desiredIndex !== currentIndex) {
              const direction = desiredIndex > currentIndex ? 1 : -1;
              const nextIndex = clampIndex(currentIndex + direction);
              animateToIndex(nextIndex);
            }
          }
        });

        const handleWheel = (event: WheelEvent) => {
          if (!trigger?.isActive) return;

          const listEl = listRefs.current[activeIndexRef.current];
          const delta = event.deltaY;
          const direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
          const isNewGesture = markGestureActivity();

          if (isPostSlideBoundaryLockRef.current) {
            const lockDirection = postSlideLockDirectionRef.current;
            if (!isNewGesture && (direction === 0 || direction === lockDirection)) {
              event.preventDefault();
              return;
            }
            clearPostSlideBoundaryLock();
          }

          if (isScrollBlocked()) {
            event.preventDefault();

            if (!listEl || !canScrollList(listEl)) return;

            const effectiveScroll =
              controlledList === listEl ? scrollState.target : listEl.scrollTop;
            const maxScroll = getMaxScroll(listEl);
            const atTop = effectiveScroll <= 0.5;
            const atBottom = effectiveScroll >= maxScroll - 0.5;

            if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
              refreshListScrollLock();
              animateListTo(listEl, effectiveScroll + delta);
            }
            return;
          }

          if (!listEl || !canScrollList(listEl)) return;

          const effectiveScroll =
            controlledList === listEl ? scrollState.target : listEl.scrollTop;
          const maxScroll = getMaxScroll(listEl);
          const atTop = effectiveScroll <= 0.5;
          const atBottom = effectiveScroll >= maxScroll - 0.5;

          if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
            event.preventDefault();
            refreshListScrollLock();
            animateListTo(listEl, effectiveScroll + delta);
          }
        };

        const handleTouchStart = (event: TouchEvent) => {
          touchStartY = event.touches[0]?.clientY ?? 0;
          gestureActiveRef.current = false;
          clearGestureIdleTimer();
          clearPostSlideBoundaryLock();
        };

        const handleTouchMove = (event: TouchEvent) => {
          if (!trigger?.isActive) return;

          const listEl = listRefs.current[activeIndexRef.current];
          const currentY = event.touches[0]?.clientY ?? 0;
          const delta = touchStartY - currentY;
          const direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
          const isNewGesture = markGestureActivity();

          if (isPostSlideBoundaryLockRef.current) {
            const lockDirection = postSlideLockDirectionRef.current;
            if (!isNewGesture && (direction === 0 || direction === lockDirection)) {
              event.preventDefault();
              touchStartY = currentY;
              return;
            }
            clearPostSlideBoundaryLock();
          }

          if (isScrollBlocked()) {
            event.preventDefault();

            if (!listEl || !canScrollList(listEl)) {
              touchStartY = currentY;
              return;
            }

            const effectiveScroll =
              controlledList === listEl ? scrollState.target : listEl.scrollTop;
            const maxScroll = getMaxScroll(listEl);
            const atTop = effectiveScroll <= 0.5;
            const atBottom = effectiveScroll >= maxScroll - 0.5;

            if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
              refreshListScrollLock();
              animateListTo(listEl, effectiveScroll + delta);
            }
            touchStartY = currentY;
            return;
          }

          if (!listEl || !canScrollList(listEl)) return;

          const effectiveScroll =
            controlledList === listEl ? scrollState.target : listEl.scrollTop;
          const maxScroll = getMaxScroll(listEl);
          const atTop = effectiveScroll <= 0.5;
          const atBottom = effectiveScroll >= maxScroll - 0.5;

          if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
            event.preventDefault();
            refreshListScrollLock();
            animateListTo(listEl, effectiveScroll + delta);
            touchStartY = currentY;
          }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
          window.removeEventListener("wheel", handleWheel);
          window.removeEventListener("touchstart", handleTouchStart);
          window.removeEventListener("touchmove", handleTouchMove);
          isAnimatingRef.current = false;
          gestureActiveRef.current = false;
          clearGestureIdleTimer();
          clearPostSlideBoundaryLock();
          clearListScrollLock();
          releaseListController();
          trigger?.kill();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  const handleListWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const canScroll = target.scrollHeight > target.clientHeight;
    if (!canScroll) return;
    const atTop = target.scrollTop <= 0;
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
    if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) {
      refreshListScrollLock();
      event.stopPropagation();
    }
  };

  const handleListTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const canScroll = target.scrollHeight > target.clientHeight;
    if (canScroll) {
      refreshListScrollLock();
      event.stopPropagation();
    }
  };

  return (
    <Section
      ref={sectionRef}
      className="mt-32 flex w-full flex-col items-center !px-0"
      innerClassName="w-full"
      useContentWrap={false}
    >
      <div className="content-wrap max-w-[1440px] flex flex-col items-center gap-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="split-scale text-balance">DIE 5-S-MODULE IM DETAIL</h2>
          <h3 className="split-scale text-balance font-light">5 MODULE FÜR SICHERES WACHSTUM</h3>
        </div>
        <p className="split-lines text-balance">
          Die 5-S-Module sind kein Maßnahmenkatalog. Sie sind ein strukturiertes System, das Wachstum
          planbar macht. Nicht alles gleichzeitig. Aber alles in der richtigen Reihenfolge.
        </p>
      </div>
      <div className="mt-24 w-full">
        <div
          ref={stackRef}
          className="relative w-full flex flex-col gap-10 lg:block lg:h-[100svh] lg:w-[100vw] lg:overflow-hidden"
        >
          {detailSlides.map((slide, index) => {
            const isBackgroundVideo = slide.mediaType === "video";
            const panelClass =
              slide.mediaType === "video"
                ? "bg-[rgba(8,7,22,0.55)] backdrop-blur-sm lg:bg-[linear-gradient(270deg,rgba(8,7,22,0.60)_0%,#080716_100%)] lg:backdrop-blur-md"
                : slide.panelStyle === "overlay"
                  ? "bg-[linear-gradient(270deg,rgba(8,7,22,0.60)_0%,#080716_100%)] backdrop-blur-md"
                  : "";

            return (
              <div
                key={slide.title}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="flex w-full items-center justify-center overflow-hidden bg-[#080716] lg:absolute lg:inset-0 lg:h-[100svh] lg:w-[100vw]"
              >
                <div className="content-wrap w-full">
                  <div
                    className="relative w-full overflow-hidden rounded-[20px] border border-[#37515F] bg-[#080716] lg:h-[90svh]"
                    style={
                      slide.mediaType === "bg"
                        ? {
                          backgroundImage: `url(${slide.mediaSrc})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }
                        : undefined
                    }
                  >
                    {slide.mediaType === "video" ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={slide.mediaSrc}
                      />
                    ) : null}
                    <div className="h-full w-full">
                      <div className="grid h-full grid-rows-[minmax(220px,auto)_auto] lg:grid-cols-2 lg:grid-rows-1">
                        <div
                          className={
                            "relative w-full min-h-[220px] lg:h-full " +
                            (isBackgroundVideo ? "hidden lg:block" : "")
                          }
                        >
                          {slide.mediaType === "videoLeft" ? (
                            <div className="absolute inset-x-0 inset-y-6 lg:inset-y-8">
                              <video
                                className="h-full w-full object-contain object-left"
                                autoPlay
                                loop
                                muted
                                playsInline
                                src={slide.mediaSrc}
                              />
                            </div>
                          ) : null}
                          {slide.mediaType === "image" ? (
                            <img
                              src={slide.mediaSrc}
                              alt=""
                              className="absolute inset-0 h-full w-full object-contain object-left"
                            />
                          ) : null}
                        </div>
                        <div
                          className={
                            "relative z-[1] row-span-1 flex h-full flex-col justify-center px-6 lg:px-10 " +
                            (isBackgroundVideo ? "row-span-2 lg:row-span-1 lg:col-start-2 " : "") +
                            panelClass
                          }
                        >
                          <div className="flex h-full flex-col justify-center gap-6 py-10 lg:gap-8 lg:py-16">
                            <h3 className="text-left text-balance font-semibold">{slide.title}</h3>
                            <div className="flex flex-col gap-2">
                              <h4 className="text-left text-[clamp(1.125rem,1.45vw,1.25rem)] text-balance font-semibold">
                                {slide.subline}
                              </h4>
                              <p className="text-left text-balance text-[#DBC18D]">{slide.body}</p>
                            </div>
                            <div
                              ref={(el) => {
                                listRefs.current[index] = el;
                              }}
                              className="slide-list-scroll mt-4 flex max-h-[220px] flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-contain pr-2 lg:mt-6 lg:max-h-[250px]"
                              onWheel={handleListWheel}
                              onTouchMove={handleListTouchMove}
                            >
                              {slide.list.map((entry) => (
                                <div key={entry} className="flex flex-nowrap items-center gap-4">
                                  <span className="flex h-[41px] w-[41px] flex-none items-center justify-center rounded-full border border-[#DBC18D42]">
                                    <img
                                      src="/assets/sections/modell-detail/arrow-icon.svg"
                                      alt=""
                                      className="h-[11px] w-[11px]"
                                    />
                                  </span>
                                  <p className="min-w-0 flex-shrink flex-grow-0 rounded-[30px] border border-[#DBC18D42] px-4 py-2 text-left text-balance">
                                    {entry}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
