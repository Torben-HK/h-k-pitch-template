import "./globals.css";
import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollTriggerStabilityProvider from "@/components/providers/ScrollTriggerStabilityProvider";
import PageBootProvider from "@/components/providers/PageBootProvider";
import PageLoader from "@/components/ui/PageLoader";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "800"]
});

const ralewayBody = Raleway({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "800"]
});

export const metadata: Metadata = {
  title: "Pitch Template | Hein & Kollegen",
  description:
    "Modulares Pitch-Template für kundenneutrale Präsentationen mit Next.js, Tailwind und GSAP."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <style>{`@media(min-width:0px){html {padding-bottom: 44px; box-sizing: border-box;}}`}</style>
      </head>
      <body className={`${raleway.variable} ${ralewayBody.variable}`}>
        <PageBootProvider>
          <ScrollTriggerStabilityProvider />
          <CustomCursor />
          {children}
          <div id="ProvenExpert_widgetbar_container" />
          <Script
            src="https://www.provenexpert.com/widget/bar_hein-kollegen.js?style=black&feedback=1"
            strategy="afterInteractive"
          />
          <PageLoader />
        </PageBootProvider>
      </body>
    </html>
  );
}
