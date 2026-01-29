import { DatabaseTransaction } from "@/types/expense";
import { INCOME_COLOR, SPENT_COLOR } from "../constants";
import { AggregatedBucket, ChartType, Range } from "../types";
import { createBuckets, getBucketIndex, splitAmount } from "./bucketUtils";

export const aggregateTransactions = (
  transactions: DatabaseTransaction[],
  range: Range,
  startDate: Date,
  endDate: Date,
): AggregatedBucket[] => {
  const buckets = createBuckets(range, startDate, endDate);
  if (!buckets || buckets.length === 0) return [];

  transactions.forEach((tx) => {
    const date = tx.createdAt;
    const index = getBucketIndex(range, date, startDate, endDate, buckets);
    if (index >= 0 && index < buckets.length) {
      const { income, spent } = splitAmount(tx.amount, tx.type);
      buckets[index].income += income;
      buckets[index].spent += spent;
    }
  });

  return buckets;
};

// Sparsify labels for line charts when there are too many data points
export const sparsifyLabels = (labels: string[]): string[] => {
  const totalLabels = labels.length;

  // If 10 or fewer, show all labels
  if (totalLabels <= 10) {
    return labels;
  }

  // If 11-20, show every 2nd label
  if (totalLabels <= 20) {
    return labels.map((label, i) => (i % 2 === 0 ? label : ""));
  }

  // If 21-30, show every 3rd label
  if (totalLabels <= 30) {
    return labels.map((label, i) => (i % 3 === 0 ? label : ""));
  }

  // If more than 30, show every 5th label
  return labels.map((label, i) => (i % 5 === 0 ? label : ""));
};

export const buildChartData = (
  buckets: AggregatedBucket[],
  chartType: ChartType,
  range: Range,
) => {
  let labels = buckets.map((b) => b.label);

  // Sparsify labels for "all" range (which has many data points) to prevent overlap
  if (range === "all") {
    labels = sparsifyLabels(labels);
  }

  if (chartType === "income") {
    return {
      labels,
      datasets: [
        { data: buckets.map((b) => b.income), color: () => INCOME_COLOR },
      ],
    };
  }

  if (chartType === "spent") {
    return {
      labels,
      datasets: [
        { data: buckets.map((b) => b.spent), color: () => SPENT_COLOR },
      ],
    };
  }

  return {
    labels,
    legend: ["Income", "Spent"],
    datasets: [
      { data: buckets.map((b) => b.income), color: () => INCOME_COLOR },
      { data: buckets.map((b) => b.spent), color: () => SPENT_COLOR },
    ],
  };
};
