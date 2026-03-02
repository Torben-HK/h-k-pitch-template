"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, DrawSVGPlugin } from "@/lib/gsap";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { Section } from "@/components/layout/Section";

const phaseOneHeadline = ["JA?", "NEIN?", "VIELLEICHT?"];
const phaseTwoHeadline = ["FALLS JA", "DANN VIELLEICHT SO?"];
const headlineSequenceDelay = 1.25;

const roadmapCards = [
  {
    title: "1. Bestandsaufnahme Marketing- & Vertriebssystem",
    items: [
      "Analyse bestehender Prozesse",
      "Bewertung aktueller Sichtbarkeit",
      "Bewertung bestehender Vertriebslogik",
      "Identifikation struktureller Lücken"
    ]
  },
  {
    title: "2. Positionierungs-Workshop",
    items: [
      "Zielgruppenpriorisierung",
      "Differenzierung im Wettbewerbsumfeld",
      "Kernbotschaften",
      "Strategische Fokussierung"
    ]
  },
  {
    title: "3. Zielgruppen- & Entscheideranalyse",
    items: [
      "IT-Leitung vs. Geschäftsführung",
      "Entscheidungslogiken",
      "Typische Einwände",
      "Risikoabwägungen"
    ]
  },
  {
    title: "4. Argumentationsarchitektur",
    items: [
      "Value Proposition",
      "Vertrauensbeweise",
      "Nutzenargumentation je Entscheiderebene"
    ]
  },
  {
    title: "5. Angebots- & Leistungsarchitektur",
    items: [
      "Strukturierung der Produktcluster",
      "Klare Leistungsabgrenzung",
      "Paketlogiken",
      "Einstiegspunkte für Neukunden"
    ]
  },
  {
    title: "6. Corporate Identity & Messaging-Rahmen",
    items: [
      "Schärfung Markenauftritt",
      "Tonalität",
      "Claim-/Leitgedankenentwicklung",
      "Inhaltliche Leitlinien für Website & Content"
    ]
  },
  {
    title: "7. Wettbewerbs- & Sichtbarkeitsanalyse",
    items: [
      "Digitale Präsenz Wettbewerber",
      "SEO- & LLM-Potenziale",
      "Positionierungslücken im Markt"
    ]
  },
  {
    title: "8. Operative Wachstums-Roadmap",
    items: [
      "Priorisierung der Tools für S2 - Sichtbarkeit",
      "Definition der ersten Umsetzungsfelder",
      "Budget- & Ressourcenplanung",
      "12-Monats-Wachstumsfahrplan"
    ]
  }
];

export default function RoadmapSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pathSvgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const headlineFallbackRef = useRef<HTMLSpanElement | null>(null);
  const headlineStageRef = useRef<HTMLSpanElement | null>(null);
  const phaseOneGroupRef = useRef<HTMLSpanElement | null>(null);
  const phaseTwoGroupRef = useRef<HTMLSpanElement | null>(null);
  const phaseOneWordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const phaseTwoWordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useSplitScale({ scope: sectionRef });

  useGSAP(
    () => {
      const header = headerRef.current;
      const fallback = headlineFallbackRef.current;
      const stage = headlineStageRef.current;
      const phaseOneGroup = phaseOneGroupRef.current;
      const phaseTwoGroup = phaseTwoGroupRef.current;
      const phaseOneWords = phaseOneWordRefs.current.filter(Boolean) as HTMLSpanElement[];
      const phaseTwoWords = phaseTwoWordRefs.current.filter(Boolean) as HTMLSpanElement[];

      if (
        !header ||
        !fallback ||
        !stage ||
        !phaseOneGroup ||
        !phaseTwoGroup ||
        !phaseOneWords.length ||
        !phaseTwoWords.length
      ) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(fallback, { autoAlpha: 1 });
        gsap.set(stage, { display: "none" });
        return;
      }

      gsap.set(fallback, { autoAlpha: 0 });
      gsap.set(stage, { display: "flex", autoAlpha: 1 });
      gsap.set([phaseOneWords, phaseTwoWords], {
        opacity: 0,
        scale: 0.7,
        transformOrigin: "center center"
      });
      gsap.set(phaseOneGroup, { autoAlpha: 1 });
      gsap.set(phaseTwoGroup, { autoAlpha: 0 });

      const headlineTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: "center center",
          toggleActions: "play none none none",
          once: true
        }
      });

      headlineTimeline
        .to(phaseOneWords, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.55,
          ease: "power2.out"
        }, `+=${headlineSequenceDelay}`)
        .to(phaseOneGroup, {
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.out"
        }, "+=0.8")
        .set(phaseTwoGroup, { autoAlpha: 1 })
        .to(phaseTwoWords, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.55,
          ease: "power2.out"
        });

      return () => {
        headlineTimeline.kill();
      };
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      if (!sectionRef.current || !gridRef.current) return;

      gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const updatePathGeometry = () => {
        if (!gridRef.current || !pathSvgRef.current || !pathRef.current) return;

        const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;

        const gridStyles = window.getComputedStyle(gridRef.current);
        const parsedColumnGap = parseFloat(gridStyles.columnGap || "0");
        const laneWidth = Number.isFinite(parsedColumnGap) && parsedColumnGap > 0
          ? parsedColumnGap
          : 128;

        const gridRect = gridRef.current.getBoundingClientRect();
        const laneLeft = (gridRect.width - laneWidth) / 2;
        const laneRight = laneLeft + laneWidth;

        pathSvgRef.current.style.width = `${laneWidth}px`;
        pathSvgRef.current.setAttribute("data-lane-width", `${laneWidth}`);

        const anchors = cards.map((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const isOddSlide = (index + 1) % 2 === 1;
          const x = isOddSlide ? laneLeft - laneLeft : laneRight - laneLeft;

          return {
            x,
            y: cardRect.top - gridRect.top + cardRect.height / 2
          };
        });

        if (anchors.length < 2) return;

        const d = anchors
          .map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
          )
          .join(" ");

        pathSvgRef.current.setAttribute("viewBox", `0 0 ${laneWidth} ${gridRect.height}`);
        pathRef.current.setAttribute("d", d);
      };

      if (prefersReducedMotion) {
        gsap.set(cardsRef.current, { autoAlpha: 1, scale: 1 });
        if (window.matchMedia("(min-width: 1024px)").matches) {
          updatePathGeometry();
          if (pathRef.current) {
            gsap.set(pathRef.current, { drawSVG: "100%" });
          }
        }
        return;
      }

      const setHighlight = (activeIndex: number | null) => {
        overlayRefs.current.forEach((overlay, index) => {
          if (!overlay) return;
          const isActive = index === activeIndex;
          overlay.dataset.active = isActive ? "true" : "false";
          gsap.set(overlay, { opacity: isActive ? 1 : 0 });
        });
      };

      overlayRefs.current.forEach((overlay) => {
        if (!overlay) return;
        gsap.set(overlay, { opacity: 0 });
      });

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { autoAlpha: 0, scale: 0.5 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "center center",
              end: "center bottom",
              toggleActions: "play none reverse none",
              onEnter: () => setHighlight(index),
              onLeaveBack: () => setHighlight(index)
            }
          }
        );
      });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const firstCard = cardsRef.current[0];
        const lastCard = cardsRef.current[cardsRef.current.length - 1];
        const path = pathRef.current;

        if (!firstCard || !lastCard || !path) return;

        updatePathGeometry();

        const drawTween = gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: firstCard,
              start: "center center",
              endTrigger: lastCard,
              end: "center center",
              scrub: 0.6,
              invalidateOnRefresh: true,
              onRefreshInit: updatePathGeometry,
              onRefresh: updatePathGeometry
            }
          }
        );

        return () => {
          drawTween.kill();
        };
      });

      return () => {
        mm.revert();
        setHighlight(null);
      };
    },
    { scope: sectionRef }
  );

  return (
    <Section ref={sectionRef} className="w-full" innerClassName="w-full" useContentWrap={false}>
      <div
        ref={headerRef}
        className="content-wrap flex min-h-[100svh] flex-col items-center justify-center gap-3 text-center"
      >
        <h2 className="split-scale">WOLLT IHR MIT UNS GEHEN?</h2>
        <h3 className="relative h-[1.2em] w-full max-w-[34ch] overflow-hidden">
          <span ref={headlineFallbackRef}>JA? NEIN? VIELLEICHT? FALLS JA, DANN VIELLEICHT SO?</span>
          <span
            ref={headlineStageRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden items-center justify-center"
          >
            <span
              ref={phaseOneGroupRef}
              className="absolute inset-0 flex items-center justify-center gap-5 whitespace-nowrap"
            >
              {phaseOneHeadline.map((word, index) => (
                <span
                  key={word}
                  ref={(el) => {
                    phaseOneWordRefs.current[index] = el;
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
            <span
              ref={phaseTwoGroupRef}
              className="absolute inset-0 flex items-center justify-center gap-4 whitespace-nowrap"
            >
              {phaseTwoHeadline.map((word, index) => (
                <span
                  key={word}
                  ref={(el) => {
                    phaseTwoWordRefs.current[index] = el;
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </span>
        </h3>
      </div>

      <div ref={gridRef} className="content-wrap relative mt-32">
        <svg
          ref={pathSvgRef}
          className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-0 hidden -translate-x-1/2 lg:block"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative z-10 grid grid-cols-1 gap-x-32 gap-y-14 lg:grid-cols-2">
          {roadmapCards.map((card, index) => (
            <div
              key={card.title}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={
                "relative z-10 flex flex-col justify-center overflow-hidden rounded-[40px] border border-[#DBC18D]/30 bg-[linear-gradient(90deg,#080716_0%,#080716_100%)] p-16 transition-[border-color] duration-300 ease-out " +
                (index % 2 === 1 ? "lg:translate-y-1/2" : "")
              }
            >
              <div
                ref={(el) => {
                  overlayRefs.current[index] = el;
                }}
                data-active="false"
                className="roadmap-overlay absolute inset-0 transition-opacity duration-300 ease-out bg-[linear-gradient(90deg,#082940_0%,#080716_100%)]"
              />
              <div className="relative z-[1]">
                <h4 className="text-[clamp(1.125rem,1.45vw,1.25rem)] font-semibold text-white">{card.title}</h4>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-[clamp(1rem,1.05vw,1.125rem)] font-normal leading-normal text-[#DBC18D]">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
