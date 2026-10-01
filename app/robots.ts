// Serves /robots.txt (Requirement 16.8). Allows all crawlers and references
// the sitemap; the noindex pages opt out via their own `robots` meta (16.13).
import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/sitemap";

export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
