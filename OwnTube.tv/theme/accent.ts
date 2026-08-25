// Per-instance accent — recolor the on-air couch's amber accent (theme500) with
// the PeerTube instance's own brand colour, so each instance "colours its own
// frame". The colour comes from the server config
// (`ServerConfig.theme.customization.primaryColor`, /api/v1/config); that field is
// admin-typed and is frequently blank or non-hex, so it is validated before use
// and we fall back to the built-in amber ramp when it isn't a colour we trust.

// Hex (#rgb / #rgba / #rrggbb / #rrggbbaa) or an rgb()/rgba()/hsl()/hsla()
// function. Named colours are deliberately NOT trusted — PeerTube's colour picker
// emits hex, and a bare word is as likely to be garbage as a real colour.
const ACCENT_RE = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|hsl)a?\([^)]*\))$/i;

export const isValidAccent = (color?: string | null): color is string => !!color && ACCENT_RE.test(color.trim());

// Override ONLY the accent token (theme500 — the sole token the couch focus glow,
// border, kicker, CH badge and card shadow read). The broadcast grounds and ink
// stay put. Returns the SAME theme reference when there's nothing valid to apply,
// so callers memoising on it don't churn.
export const applyInstanceAccent = <T extends { colors: Record<string, string> }>(
  theme: T,
  primaryColor?: string | null,
): T => {
  if (!isValidAccent(primaryColor)) return theme;

  return { ...theme, colors: { ...theme.colors, theme500: primaryColor.trim() } };
};
