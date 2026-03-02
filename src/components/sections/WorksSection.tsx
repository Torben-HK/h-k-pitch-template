"use client";

import { useRef } from "react";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { Section } from "@/components/layout/Section";

type WorkItem = {
  title: string;
  image: string;
  description?: string;
  href?: string;
};

const works: WorkItem[] = [
  {
    title: "Redaktionsplanung für Thought Leadership",
    image: "/assets/sections/works/Image20260302152602.png"
  },
  {
    title: "TalentRadar für Employer Branding",
    image: "/assets/sections/works/talent-radar.png"
  },
  {
    title: "KI-gestütztes Support-Framework für wiederkehrende Anfragen",
    image: "/assets/sections/works/ki-framework.png"
  },
  {
    title: "Jährlicher Markt- und Vertrauensreport",
    description: "Ein strukturierter Blick auf Chancen, Risiken und Entscheidungen.",
    image: "/assets/sections/works/trust-reports.png"
  },
  {
    title: "Leadership Summit für Entscheider",
    description:
      "Ein exklusives Format für strategischen Austausch auf Geschäftsführungs- und Leitungsebene.",
    image: "/assets/sections/works/summit.png"
  }
];

export default function WorksSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useSplitScale({ scope: sectionRef });

  return (
    <Section
      ref={sectionRef}
      className="mt-32 w-full lg:mt-64"
      innerClassName="flex w-full flex-col gap-16 lg:gap-32"
      useContentWrap={false}
    >
      <div className="content-wrap flex flex-col items-center gap-2 text-center">
        <h2 className="split-scale">IDEEN, DIE ZEIGEN, WIE WIR DENKEN</h2>
        <h3 className="split-scale">STRUKTUR STATT SHOW. INSPIRATIONEN AUS UNSERER CREW.</h3>
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10">
        {works.map((item, index) => (
          <div
            key={item.title}
            className={`group relative min-h-[480px] h-auto w-full overflow-hidden bg-cover bg-center bg-no-repeat transition lg:h-[100svh] ${index === 0 ? "md:col-span-2" : ""}`}
            style={{ backgroundImage: `url("${item.image}")` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(0deg,#080716_4.33%,rgba(8,7,22,0.70)_68.27%,rgba(0,0,0,0)_100%)] transition-opacity duration-300 ease-out group-hover:opacity-70" />
            <div
              className="relative z-10 flex h-full flex-col items-center justify-end p-6 text-center lg:p-16"
            >
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fs-ui-200 font-semibold leading-normal text-white transition duration-300 ease-out group-hover:[text-shadow:0_4px_16px_rgba(8,7,22,0.8)] normal-case hover:underline"
                >
                  {item.title}
                </a>
              ) : (
                <h3 className="text-fs-ui-200 font-semibold leading-normal text-white transition duration-300 ease-out group-hover:[text-shadow:0_4px_16px_rgba(8,7,22,0.8)] normal-case">
                  {item.title}
                </h3>
              )}
              {item.description ? (
                <p className="mt-2 text-fs-ui-100 font-normal leading-normal text-[#DBC18D] transition duration-300 ease-out group-hover:[text-shadow:0_4px_16px_rgba(8,7,22,0.8)]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
