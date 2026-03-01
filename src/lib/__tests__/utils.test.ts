import { describe, it, expect } from "vitest";
import { formatCurrency, formatPhone } from "../utils";

describe("formatCurrency", () => {
  it("formats kopecks to rubles", () => {
    const result = formatCurrency(150000);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("handles zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatPhone", () => {
  it("formats a valid 11-digit phone", () => {
    const result = formatPhone("79001234567");
    expect(result).toBeTruthy();
  });

  it("returns input for short numbers", () => {
    const result = formatPhone("123");
    expect(result).toBe("123");
  });

  it("handles empty string", () => {
    const result = formatPhone("");
    expect(result).toBe("");
  });
});
