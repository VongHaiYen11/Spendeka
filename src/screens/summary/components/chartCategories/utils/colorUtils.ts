// Convert RGB to HSL
export const rgbToHsl = (
  r: number,
  g: number,
  b: number,
): [number, number, number] => {
  // Validate and clamp RGB values
  r = isNaN(r) ? 0 : Math.max(0, Math.min(255, r));
  g = isNaN(g) ? 0 : Math.max(0, Math.min(255, g));
  b = isNaN(b) ? 0 : Math.max(0, Math.min(255, b));

  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min && !isNaN(max) && !isNaN(min)) {
    const d = max - min;
    if (d !== 0) {
      const denominator = l > 0.5 ? 2 - max - min : max + min;
      s = denominator !== 0 ? d / denominator : 0;

      if (!isNaN(s)) {
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
          default:
            h = 0;
            break;
        }
      }
    }
  }

  // Ensure all values are valid numbers
  h = isNaN(h) ? 0 : h * 360;
  s = isNaN(s) ? 0 : s * 100;
  const lightness = isNaN(l) ? 50 : l * 100;

  return [h, s, lightness];
};

// Convert HSL to RGB
export const hslToRgb = (
  h: number,
  s: number,
  l: number,
): [number, number, number] => {
  // Validate and clamp input values
  h = isNaN(h) ? 0 : ((h % 360) + 360) % 360; // Normalize hue to 0-360
  s = isNaN(s) ? 0 : Math.max(0, Math.min(100, s)); // Clamp saturation 0-100
  l = isNaN(l) ? 50 : Math.max(0, Math.min(100, l)); // Clamp lightness 0-100

  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0 || isNaN(s)) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // Ensure all values are valid numbers and clamp to 0-255
  r = isNaN(r) ? 0 : Math.max(0, Math.min(1, r));
  g = isNaN(g) ? 0 : Math.max(0, Math.min(1, g));
  b = isNaN(b) ? 0 : Math.max(0, Math.min(1, b));

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Helper function to generate shades from HSL values
const generateShadesFromHSL = (
  h: number,
  s: number,
  l: number,
  count: number,
  isDark: boolean,
): string[] => {
  const shades: string[] = [];

  // Keep hue and saturation constant - only vary lightness to create different shades
  const newH = h; // Keep hue constant - same base color
  const newS = s; // Keep saturation constant - same color intensity

  // Handle edge case: if count is 1 or less
  if (count <= 1) {
    const [newR, newG, newB] = hslToRgb(newH, newS, l);
    const rHex = Math.max(0, Math.min(255, newR)).toString(16).padStart(2, "0");
    const gHex = Math.max(0, Math.min(255, newG)).toString(16).padStart(2, "0");
    const bHex = Math.max(0, Math.min(255, newB)).toString(16).padStart(2, "0");
    return [`#${rHex}${gHex}${bHex}`];
  }

  for (let i = 0; i < count; i++) {
    // Use completely linear distribution for maximum distinction
    // Each color gets an equal, evenly-spaced step in the lightness range
    const progress = i / (count - 1);

    // Linear distribution ensures each color is equally spaced and more distinct
    // No curve - just straight linear progression for maximum visual separation

    if (isDark) {
      // For dark theme: wide range from 60% to 98% for maximum distinction
      // Lighter colors for better visibility on dark backgrounds
      // Each step is ~3.8% lightness difference (38% range / 10 colors)
      const newL = 40 + progress * 200;

      const [newR, newG, newB] = hslToRgb(newH, newS, newL);
      // Clamp values and ensure they're valid numbers
      const rHex = Math.max(0, Math.min(255, Math.round(newR) || 0))
        .toString(16)
        .padStart(2, "0");
      const gHex = Math.max(0, Math.min(255, Math.round(newG) || 0))
        .toString(16)
        .padStart(2, "0");
      const bHex = Math.max(0, Math.min(255, Math.round(newB) || 0))
        .toString(16)
        .padStart(2, "0");
      shades.push(`#${rHex}${gHex}${bHex}`);
    } else {
      // For light theme: wide range from 10% to 95% for maximum distinction
      // Each step is ~8.5% lightness difference (85% range / 10 colors)
      const newL = 10 + progress * 85;

      const [newR, newG, newB] = hslToRgb(newH, newS, newL);
      // Clamp values and ensure they're valid numbers
      const rHex = Math.max(0, Math.min(255, Math.round(newR) || 0))
        .toString(16)
        .padStart(2, "0");
      const gHex = Math.max(0, Math.min(255, Math.round(newG) || 0))
        .toString(16)
        .padStart(2, "0");
      const bHex = Math.max(0, Math.min(255, Math.round(newB) || 0))
        .toString(16)
        .padStart(2, "0");
      shades.push(`#${rHex}${gHex}${bHex}`);
    }
  }

  return shades;
};

// Generate shades of a color with wide range and better distinction
export const generateColorShades = (
  baseColor: string,
  count: number,
  isDark: boolean,
): string[] => {
  const shades: string[] = [];

  // Validate and normalize hex color
  let hex = baseColor.replace("#", "").trim();

  // Handle 3-character hex colors (e.g., #fff -> #ffffff)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Validate hex color format
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    // Fallback to default color based on theme
    hex = isDark ? "ffffff" : "2f95dc";
  }

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Validate RGB values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    // Fallback to default color based on theme
    const fallbackR = isDark ? 255 : 47;
    const fallbackG = isDark ? 255 : 149;
    const fallbackB = isDark ? 255 : 220;
    const [h, s, l] = rgbToHsl(fallbackR, fallbackG, fallbackB);
    return generateShadesFromHSL(h, s, l, count, isDark);
  }

  // Convert to HSL for better color manipulation
  const [h, s, l] = rgbToHsl(r, g, b);

  // Validate HSL values
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    // Fallback to default HSL values
    const fallbackH = isDark ? 0 : 200;
    const fallbackS = isDark ? 0 : 70;
    const fallbackL = isDark ? 100 : 55;
    return generateShadesFromHSL(
      fallbackH,
      fallbackS,
      fallbackL,
      count,
      isDark,
    );
  }

  return generateShadesFromHSL(h, s, l, count, isDark);
};
