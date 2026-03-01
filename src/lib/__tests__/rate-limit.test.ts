import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = "test-" + Math.random();
    const r1 = rateLimit(key, 3, 60_000);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, 3, 60_000);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks requests over limit", () => {
    const key = "test-block-" + Math.random();
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const r3 = rateLimit(key, 2, 60_000);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = "test-reset-" + Math.random();
    rateLimit(key, 1, 1);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const r = rateLimit(key, 1, 1);
        expect(r.success).toBe(true);
        resolve();
      }, 10);
    });
  });
});
