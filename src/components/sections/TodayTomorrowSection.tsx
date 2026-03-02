"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/typography/SplitText";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { Section } from "@/components/layout/Section";
import { scheduleScrollTriggerRefresh } from "@/lib/scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

type TabKey = "heute" | "potenziale" | "morgen";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  list?: string[];
  bodyAfterList?: string;
};

type Tab = {
  key: TabKey;
  label: string;
  items: Item[];
};

const todayItems: Item[] = [
  {
    id: "today-1",
    title: "Klare Leistungsfelder mit gemeinsamer Zielrichtung",
    subtitle: "Beratung. Umsetzung. Weiterentwicklung.",
    body:
      "Ihre Leistungen greifen bereits ineinander. Dieses Fundament ermöglicht eine durchgängige Kundenerfahrung und stärkt die Positionierung."
  },
  {
    id: "today-2",
    title: "Kundengewinnung über Netzwerk und Empfehlungen",
    subtitle: "Vertrauen wirkt, ist aber nur begrenzt skalierbar.",
    body:
      "Neue Anfragen entstehen aktuell vor allem über persönliche Kontakte, Empfehlungen und bestehende Beziehungen."
  },
  {
    id: "today-3",
    title: "Starke Bindung bei bestehenden Kunden",
    subtitle: "Langfristiges Vertrauen ist ein echter Wettbewerbsvorteil.",
    body:
      "Die bestehenden Kundenbeziehungen zeigen Verlässlichkeit und Qualität. Dieses Vertrauen kann strategisch in planbares Wachstum übersetzt werden."
  }
];

const potentialsItems: Item[] = [
  {
    id: "pot-1",
    title: "Mehr Sichtbarkeit in relevanten Entscheidungsphasen",
    subtitle: "Zusätzliche Präsenz schafft planbare Nachfrage.",
    body:
      "Potenzial liegt in gezielter Sichtbarkeit in Suchmaschinen, Fachmedien, sozialen Netzwerken und KI-gestützten Rechercheumfeldern."
  },
  {
    id: "pot-2",
    title: "Schärfere Positionierung als strategischer Partner",
    subtitle: "Differenzierung statt Austauschbarkeit.",
    body:
      "Mit einem klaren Nutzenversprechen wird Ihr Unternehmen stärker als strategischer Partner wahrgenommen und nicht nur als operativer Dienstleister."
  },
  {
    id: "pot-3",
    title: "Marktdynamik als Wachstumshebel nutzen",
    subtitle: "Veränderungen im Markt erhöhen den Entscheidungsdruck.",
    body:
      "Wer Orientierung gibt und komplexe Entscheidungen vereinfacht, gewinnt früher Vertrauen und baut nachhaltige Nachfrage auf."
  }
];

const tomorrowItems: Item[] = [
  {
    id: "mor-1",
    title: "Systematische Sichtbarkeit",
    subtitle:
      "Ihr Unternehmen ist dort präsent, wo Entscheider recherchieren, vergleichen und priorisieren.",
    body: "",
    list: [
      "Suchmaschinen",
      "KI-gestützte Rechercheumfelder",
      "relevante Netzwerke und Fachplattformen"
    ],
    bodyAfterList:
      "Nicht zufallsgetrieben, sondern mit klaren Prozessen, messbarer Sichtbarkeit und planbaren qualifizierten Anfragen."
  },
  {
    id: "mor-2",
    title: "Klare Positionierung als strategischer Partner",
    subtitle:
      "Der Markt nimmt Ihr Unternehmen als verlässlichen Partner wahr. Als starke Instanz für:",
    body: "",
    list: [
      "klare Entscheidungsgrundlagen",
      "wirksame Umsetzung",
      "nachhaltige Ergebnisse"
    ],
    bodyAfterList:
      "Leistungen werden als zusammenhängendes System verstanden und nicht als isolierte Einzelmaßnahmen."
  },
  {
    id: "mor-3",
    title: "Skalierbares Wachstumsmodell mit Substanz",
    subtitle:
      "Ihr Unternehmen wird zur ersten Wahl, wenn Qualität, Verlässlichkeit und Verantwortung entscheidend sind. Wahrgenommen werden:",
    body: "",
    list: [
      "fachliche Kompetenz",
      "konsistente Qualität",
      "belastbare Prozesse",
      "langfristige Wirksamkeit"
    ],
    bodyAfterList:
      "So entsteht eine Positionierung, die nicht austauschbar ist."
  }
];

const tabs: Tab[] = [
  {
    key: "heute",
    label: "Heute",
    items: todayItems
  },
  {
    key: "potenziale",
    label: "Potenziale",
    items: potentialsItems
  },
  {
    key: "morgen",
    label: "Morgen",
    items: tomorrowItems
  }
];

export default function TodayTomorrowSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("heute");
  const sectionRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const hasMountedTabRefreshRef = useRef(false);

  useSplitScale({ scope: sectionRef });

  useGSAP(
    () => {
      if (!sectionRef.current || !tabsRef.current || !contentRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;

      if (prefersReducedMotion || isMobile) {
        gsap.set([tabsRef.current, contentRef.current], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        [tabsRef.current, contentRef.current],
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 2,
          ease: "power3.out",
          stagger: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      );
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    if (!contentRef.current) return;

    if (!hasMountedTabRefreshRef.current) {
      hasMountedTabRefreshRef.current = true;
      return;
    }

    scheduleScrollTriggerRefresh({ trailingDelayMs: 140 });
  }, [activeTab]);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || typeof ResizeObserver === "undefined") return;

    let previousHeight = Math.round(contentEl.getBoundingClientRect().height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextHeight = Math.round(
        entry?.contentRect.height ?? contentEl.getBoundingClientRect().height
      );
      if (Math.abs(nextHeight - previousHeight) < 1) return;
      previousHeight = nextHeight;
      scheduleScrollTriggerRefresh({ trailingDelayMs: 120 });
    });

    observer.observe(contentEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleTabClick = (key: TabKey) => {
    if (key === activeTab) return;
    setActiveTab(key);
  };

  return (
    <Section
      ref={sectionRef}
      className="flex w-full justify-center bg-[#080716] lg:!px-0"
      innerClassName="w-full"
      useContentWrap={false}
    >
      <div className="content-wrap">
        <div className="flex flex-col gap-16 text-center text-pretty">
          <SplitText
            text="HEUTE VS. MORGEN"
            split="words"
            as="h2"
            className="split-scale relative z-[1] text-fs-ui-800 font-extrabold uppercase tracking-wide text-white [font-family:var(--font-display)]"
            childClassName="inline-block"
          />
          <div className="flex flex-col gap-8">
            <div ref={tabsRef} className="flex w-full items-center justify-center pb-8">
              <div className="tabs-glow relative z-[1] flex flex-row flex-wrap items-center justify-center gap-4">
                {tabs.map((tab) => {
                  const isActive = tab.key === activeTab;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabClick(tab.key)}
                      className={
                        "relative z-10 rounded-full border border-white/50 px-6 py-3 text-fs-ui-100 font-normal uppercase tracking-widest transition-colors duration-300 " +
                        (isActive
                          ? "bg-[#DBC18D] text-[#080716] !border-[#DBC18D]"
                          : "text-white hover:bg-[#DBC18D] hover:text-[#080716] hover:!border-[#DBC18D]")
                      }
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div ref={contentRef} className="w-full relative z-[1]">
              {tabs.map((tab) => (
                <div
                  key={tab.key}
                  className={
                    "w-full rounded-[40px] bg-[#080716] p-4 text-left text-white transition-opacity duration-300 lg:px-24 " +
                    (tab.key === activeTab ? "block opacity-100" : "hidden opacity-0")
                  }
                >
                  <div className="flex flex-col gap-6">
                    {tab.items.map((item) => (
                      <div
                        key={item.id}
                        className="card-gradient-hover flex flex-row items-center gap-12 rounded-[40px] border border-[#DBC18D]/30 p-4 transition-[border-color] duration-300 ease-out hover:border-[#DBC18D]/50 [--card-bg:linear-gradient(0deg,#080716_0%,#080716_100%)] [--card-hover-bg:linear-gradient(0deg,#082940_0%,#080716_100%)] lg:p-8"
                      >
                        <div className="card-content flex w-full flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:gap-12 lg:text-left">
                          {/** keep layout stable per item */}
                          <div className="shrink-0 grow-0 basis-auto">
                            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#DBC18D]/30 bg-transparent lg:h-[80px] lg:w-[80px]">
                              <img
                                src="/assets/icons/Vector.svg"
                                alt=""
                                className="h-auto w-3 lg:w-4"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col gap-3 p-0">
                              <h3 className="text-fs-ui-200 font-semibold text-white normal-case [font-family:var(--font-display)]">
                                {item.title}
                              </h3>
                              <h4
                                className={
                                  "text-fs-ui-100 text-[#DBC18D] [font-family:var(--font-display)] " +
                                  (tab.key === "morgen" ? "font-bold" : "font-normal")
                                }
                              >
                                {item.subtitle}
                              </h4>
                              {tab.key === "morgen" && item.body ? (
                                <p className="text-fs-ui-100 font-normal text-[#DBC18D] [font-family:var(--font-display)]">
                                  {item.body}
                                </p>
                              ) : null}
                            </div>
                            {tab.key !== "morgen" && item.body ? (
                              <p className="mt-5 text-fs-ui-100 font-normal text-white [font-family:var(--font-display)]">
                                {item.body}
                              </p>
                            ) : null}
                            {item.list ? (
                              <ul className="mt-5 w-full list-disc pl-5 text-left text-fs-ui-100 font-normal text-white [font-family:var(--font-display)]">
                                {item.list.map((entry) => (
                                  <li key={entry} className="text-fs-ui-100">
                                    {entry}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {item.bodyAfterList ? (
                              <p className="mt-5 text-fs-ui-100 font-normal text-white [font-family:var(--font-display)]">
                                {item.bodyAfterList}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
