import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export interface ColorScheme {
  theme50: string;
  theme100: string;
  theme200: string;
  theme500: string;
  theme600: string;
  theme800: string;
  theme900: string;
  theme950: string;
  themeDesaturated500: string;
  white10: string;
  white25: string;
  white80: string;
  white94: string;
  black50: string;
  black80: string;
  black100: string;
  error500: string;
}

const blackAndWhite = {
  white10: "#FFFFFF1A",
  white25: "#FFFFFF40",
  white80: "#FFFFFFCC",
  white94: "#FFFFFFF0",
  black50: "#00000080",
  black80: "#000000CC",
  black100: "#000000",
};

// THC "on-air" ramp — matched to the platform's /live viewer (amber on zinc,
// channel_broadcast_live.ex) and the CRT channel wall (near-black broadcast room
// #0b0d0e + warm cream ink #e7dcc4 + tally red #e8352a, channel_wall.ex). Amber
// is the accent; near-black/zinc are the grounds; warm cream is the ink; tally
// red is error/live. theme500/600 = accent, 50 = bg end, 950 = text end.

// Light = warm paper (fallback). The mode users see is dark.
const light: ColorScheme = {
  theme50: "#F7F3EA",
  theme100: "#EFE7D5",
  theme200: "#E0D3B8",
  theme500: "#D97706", // amber-600
  theme600: "#B45309", // amber-700 (darker for light-mode contrast)
  theme800: "#3A3126",
  theme900: "#241D14",
  theme950: "#140F09",
  themeDesaturated500: "#8A7F6E",
  error500: "#E8352A", // tally red
  ...blackAndWhite,
};

// Dark = the broadcast room. Near-black grounds, warm cream ink, amber accent.
const dark: ColorScheme = {
  theme50: "#0B0D0E", // cw-room — near-black
  theme100: "#16191B",
  theme200: "#26292B", // cw-hair — borders/cards
  theme500: "#D97706", // amber-600
  theme600: "#F59E0B", // amber-500 (brighter accent in dark, mirrors original ramp)
  theme800: "#9AA09D", // cw-ink-dim — mid text
  theme900: "#E7DCC4", // cw-ink — warm cream
  theme950: "#F5EFDF",
  themeDesaturated500: "#8A8F8C",
  error500: "#E8352A", // tally red
  ...blackAndWhite,
};

export const colorSchemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      ...light,
      background: light.theme50,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      ...dark,
      background: dark.theme50,
    },
  },
};

export const colors = { light, dark };
