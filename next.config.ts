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
    ];
  },
};

export default nextConfig;
