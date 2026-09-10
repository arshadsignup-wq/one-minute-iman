import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /d/afflicted showed the waking supplication under the title of the one
      // said on seeing someone afflicted: its anchor matched the wrong hadith,
      // and the correct text was already published at /d/seeing-affliction.
      {
        source: "/d/afflicted",
        destination: "/d/seeing-affliction",
        permanent: true,
      },

      // Eleven pairs of entries showed the same Qur'anic verse, with the same
      // Arabic and the same translation, differing only in framing. They were
      // merged into the stronger page of each pair and these point at it.
      { source: "/d/hardship-with-ease", destination: "/d/ease-after-hardship", permanent: true },
      { source: "/d/do-not-despair-of-mercy", destination: "/d/never-despair", permanent: true },
      { source: "/d/say-my-lord-increase-me", destination: "/d/knowledge", permanent: true },
      { source: "/d/if-you-are-grateful", destination: "/d/gratitude", permanent: true },
      { source: "/d/lightened-after", destination: "/d/burden", permanent: true },
      { source: "/d/do-not-despair-of-relief", destination: "/d/never-give-up-hope", permanent: true },
      { source: "/d/reward-without-measure", destination: "/d/patience-reward", permanent: true },
      { source: "/d/he-answers-the-call", destination: "/d/i-am-near", permanent: true },
      { source: "/d/softened-toward-them", destination: "/d/once-decided", permanent: true },
      { source: "/d/hold-to-forgiveness", destination: "/d/repel-with-better", permanent: true },
      { source: "/d/a-goodly-life-for-both", destination: "/d/a-good-life", permanent: true },
    ];
  },
};

export default nextConfig;
