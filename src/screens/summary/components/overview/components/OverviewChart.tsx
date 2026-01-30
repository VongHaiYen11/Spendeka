import React from 'react';
import { Text as RNText, View } from 'react-native';
import { BarChart as ChartKitBarChart, LineChart as ChartKitLineChart } from 'react-native-chart-kit';
import { useThemeColor } from '@/components/Themed';
import { styles } from '../styles';
import { ThemeColors } from '../types';

interface OverviewChartProps {
  hasData: boolean;
  isLineChart: boolean;
  themeColors: ThemeColors;
  barChartProps: any;
  lineChartProps: any;
}

export const OverviewChart: React.FC<OverviewChartProps> = ({
  hasData,
  isLineChart,
  themeColors,
  barChartProps,
  lineChartProps,
}) => {
  const cardColor = useThemeColor({}, 'card');

  if (!hasData) {
    return (
      <View style={[styles.emptyState, { backgroundColor: cardColor }]}>
        <RNText style={[styles.emptyText, { color: themeColors.chartText }]}>No data</RNText>
      </View>
    );
  }

  return (
    <View style={[styles.chartContainer, { backgroundColor: cardColor }]}>
      <View style={styles.chartArea}>
        <View style={[styles.chartWrapper, { backgroundColor: themeColors.bg }]}>
          {isLineChart ? (
            <ChartKitLineChart {...lineChartProps} />
          ) : (
            <ChartKitBarChart {...barChartProps} />
          )}
        </View>
      </View>
    </View>
  );
};
