import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Inter, Amiri } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const arabic = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "One Minute Iman · find a duʿā for how you feel",
    template: "%s · One Minute Iman",
  },
  description:
    "Say how you feel and get the duʿā, verse or hadith for that moment. Every entry is traced to the Qurʾan or an authenticated hadith and shows its grading.",
  applicationName: SITE_NAME,
  keywords: [
    "dua", "duas", "supplication", "islamic dua for anxiety", "dua for sadness",
    "authentic hadith", "sahih hadith", "quran translation", "dua for forgiveness",
    "morning and evening adhkar", "dua for difficulty", "islamic supplications",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: SITE_URL,
    title: "One Minute Iman · find a duʿā for how you feel",
    description:
      "Say how you feel and get the duʿā, verse or hadith for that moment, with its source and authenticity grading shown.",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Minute Iman",
    description:
      "Say how you feel and get the duʿā, verse or hadith for that moment, every one traced to a primary source.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  category: "religion",
};

/** Site-level structured data: identifies the site and exposes the search box. */
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Verified duʿās, Qurʾan verses and authenticated hadith, searchable by how you feel.",
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/browse?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-[var(--paper)]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <Star className="h-[26px] w-[26px] text-[var(--green)] transition-transform duration-700 group-hover:rotate-45" />
          <span className="display text-[15.5px] tracking-[0.15em] text-[var(--green)] uppercase">
            One Minute Iman
          </span>
        </Link>
        <div className="flex items-center gap-1 text-[13.5px]">
          <Link
            href="/quran"
            className="rounded-full px-3 py-1.5 text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            Qur&apos;an
          </Link>
          <Link
            href="/hadith"
            className="rounded-full px-3 py-1.5 text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            Hadith
          </Link>
          <Link
            href="/browse"
            className="rounded-full px-3 py-1.5 text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--green)]"
          >
            Du&apos;ās
          </Link>
          <Link
            href="/authenticity"
            className="ml-1 rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--green)] transition-all hover:border-[var(--sage)] hover:bg-[var(--card)]"
          >
            How we verify
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--line-soft)] bg-[var(--paper-2)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--ink-faint)]">
          Every entry here is traced to the Qur&apos;an or to a hadith in a primary
          collection, and shows its grading.{" "}
          <Link href="/authenticity" className="text-[var(--sage)] underline underline-offset-4">
            Read the method
          </Link>
          . This site is a starting point for reflection, not a substitute for a
          qualified teacher.
        </p>
        <p className="mt-6 text-[12px] text-[var(--ink-faint)]">
          Qur&apos;an text and translation via Quran.com · Hadith references follow
          Sunnah.com numbering
        </p>
      </div>
    </footer>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none">
      <rect x="26" y="26" width="48" height="48" stroke="currentColor" strokeWidth="3" />
      <rect
        x="26"
        y="26"
        width="48"
        height="48"
        stroke="currentColor"
        strokeWidth="3"
        transform="rotate(45 50 50)"
      />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${arabic.variable}`}
        suppressHydrationWarning
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
