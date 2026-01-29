import React from "react";
import { View } from "react-native";
import { ChartContent } from "./components/ChartContent";
import { ChartHeader } from "./components/ChartHeader";
import { useChartCategories } from "./hooks/useChartCategories";
import { styles } from "./styles";
import { ChartCategoriesProps } from "./types";

const ChartCategories: React.FC<ChartCategoriesProps> = (props) => {
  const {
    categoryType,
    setCategoryType,
    dropdownOpen,
    setDropdownOpen,
    items,
    setItems,
    themeColors,
    chartData,
    chartWidth,
    chartHeight,
    chartConfig,
    hasData,
  } = useChartCategories(props);

  return (
    <View style={styles.container}>
      <ChartHeader
        categoryType={categoryType}
        setCategoryType={setCategoryType}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        items={items}
        setItems={setItems}
        themeColors={themeColors}
      />
      <ChartContent
        chartData={chartData}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        chartConfig={chartConfig}
        themeColors={themeColors}
        hasData={hasData}
      />
    </View>
  );
};

export default ChartCategories;
