import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/notebook", "/admin", "/beta"],
      },
    ],
    sitemap: "https://www.gadit.app/sitemap.xml",
  };
}
