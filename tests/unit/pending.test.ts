import { describe, expect, it } from "vitest";
import { isPending, present } from "@/lib/pending";

describe("isPending", () => {
  it("treats null and undefined as pending", () => {
    expect(isPending(null)).toBe(true);
    expect(isPending(undefined)).toBe(true);
  });

  it("treats empty and whitespace-only strings as pending", () => {
    expect(isPending("")).toBe(true);
    expect(isPending("   ")).toBe(true);
    expect(isPending("\n\t ")).toBe(true);
  });

  it("treats a non-empty string as present", () => {
    expect(isPending("x")).toBe(false);
  });

  it("treats an object as pending only when every field is pending", () => {
    expect(isPending({ a: "", b: null })).toBe(true);
    expect(isPending({ a: "", b: "x" })).toBe(false);
  });

  it("treats non-string, non-object values as present", () => {
    expect(isPending(0)).toBe(false);
    expect(isPending(false)).toBe(false);
  });
});

describe("present", () => {
  it("is the negation of isPending and narrows the type", () => {
    const pendingValue: string | "" | null = "";
    const filledValue: string | "" | null = "hello";
    expect(present(pendingValue)).toBe(false);
    expect(present(filledValue)).toBe(true);
    if (present(filledValue)) {
      expect(filledValue.toUpperCase()).toBe("HELLO");
    }
  });
});
