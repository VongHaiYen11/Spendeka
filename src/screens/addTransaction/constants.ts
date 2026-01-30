import { PRIMARY_COLOR } from "@/constants/Colors";

export const DARK_BG = "#1a1a1a";
export const ROW_BG = "rgba(255,255,255,0.06)";
export const WIDGET_BG = "rgba(255,255,255,0.08)";

export { PRIMARY_COLOR };

export function generateTransactionId(): string {
  return `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
