import { describe, it, expect } from "vitest";
import { parseCSV } from "../import";

describe("parseCSV", () => {
  it("parses simple CSV", () => {
    const csv = `name,code,price
Widget,W001,100
Gadget,G002,200`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "Widget", code: "W001", price: "100" });
    expect(rows[1]).toEqual({ name: "Gadget", code: "G002", price: "200" });
  });

  it("handles quoted fields with commas", () => {
    const csv = `name,description,price
"Widget","Has a comma, inside",100
Gadget,Simple,200`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].description).toBe("Has a comma, inside");
    expect(rows[1].description).toBe("Simple");
  });

  it("handles escaped quotes (double-quote)", () => {
    const csv = `name,note
"Item ""A""",test`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Item "A"');
  });

  it("returns empty for single-line (headers only)", () => {
    const csv = `name,code`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(0);
  });

  it("skips blank lines", () => {
    const csv = `name,code
A,001

B,002
`;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
  });

  it("handles Windows line endings", () => {
    const csv = "name,code\r\nA,001\r\nB,002";
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
  });
});
