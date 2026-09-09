import type { Metadata } from "next";
import Link from "next/link";
import { OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "What happens to what you type",
  description:
    "The search on One Minute Iman runs in your browser. What you type is never sent to a server, stored, or measured.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "What happens to what you type on One Minute Iman",
    description: "The search runs in your browser. What you type is never sent anywhere.",
    url: "/privacy",
    type: "article",
    images: [OG_IMAGE],
  },
};

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-10 pb-20 sm:pt-16">
      <h1 className="display text-[38px] leading-tight text-[var(--ink)] sm:text-[46px]">
        What happens to what you type
      </h1>
      <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
        People type things into this site that they have not told anyone. It matters that
        the answer to this question is short and true.
      </p>

      <h2 className="display mt-12 text-[26px] text-[var(--ink)]">The search never leaves your browser</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        Everything the site knows about situations and phrasings is downloaded with the
        page, and the matching runs on your own device. What you type is never sent to a
        server, because there is no server to send it to. It is never written to a URL, so
        it cannot end up in a browser history or a shared link. Nothing you type is
        stored.
      </p>

      <h2 className="display mt-12 text-[26px] text-[var(--ink)]">There is no analytics on this site</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        No analytics, no advertising pixel, no session recording, no cookie banner,
        because there are no cookies to ask about. The site has three code dependencies
        and none of them report anything back. That also means nobody knows which pages
        are read or which searches fail, which is a real cost: improvements have to come
        from people writing in rather than from watching them.
      </p>

      <h2 className="display mt-12 text-[26px] text-[var(--ink)]">What is stored on your device</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        If you save an entry, the list of what you saved is kept in your browser&apos;s
        local storage on that device. It is not an account and it is not synced. Clearing
        your browser data removes it, and it will not appear on your other devices.
      </p>

      <h2 className="display mt-12 text-[26px] text-[var(--ink)]">What is requested from elsewhere</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        Pages load their fonts, styles and text from this site alone. Two things reach
        another server, and only when you ask for them: pressing Listen on a Qur&apos;anic
        entry fetches the recitation from Quran.com, and following a source link takes you
        to Quran.com or Sunnah.com. Those sites have their own policies. Nothing you typed
        travels with either request.
      </p>

      <h2 className="display mt-12 text-[26px] text-[var(--ink)]">Hosting</h2>
      <p className="mt-4 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
        The site is served as static files by Vercel, which keeps standard server logs
        including IP addresses, as any web host does. That is a record of pages requested,
        not of anything typed into the search.
      </p>

      <p className="mt-12 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        If any of this stops being accurate, it should be corrected here first.{" "}
        <Link href="/corrections" className="text-[var(--sage)] underline underline-offset-4">
          Tell us if you find it wrong
        </Link>
        .
      </p>
    </div>
  );
}
