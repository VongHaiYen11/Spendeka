import React from 'react';
import { View } from 'react-native';
import { OverviewChart } from './components/OverviewChart';
import { OverviewHeader } from './components/OverviewHeader';
import { useOverview } from './hooks/useOverview';
import { styles } from './styles';
import { OverviewProps } from './types';

const Overview: React.FC<OverviewProps> = (props) => {
  const {
    chartType,
    setChartType,
    dropdownOpen,
    setDropdownOpen,
    items,
    setItems,
    themeColors,
    hasData,
    isLineChart,
    barChartProps,
    lineChartProps,
  } = useOverview(props);

  return (
    <View style={styles.container}>
      <OverviewHeader
        chartType={chartType}
        setChartType={setChartType}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        items={items}
        setItems={setItems}
        themeColors={themeColors}
      />
      <OverviewChart
        hasData={hasData}
        isLineChart={isLineChart}
        themeColors={themeColors}
        barChartProps={barChartProps}
        lineChartProps={lineChartProps}
      />
    </View>
  );
};

export default Overview;
