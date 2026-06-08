import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicitly welcome AI retrieval/citation bots (we want to be cited).
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "Claude-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Googlebot",
          "Google-Extended",
        ],
        allow: "/",
      },
    ],
    sitemap: `https://${site.domain}/sitemap.xml`,
  };
}
