import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import NotFound from "@/app/not-found";
import { site } from "@/content/site";
import { organizationSchema } from "@/lib/jsonld";

// Footer and TopNav are covered in layout-components.test.tsx; this file
// checks the 404 page and the Organization JSON-LD the root layout emits.

afterEach(cleanup);

describe("NotFound page (Req 1.9, 16.13)", () => {
  it("renders the VISA DENIED heading beside a DENIED stamp overprint and a link home", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "VISA DENIED — page not found" }),
    ).toBeInTheDocument();
    // The overprint is real text, not aria-hidden, because it carries meaning.
    expect(screen.getByText("DENIED")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to the home page" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("organizationSchema (Req 16.10)", () => {
  it("builds an Organization block with name, url, logo and both social profiles", () => {
    const data = organizationSchema(site);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBe(site.name);
    expect(data.url).toBe(site.url);
    expect(data.logo).toBe(`${site.url}/opengraph-image`);
    expect(data.sameAs).toEqual([site.social.instagram, site.social.linkedin]);
    // Must serialise cleanly for the <script type="application/ld+json"> body.
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});
