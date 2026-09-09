import type { Metadata } from "next";
import SavedList from "@/components/SavedList";

export const metadata: Metadata = {
  title: "Saved",
  description: "The entries you have kept on this device.",
  alternates: { canonical: "/saved" },
  // Nothing here is the same for two readers, so there is nothing for a search
  // engine to index.
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-20 sm:pt-16">
      <h1 className="display text-[38px] leading-tight text-[var(--ink)] sm:text-[46px]">
        Saved
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
        Kept on this device only. There is no account and nothing is sent anywhere, which
        also means these will not follow you to another phone or survive clearing your
        browser data.
      </p>
      <SavedList />
    </div>
  );
}
