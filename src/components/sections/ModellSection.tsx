"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/typography/SplitText";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { useSplitLines } from "@/components/typography/useSplitLines";
import { scheduleScrollTriggerRefresh } from "@/lib/scrollTriggerRefresh";

const timelineCards = [
  {
    title: "1. STRATEGIE",
    subline: "Wofür stehen wir – und für wen?",
    iconSrc: "/assets/sections/modell/strategy-web.gif",
    body: "Bevor Sichtbarkeit entsteht, braucht es Klarheit.",
    list: [
      "Zielgruppenpriorisierung",
      "Marktpositionierung & Markenstrategie",
      "Brand Story, Messaging-System & Design",
      "Angebotsarchitektur",
      "Argumentationslogiken für Entscheider"
    ],
    footer:
      "Strategie sorgt dafür, dass Wachstum nicht beliebig wird. Sie definiert Richtung, Fokus und Anspruch."
  },
  {
    title: "2. SICHTBARKEIT",
    subline: "Relevanz in Entscheidungsphasen.",
    iconSrc: "/assets/sections/modell/view-web.gif",
    body: "Ihr Unternehmen muss dort präsent sein, wo Entscheider recherchieren, vergleichen und absichern.",
    list: [
      "Google & KI-gestützte Recherche",
      "LinkedIn & Fachplattformen",
      "Thought Leadership",
      "Kontinuierliche Marktpräsenz (on-/offline)"
    ],
    footer: "Nicht für Reichweite. Sondern für Wahrnehmung bei den richtigen Entscheidern."
  },
  {
    title: "3. SYSTEME",
    subline: "Wachstum reproduzierbar machen.",
    iconSrc: "/assets/sections/modell/process-web.gif",
    body: "Netzwerk bleibt wertvoll. Doch zusätzlich braucht es klare Prozesse.",
    list: [
      "Strukturierter Neukundenprozess",
      "CRM-Logiken und Lead-Management",
      "Recruiting-Funnels",
      "Automatisierte Übergaben"
    ],
    footer: "Systeme sorgen dafür, dass Wachstum nicht personenabhängig bleibt."
  },
  {
    title: "4. STRUKTUR",
    subline: "Organisation, die Wachstum trägt.",
    iconSrc: "/assets/sections/modell/process-flow-web.gif",
    body: "Mehr Nachfrage braucht stabile interne Abläufe.",
    list: [
      "Klare Verantwortlichkeiten",
      "Transparente KPI-Systeme",
      "Saubere Prozessdefinition",
      "Belastbare interne Kommunikation"
    ],
    footer: "Struktur verhindert, dass Wachstum Unruhe erzeugt."
  },
  {
    title: "5. SKALIERUNG",
    subline: "Führung, die mitwächst.",
    iconSrc: "/assets/sections/modell/evolution-gif.gif",
    body: "Wachstum endet nicht im Vertrieb. Es endet in der Führung.",
    list: [
      "Delegationsfähigkeit",
      "Entscheidungsstrukturen",
      "Markterweiterung",
      "Strategische Weiterentwicklung"
    ],
    footer: "Skalierung bedeutet: Wachstum wird nicht größer – sondern kontrollierter."
  }
];

type TimelineMetrics = {
  startOffset: number;
  endOffset: number;
  cardWidth: number;
  gap: number;
  cardStep: number;
  travel: number;
};

type Stage = 0 | 1 | 2 | 3 | 4;

export default function ModellSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);

  useSplitScale({ scope: sectionRef });
  useSplitLines({ scope: sectionRef });

  const getMetrics = () => {
    const viewportWidth = viewportRef.current?.clientWidth ?? 0;
    const firstCard = trackRef.current?.querySelector<HTMLElement>("[data-timeline-card]");
    if (!firstCard) {
      return {
        startOffset: 0,
        endOffset: 0,
        cardWidth: 0,
        gap: 24,
        cardStep: 0,
        travel: 0
      };
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = 24;
    const startOffset = (viewportWidth - (3 * cardWidth + 2 * gap)) / 2;
    const endOffset = startOffset - (2 * (cardWidth + gap));
    const cardStep = cardWidth + gap;
    const travel = Math.abs(endOffset - startOffset);

    return {
      startOffset,
      endOffset,
      cardWidth,
      gap,
      cardStep,
      travel
    };
  };

  useGSAP(() => {
    if (!viewportRef.current || !trackRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const initialMetrics = getMetrics();
      if (!initialMetrics.cardWidth || !trackRef.current || !viewportRef.current) return;

      let resizeTimer: number | null = null;
      let lastViewportWidth = window.innerWidth;
      let lastViewportHeight = window.innerHeight;
      let metrics: TimelineMetrics = initialMetrics;
      let activeHighlightIndex = -1;
      let lastProgress = 0;
      let trigger: ScrollTrigger | null = null;

      const getStageFromProgress = (progress: number): Stage => {
        const points = [0, 0.25, 0.5, 0.75, 1] as const;
        let nearestIndex: Stage = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        points.forEach((point, index) => {
          const distance = Math.abs(progress - point);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index as Stage;
          }
        });
        return nearestIndex;
      };

      const getHighlightIndexFromStage = (stage: Stage) => {
        return stage;
      };

      const setHighlight = (index: number, immediate = false) => {
        if (!immediate && index === activeHighlightIndex) return;
        activeHighlightIndex = index;
        overlayRefs.current.forEach((overlay, overlayIndex) => {
          if (!overlay) return;
          gsap.to(overlay, {
            autoAlpha: overlayIndex === index ? 1 : 0,
            duration: immediate ? 0 : 0.2,
            ease: "power1.out",
            overwrite: true
          });
        });
      };

      const setTrackFromProgress = (progress: number) => {
        if (!trackRef.current) return;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        let x = metrics.startOffset;

        if (clampedProgress <= 0.25) {
          x = metrics.startOffset;
        } else if (clampedProgress <= 0.5) {
          const segmentProgress = (clampedProgress - 0.25) / 0.25;
          x = metrics.startOffset - metrics.cardStep * segmentProgress;
        } else if (clampedProgress <= 0.75) {
          const segmentProgress = (clampedProgress - 0.5) / 0.25;
          const midOffset = metrics.startOffset - metrics.cardStep;
          x = midOffset + (metrics.endOffset - midOffset) * segmentProgress;
        } else {
          x = metrics.endOffset;
        }

        gsap.set(trackRef.current, { x });
      };

      gsap.set(trackRef.current, { x: metrics.startOffset });
      setTrackFromProgress(0);
      setHighlight(0, true);

      trigger = ScrollTrigger.create({
        trigger: viewportRef.current,
        start: "top top",
        end: () => {
          metrics = getMetrics();
          const pinDistance = Math.round(Math.max(window.innerHeight * 1.2, metrics.travel * 2.8));
          return `+=${pinDistance}`;
        },
        scrub: 0.5,
        snap: {
          snapTo: [0, 0.25, 0.5, 0.75, 1],
          directional: true,
          inertia: false,
          delay: 0,
          duration: { min: 0.1, max: 0.2 },
          ease: "power2.out"
        },
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          lastProgress = self.progress;
          setTrackFromProgress(lastProgress);
          setHighlight(getHighlightIndexFromStage(getStageFromProgress(lastProgress)));
        },
        onRefreshInit: () => {
          metrics = getMetrics();
          setTrackFromProgress(lastProgress);
          setHighlight(getHighlightIndexFromStage(getStageFromProgress(lastProgress)), true);
        },
        onRefresh: (self) => {
          metrics = getMetrics();
          lastProgress = self.progress;
          setTrackFromProgress(lastProgress);
          setHighlight(getHighlightIndexFromStage(getStageFromProgress(lastProgress)), true);
        }
      });

      const handleViewportChange = () => {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }
        resizeTimer = window.setTimeout(() => {
          const nextViewportWidth = window.innerWidth;
          const nextViewportHeight = window.innerHeight;
          if (
            nextViewportWidth === lastViewportWidth &&
            nextViewportHeight === lastViewportHeight
          ) {
            return;
          }
          lastViewportWidth = nextViewportWidth;
          lastViewportHeight = nextViewportHeight;
          scheduleScrollTriggerRefresh();
        }, 120);
      };

      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("orientationchange", handleViewportChange);

      return () => {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener("orientationchange", handleViewportChange);
        trigger?.kill();
        trigger = null;
      };
    });

    mm.add("(max-width: 1023px)", () => {
      if (!trackRef.current) return;

      gsap.set(trackRef.current, {
        x: 0,
        clearProps: "x,transform,willChange"
      });

      overlayRefs.current.forEach((overlay) => {
        if (!overlay) return;
        gsap.set(overlay, { autoAlpha: 0 });
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mt-24 flex w-full flex-col items-center px-4 py-20 lg:mt-40 lg:px-16 lg:py-32"
    >
      <div className="content-wrap max-w-[1440px] flex flex-col items-center gap-8 text-center lg:gap-12">
        <div className="flex flex-col items-center">
          <SplitText
            text="Der Weg?"
            split="words"
            as="h3"
            className="split-scale mb-2 lg:mb-0"
            childClassName="inline-block"
          />
          <SplitText
            text="DAS 5-S-MODELL "
            split="words"
            as="h2"
            className="split-scale uppercase leading-[1.2] lg:leading-[1.1]"
            childClassName="inline-block"
          />
          <SplitText
            text="FÜR SICHERES WACHSTUM"
            split="words"
            as="h2"
            className="split-scale uppercase leading-[1.2] lg:leading-[1.1]"
            childClassName="inline-block"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="split-lines">
            Planbares Wachstum entsteht nicht durch einzelne Maßnahmen. Es entsteht durch Struktur.
          </p>
          <p className="split-lines">
            Das 5-S-Modell bündelt alle relevanten Wachstumshebel in einer klaren Systematik.
            Sichtbarkeit wird messbar. Anfragen werden planbar. Mitarbeitergewinnung wird
            systematisch. Führung wird strategisch. Wachstum ist kein Zufall mehr, sondern ein
            steuerbarer Prozess.
          </p>
        </div>
      </div>
      <div className="content-wrap mt-10 w-full max-w-[1440px] lg:mt-16">
        <div ref={viewportRef} className="overflow-visible lg:flex lg:h-[100svh] lg:items-center">
          <div
            ref={trackRef}
            className="flex w-full min-w-0 flex-col gap-8 pb-0 lg:min-w-max lg:flex-row lg:items-start lg:gap-6 lg:will-change-transform lg:select-none lg:touch-pan-y lg:active:cursor-grabbing"
          >
            {timelineCards.map((card, index) => (
              <div
                key={card.title}
                data-timeline-card
                className={
                  "relative flex min-h-[260px] w-full flex-none flex-col overflow-hidden rounded-[50px] border border-[#DBC18D]/30 bg-[linear-gradient(90deg,#080716_0%,#080716_100%)] p-8 transition-[border-color] duration-300 ease-out lg:w-[calc((min(1440px,100vw)-3rem)/3)] lg:p-10 " +
                  (index % 2 === 0 ? "lg:self-start" : "lg:self-end lg:mt-20")
                }
              >
                <div
                  ref={(el) => {
                    overlayRefs.current[index] = el;
                  }}
                  className="absolute inset-0 opacity-0 bg-[linear-gradient(90deg,#082940_0%,#080716_100%)]"
                />
                <div className="absolute right-4 top-4 z-[1] h-16 w-16 rounded-full bg-gradient-to-b from-[#DBC18D]/40 to-transparent p-[1px] lg:h-20 lg:w-20">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#080716] p-4">
                    <img src={card.iconSrc} alt="" className="h-10 w-10 rounded-full object-contain lg:h-16 lg:w-16" />
                  </div>
                </div>
                <div className="relative z-[1] gap-6 flex flex-col">
                  <h3 className="text-left text-fs-ui-350 font-medium uppercase text-white">
                    {card.title}
                  </h3>
                  <div className="flex flex-col">
                    <h4 className="mt-1 text-left text-fs-ui-200 font-medium text-white">
                      {card.subline}
                    </h4>
                    <p className="text-left text-fs-ui-100 font-normal leading-normal text-[#DBC18D]">
                      {card.body}
                    </p>
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-left text-fs-ui-100 font-normal text-white">
                    {card.list.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                  <p className="text-left text-fs-ui-100 font-normal leading-normal text-white">
                    {card.footer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


