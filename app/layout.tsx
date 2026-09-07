import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Inter, Amiri } from "next/font/google";
import "./globals.css";

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
  title: "One Minute Iman · a verified du'ā for what you're carrying",
  description:
    "Tell it how you feel and find a du'ā, verse or teaching for that moment. Every entry is traced to the Qur'an or an authenticated hadith, with its grading shown.",
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
