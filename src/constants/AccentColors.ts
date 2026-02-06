/**
 * Accent color options with light/dark variants for accessibility.
 *
 * Light variant:
 * - slightly richer tones for better visibility on white backgrounds
 * - avoids overly washed-out pastels
 *
 * Dark variant:
 * - brighter tones for strong contrast on dark UI
 *
 * Works well across both iOS and Android.
 */

export type AccentKey =
  | "neutral"
  | "yellow"
  | "green"
  | "pink"
  | "blue"
  | "red"
  | "orange";

export interface AccentOption {
  id: AccentKey;
  name: string;

  /** Primary accent for light mode */
  light: string;

  /** Primary accent for dark mode */
  dark: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "yellow",
    name: "Yellow",
    light: "#FAB95B", // vibrant yellow for better visibility on light backgrounds
    dark: "#FFE066",
  },
  {
    id: "green",
    name: "Green",
    light: "#4ADE80", // fresh mint green
    dark: "#34D399",
  },
  {
    id: "pink",
    name: "Pink",
    light: "#F472B6", // stronger rose accent
    dark: "#EC4899",
  },
  {
    id: "blue",
    name: "Blue",
    light: "#3B82F6", // modern finance-friendly blue
    dark: "#60A5FA",
  },
  {
    id: "red",
    name: "Red",
    light: "#EF4444", // clean coral red
    dark: "#F87171",
  },
  {
    id: "orange",
    name: "Orange",
    light: "#FB923C", // warm orange
    dark: "#FDBA74",
  },
];

/**
 * Default accent:
 * Blue is the most suitable for finance apps:
 * - trust
 * - stability
 * - professional UI
 */
export const DEFAULT_ACCENT_KEY: AccentKey = "blue";

/**
 * Returns the primary accent color depending on theme mode.
 */
export function getAccentPrimary(
  accentKey: AccentKey,
  colorScheme: "light" | "dark",
): string {
  const option =
    ACCENT_OPTIONS.find((o) => o.id === accentKey) ?? ACCENT_OPTIONS[0];

  return colorScheme === "dark" ? option.dark : option.light;
}

/**
 * Fixed primary color for camera screen.
 * (Does not follow user accent to keep consistent UX.)
 */
export const CAMERA_PRIMARY = "#FFD60A";
