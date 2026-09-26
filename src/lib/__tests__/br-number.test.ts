import { describe, expect, it } from "vitest";
import { heightToCm, parseBrNumber } from "@/lib/br-number";

describe("número com vírgula", () => {
  it("aceita peso e idade com vírgula", () => {
    expect(parseBrNumber("62,5")).toBe(62.5);
    expect(parseBrNumber("27")).toBe(27);
    expect(parseBrNumber("27,5")).toBe(27.5);
  });

  it("aceita altura em centímetros ou em metros", () => {
    expect(heightToCm("170")).toBe(170);
    expect(heightToCm("1,70")).toBe(170);
    expect(heightToCm("1.63")).toBe(163);
  });
});
