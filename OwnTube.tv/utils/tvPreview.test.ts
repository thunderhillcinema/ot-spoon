import { computeIsTvLayout, computeOnAirTheme } from "./tvPreview";

describe("computeOnAirTheme", () => {
  it("is on when the branded app opted into the on-air theme", () => {
    expect(computeOnAirTheme({ onAir: true, preview: false })).toBe(true);
  });

  it("is on in the web preview (previewing the couch look is opting into it)", () => {
    expect(computeOnAirTheme({ onAir: false, preview: true })).toBe(true);
  });

  it("is off by default (vanilla instances)", () => {
    expect(computeOnAirTheme({ onAir: false, preview: false })).toBe(false);
  });
});

describe("computeIsTvLayout — the couch opt-in gate", () => {
  it("stays OFF on a vanilla TV build (opt-in not set)", () => {
    // The whole point of the flag: a plain TV build must be unchanged upstream.
    expect(computeIsTvLayout({ isTV: true, preview: false, onAir: false })).toBe(false);
  });

  it("is ON for an opted-in TV build", () => {
    expect(computeIsTvLayout({ isTV: true, preview: false, onAir: true })).toBe(true);
  });

  it("is ON in the web preview", () => {
    expect(computeIsTvLayout({ isTV: false, preview: true, onAir: false })).toBe(true);
  });

  it("stays OFF on a plain web build (no preview, no TV)", () => {
    expect(computeIsTvLayout({ isTV: false, preview: false, onAir: false })).toBe(false);
  });

  it("stays OFF on an opted-in NON-TV web build (couch is a 10-foot surface only)", () => {
    // A THC web deploy sets the on-air flag but is not a TV surface — it must
    // keep the normal web layout, not the couch.
    expect(computeIsTvLayout({ isTV: false, preview: false, onAir: true })).toBe(false);
  });
});
