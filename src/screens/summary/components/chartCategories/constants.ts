import { CategoryType } from "./types";

export const CATEGORY_OPTIONS: Array<{ label: string; value: CategoryType }> = [
  { label: "Income", value: "income" },
  { label: "Spent", value: "spent" },
];

export const CHART_HEIGHT = 200;
export const MAX_CATEGORIES = 9;
