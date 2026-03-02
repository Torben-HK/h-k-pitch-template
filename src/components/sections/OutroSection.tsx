"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Section } from "@/components/layout/Section";

const baseStarColor = "#DBC18D";
const glowStarColor = "#f5e7c8ff";
const glowTextShadow = "0 0 10px rgba(240,223,184,0.7), 0 0 18px rgba(240,223,184,0.3)";
const noGlowTextShadow = "0 0 0 rgba(0,0,0,0)";

export default function OutroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const starsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const bgGlowLayerRef = useRef<HTMLDivElement | null>(null);
  const topLeftGlowRef = useRef<HTMLDivElement | null>(null);
  const bottomRightGlowRef = useRef<HTMLDivElement | null>(null);
  const hasRevealedRef = useRef(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const logo = logoRef.current;
      const stars = starsRef.current.filter(Boolean) as HTMLSpanElement[];
      const bgGlowLayer = bgGlowLayerRef.current;
      const topLeftGlow = topLeftGlowRef.current;
      const bottomRightGlow = bottomRightGlowRef.current;

      if (!section || !logo || !stars.length || !bgGlowLayer || !topLeftGlow || !bottomRightGlow) return;

      gsap.registerPlugin(ScrollTrigger);
      hasRevealedRef.current = false;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(logo, { opacity: 1, scale: 1, y: 0 });
        gsap.set(stars, {
          opacity: 1,
          scale: 1,
          y: 0,
          color: baseStarColor,
          textShadow: noGlowTextShadow
        });
        gsap.set(bgGlowLayer, { opacity: 0 });
        gsap.set(topLeftGlow, { opacity: 0.12, scale: 0.96 });
        gsap.set(bottomRightGlow, { opacity: 0.2, scale: 1.04 });
        return;
      }

      gsap.set(logo, {
        opacity: 0,
        scale: 0.7,
        transformOrigin: "center center"
      });
      gsap.set(stars, {
        opacity: 0,
        scale: 0.7,
        y: 24,
        color: baseStarColor,
        textShadow: noGlowTextShadow,
        transformOrigin: "center center"
      });
      gsap.set(bgGlowLayer, { opacity: 0 });
      gsap.set(topLeftGlow, {
        opacity: 0.12,
        scale: 0.96,
        transformOrigin: "center center"
      });
      gsap.set(bottomRightGlow, {
        opacity: 0.2,
        scale: 1.04,
        transformOrigin: "center center"
      });

      const bgGlowTimeline = gsap.timeline({
        paused: true,
        repeat: -1
      });

      bgGlowTimeline
        .to(
          topLeftGlow,
          {
            opacity: 0.2,
            scale: 1.04,
            duration: 4,
            ease: "sine.inOut"
          },
          0
        )
        .to(
          topLeftGlow,
          {
            opacity: 0.12,
            scale: 0.96,
            duration: 4,
            ease: "sine.inOut"
          },
          4
        )
        .to(
          bottomRightGlow,
          {
            opacity: 0.12,
            scale: 0.96,
            duration: 4,
            ease: "sine.inOut"
          },
          0
        )
        .to(
          bottomRightGlow,
          {
            opacity: 0.2,
            scale: 1.04,
            duration: 4,
            ease: "sine.inOut"
          },
          4
        );

      const setGlowVisibility = (visible: boolean) => {
        gsap.killTweensOf(bgGlowLayer);
        gsap.to(bgGlowLayer, {
          opacity: visible ? 1 : 0,
          duration: visible ? 2 : 0.6,
          ease: "power1.out"
        });
      };

      const visibilityTrigger = ScrollTrigger.create({
        trigger: section,
        start: "bottom-=100 bottom",
        onEnter: () => {
          if (!hasRevealedRef.current) return;
          setGlowVisibility(true);
          bgGlowTimeline.resume();
        },
        onEnterBack: () => {
          if (!hasRevealedRef.current) return;
          setGlowVisibility(true);
          bgGlowTimeline.resume();
        },
        onLeaveBack: () => {
          setGlowVisibility(false);
          bgGlowTimeline.pause();
        }
      });

      const idleTimeline = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 8
      });

      idleTimeline
        .to(stars, {
          color: glowStarColor,
          textShadow: glowTextShadow,
          duration: 0.2,
          stagger: 0.1,
          ease: "power1.out"
        })
        .to(
          stars,
          {
            color: baseStarColor,
            textShadow: noGlowTextShadow,
            duration: 0.2,
            stagger: 0.1,
            ease: "power1.out"
          },
          0.04
        );

      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "bottom-=100 bottom",
          toggleActions: "play none none none",
          once: true
        }
      });

      revealTimeline
        .call(() => {
          bgGlowTimeline.play(0);
        }, [], 0)
        .to(logo, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        })
        .to(
          stars,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "elastic.out(1,0.6)"
          },
          "+=0.2"
        )
        .call(() => {
          hasRevealedRef.current = true;
          setGlowVisibility(true);
          bgGlowTimeline.play(0);
          idleTimeline.play(0);
        });

      return () => {
        gsap.killTweensOf(bgGlowLayer);
        revealTimeline.kill();
        idleTimeline.kill();
        bgGlowTimeline.kill();
        visibilityTrigger.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <Section
      ref={sectionRef}
      className="relative mt-48 overflow-hidden bg-[#080716]"
      innerClassName="relative w-full flex items-center justify-center"
      centerY
      useContentWrap={false}
    >
      <div
        ref={bgGlowLayerRef}
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div
          ref={topLeftGlowRef}
          className="absolute -left-[34vw] -top-[28vh] h-[clamp(240px,48vw,532px)] w-[clamp(420px,90vw,920px)] rounded-[9999px] bg-[rgba(255,255,255,0.5)] blur-[64px] [transform:rotate(-147deg)]"
        />
        <div
          ref={bottomRightGlowRef}
          className="absolute -bottom-[28vh] -right-[34vw] h-[clamp(240px,48vw,532px)] w-[clamp(420px,90vw,920px)] rounded-[9999px] bg-[rgba(255,255,255,0.5)] blur-[64px] [transform:rotate(33deg)]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2">
        <img
          ref={logoRef}
          src="/assets/page/hk-logo.svg"
          alt="Hein & Kollegen"
          className="h-[64px] w-auto"
        />
        <div
          className="flex items-center gap-[0.2em] text-[clamp(1.75rem,3.2vw,2.5rem)] text-[#DBC18D]"
          aria-label="5 stars"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              ref={(el) => {
                starsRef.current[index] = el;
              }}
            >
              {"\u2605"}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
