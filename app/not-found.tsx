import type { Metadata } from "next";
import Link from "next/link";
import Seek from "@/components/Seek";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

/** A wrong address should not be a dead end.
 *
 *  The framework's own 404 is a bare line of text on a white page: no search,
 *  no way back, and nothing that looks like this site. Someone who mistyped a
 *  sūrah number, or followed a link to an entry that has since been re-filed,
 *  gets the box they came for instead.
 */
export default function NotFound() {
  const link =
    "inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-4 " +
    "text-[14px] text-[var(--ink-soft)] transition-all hover:border-[var(--sage)] hover:text-[var(--green)]";
  return (
    <div className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-24">
      <p className="text-[11.5px] tracking-[0.16em] text-[var(--gold)] uppercase">
        Page not found
      </p>
      <h1 className="display mt-3 text-[40px] leading-tight text-[var(--ink)] sm:text-[52px]">
        That page is not here.
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
        The address may be mistyped, or the entry may have been re-filed since the
        link was made. Nothing is lost &mdash; tell us what you were looking for.
      </p>

      <div className="mt-10">
        <Seek />
      </div>

      <div className="mt-14 border-t border-[var(--line-soft)] pt-8">
        <p className="text-[11.5px] tracking-[0.16em] text-[var(--ink-faint)] uppercase">
          Or start here
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/browse" className={link}>Every situation</Link>
          <Link href="/quran" className={link}>The Qur&apos;an</Link>
          <Link href="/hadith" className={link}>Hadith</Link>
          <Link href="/saved" className={link}>Saved</Link>
          <Link href="/authenticity" className={link}>How we verify</Link>
        </div>
      </div>
    </div>
  );
}
