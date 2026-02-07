import { useThemeColor } from "@/components/Themed";
import { useI18n } from "@/i18n";
import React from "react";
import { Text as RNText, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { styles } from "../styles";
import { ChartDataItem, ThemeColors } from "../types";

interface ChartContentProps {
  chartData: ChartDataItem[];
  chartWidth: number;
  chartHeight: number;
  chartConfig: {
    backgroundColor: string;
    backgroundGradientFrom: string;
    backgroundGradientTo: string;
    color: () => string;
    labelColor: () => string;
    decimalPlaces: number;
  };
  themeColors: ThemeColors;
  hasData: boolean;
}

export const ChartContent: React.FC<ChartContentProps> = ({
  chartData,
  chartWidth,
  chartHeight,
  chartConfig,
  themeColors,
  hasData,
}) => {
  const { t } = useI18n();
  const cardColor = useThemeColor({}, "card");

  if (!hasData) {
    return (
      <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
        <RNText style={[styles.emptyText, { color: themeColors.chartText }]}>
          {t("summary.chart.noData")}
        </RNText>
      </View>
    );
  }

  return (
    <View style={[styles.chartContainer, { backgroundColor: cardColor }]}>
      <View style={styles.chartArea}>
        <View
          style={[styles.chartWrapper, { backgroundColor: themeColors.bg }]}
        >
          <PieChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[0, 0]}
          />
        </View>
      </View>
    </View>
  );
};
