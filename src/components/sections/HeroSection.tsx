"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "@/components/typography/SplitText";

const TEXTS = [" kein Pitch.", " ein System."];


function HeroTypedTitle() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const [text, setText] = useState(TEXTS[0]);
  const [slotWidth, setSlotWidth] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const delayedRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncDesktop = () => setIsDesktop(mediaQuery.matches);
    syncDesktop();
    mediaQuery.addEventListener("change", syncDesktop);

    return () => {
      mediaQuery.removeEventListener("change", syncDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setSlotWidth(null);
      return;
    }

    const updateSlotWidth = () => {
      const maxWidth = measureRefs.current.reduce((largest, el) => {
        if (!el) return largest;
        return Math.max(largest, el.getBoundingClientRect().width);
      }, 0);

      if (maxWidth > 0) {
        setSlotWidth(Math.ceil(maxWidth) + 8);
      }
    };

    const rafId = window.requestAnimationFrame(updateSlotWidth);
    const handleResize = () => updateSlotWidth();
    window.addEventListener("resize", handleResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateSlotWidth).catch(() => undefined);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktop]);

  useEffect(() => {
    let index = 0;
    let isMounted = true;

    const run = () => {
      if (!isMounted) return;
      const nextText = TEXTS[index];
      setText(nextText);

      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll<HTMLElement>(
          "[data-split-child]"
        );

        timelineRef.current?.kill();
        delayedRef.current?.kill();
        gsap.set(chars, { opacity: 0, x: -14 });

        const tl = gsap.timeline({
          onComplete: () => {
            index = (index + 1) % TEXTS.length;
            delayedRef.current = gsap.delayedCall(0.3, run);
          }
        });
        timelineRef.current = tl;

        tl.to(chars, {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.03,
          ease: "power2.out"
        })
          .to(chars, { duration: 3 })
          .to(chars, {
            opacity: 0,
            x: -14,
            duration: 0.35,
            stagger: {
              each: 0.02,
              from: "end"
            },
            ease: "power2.in"
          });
      });
    };

    run();

    return () => {
      isMounted = false;
      timelineRef.current?.kill();
      delayedRef.current?.kill();
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className="flex items-start min-h-[1.1em] shrink-0 leading-[1.1] align-baseline"
      style={isDesktop ? { width: slotWidth ? `${slotWidth}px` : "clamp(18rem, 40vw, 34rem)" } : undefined}
    >
      <SplitText
        text={text}
        split="chars"
        as="h1"
        className="m-0 whitespace-pre text-h1 font-extrabold uppercase text-white"
        childClassName="inline-block"
      />
      {isDesktop ? (
        <span className="pointer-events-none absolute -z-10 opacity-0" aria-hidden="true">
          {TEXTS.map((phrase, index) => (
            <h1
              key={phrase}
              ref={(el) => {
                measureRefs.current[index] = el;
              }}
              className="m-0 block w-max whitespace-pre text-h1 font-extrabold uppercase"
            >
              {phrase}
            </h1>
          ))}
        </span>
      ) : null}
    </span>
  );
}

export default function HeroSection() {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rows = [
    {
      direction: "left",
      images: [
        "/assets/sections/hero/marquee-1.jpg",
        "/assets/sections/hero/marquee-2.png",
        "/assets/sections/hero/marquee-3.png",
        "/assets/sections/hero/marquee-4.png"
      ]
    },
    {
      direction: "right",
      images: [
        "/assets/sections/hero/marquee-5.png",
        "/assets/sections/hero/marquee-6.png",
        "/assets/sections/hero/marquee-7.png",
        "/assets/sections/hero/marquee-8.png"
      ]
    },
    {
      direction: "left",
      images: [
        "/assets/sections/hero/marquee-9.png",
        "/assets/sections/hero/marquee-10.png",
        "/assets/sections/hero/marquee-11.png",
        "/assets/sections/hero/marquee-12.png"
      ]
    },
    {
      direction: "right",
      images: [
        "/assets/sections/hero/marquee-1.jpg",
        "/assets/sections/hero/marquee-2.png",
        "/assets/sections/hero/marquee-3.png",
        "/assets/sections/hero/marquee-4.png"
      ]
    }
  ];

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const tweens = trackRefs.current
      .map((track, index) => {
        if (!track) return null;
        if (index % 2 === 1) {
          return gsap.fromTo(
            track,
            { x: "-50%" },
            {
              x: "0%",
              duration: 70,
              ease: "none",
              repeat: -1
            }
          );
        }

        return gsap.to(track, {
          x: "-=50%",
          duration: 70,
          ease: "none",
          repeat: -1
        });
      })
      .filter(Boolean) as gsap.core.Tween[];

    return () => {
      tweens.forEach((tween) => tween.kill());
    };
  }, { scope: marqueeRef });

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#080716] px-6 py-10">
      <div
        ref={marqueeRef}
        className="absolute inset-0 overflow-hidden pointer-events-none marquee-container z-0"
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute inset-0 z-10 block bg-[rgba(8,7,22,0.80)] lg:hidden" />
        <div className="pointer-events-none absolute inset-0 z-10 hidden bg-[linear-gradient(0deg,rgba(8,7,22,0.50)_30%,rgba(8,7,22,0.90)_100%)] lg:block" />
        <div className="marquee h-full w-full grid grid-rows-4 gap-4 z-0 relative scale-[1.5] rotate-[13deg] opacity-[0.7]">
          {rows.map((row, rowIndex) => (
            <div
              key={`marquee-row-${rowIndex}`}
              ref={(el) => {
                trackRefs.current[rowIndex] = el;
              }}
              className="marquee-track flex w-[200vw] gap-4"
            >
              <div className="marquee-group grid grid-cols-4 items-stretch gap-4 h-full w-full">
                {row.images.map((src, imageIndex) => (
                  <div
                    key={`marquee-row-${rowIndex}-image-${imageIndex}`}
                    className="marquee-item rounded-xl overflow-hidden"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover object-center" />
                  </div>
                ))}
              </div>
              <div className="marquee-group grid grid-cols-4 items-stretch gap-4 h-full w-full">
                {row.images.map((src, imageIndex) => (
                  <div
                    key={`marquee-row-${rowIndex}-image-dup-${imageIndex}`}
                    className="marquee-item rounded-xl overflow-hidden"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover object-center" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="content-wrap relative z-20 flex flex-1 flex-col">
        <div className="flex w-full justify-center pt-4 sm:pt-6">
          <img
            src="/assets/page/hk-logo.svg"
            alt="Hein & Kollegen"
            className="h-[50px] w-auto"
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-12 text-center">
            <div className="relative flex flex-col items-center text-center lg:inline-flex lg:flex-row lg:items-stretch lg:whitespace-nowrap">
              <h1 className="m-0 text-h1 font-extrabold uppercase text-white">Das ist</h1>
              <HeroTypedTitle />
            </div>
            <p className="m-0 text-fs-ui-300 font-medium text-white text-shadow-[0_3px_10px_rgba(0,0,0,0.8)] [font-family:var(--font-display)]">
              {"Ein System für planbares Wachstum in Ihrem Unternehmen."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


