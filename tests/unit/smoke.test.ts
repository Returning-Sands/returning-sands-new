import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("toolchain smoke", () => {
  it("runs a trivial Vitest assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("resolves the @/ path alias", () => {
    expect(nextConfig).toBeTypeOf("object");
  });
});
