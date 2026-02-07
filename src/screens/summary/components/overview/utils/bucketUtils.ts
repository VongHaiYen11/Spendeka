import { differenceInDays, eachDayOfInterval, format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { TranslationKey } from "@/i18n";
import { MONTH_ABBREVIATIONS } from "../constants";
import { AggregatedBucket, Range } from "../types";

export const splitAmount = (amount: number, type?: "income" | "spent") => {
  // Use type field if available, otherwise infer from amount sign
  const isIncome = type === "income" || (type === undefined && amount < 0);
  if (isIncome) {
    return { income: Math.abs(amount), spent: 0 };
  }
  return { income: 0, spent: Math.abs(amount) };
};

// Create buckets with strict limits for visual clarity
export const createBuckets = (
  range: Range,
  startDate: Date,
  endDate: Date,
  t: (key: TranslationKey, params?: Record<string, string>) => string,
  languageKey: "vie" | "eng" = "eng",
): AggregatedBucket[] => {
  const dateLocale = languageKey === "vie" ? vi : enUS;
  switch (range) {
    case "day": {
      // 8 bars: 3-hour intervals
      return [
        { label: t("summary.chart.time.12am"), income: 0, spent: 0 },
        { label: t("summary.chart.time.3am"), income: 0, spent: 0 },
        { label: t("summary.chart.time.6am"), income: 0, spent: 0 },
        { label: t("summary.chart.time.9am"), income: 0, spent: 0 },
        { label: t("summary.chart.time.12pm"), income: 0, spent: 0 },
        { label: t("summary.chart.time.3pm"), income: 0, spent: 0 },
        { label: t("summary.chart.time.6pm"), income: 0, spent: 0 },
        { label: t("summary.chart.time.9pm"), income: 0, spent: 0 },
      ];
    }
    case "week": {
      // 7 bars: one per day
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.slice(0, 7).map((day) => ({
        label: format(day, "EEE", { locale: dateLocale }),
        income: 0,
        spent: 0,
      }));
    }
    case "month": {
      // 6 bars: ~5-day intervals
      return [
        { label: "1-4", income: 0, spent: 0 },
        { label: "5-9", income: 0, spent: 0 },
        { label: "10-14", income: 0, spent: 0 },
        { label: "15-19", income: 0, spent: 0 },
        { label: "20-24", income: 0, spent: 0 },
        { label: "25-31", income: 0, spent: 0 },
      ];
    }
    case "year": {
      // 12 bars: one per month
      return MONTH_ABBREVIATIONS.map((letter) => ({
        label: letter,
        income: 0,
        spent: 0,
      }));
    }
    case "all": {
      // One data point per year for line chart
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const totalYears = endYear - startYear + 1;

      return Array.from({ length: totalYears }, (_, i) => {
        const year = startYear + i;
        return {
          label: year.toString(),
          income: 0,
          spent: 0,
        };
      });
    }
    default:
      return [];
  }
};

export const getBucketIndex = (
  range: Range,
  date: Date,
  startDate: Date,
  endDate: Date,
  buckets: AggregatedBucket[],
): number => {
  if (!buckets || buckets.length === 0) return 0;

  switch (range) {
    case "day": {
      const hour = date.getHours();
      return Math.floor(hour / 3);
    }
    case "week": {
      const daysDiff = differenceInDays(date, startDate);
      return Math.max(0, Math.min(daysDiff, 6));
    }
    case "month": {
      const day = date.getDate();
      if (day >= 25) return 5;
      if (day >= 20) return 4;
      if (day >= 15) return 3;
      if (day >= 10) return 2;
      if (day >= 5) return 1;
      return 0;
    }
    case "year": {
      return Math.max(0, Math.min(date.getMonth(), 11));
    }
    case "all": {
      // Map transaction year to its corresponding yearly bucket
      const year = date.getFullYear();
      const startYear = startDate.getFullYear();
      const yearIndex = year - startYear;

      // Ensure index is within bounds
      return Math.max(0, Math.min(yearIndex, buckets.length - 1));
    }
    default:
      return 0;
  }
};
