import { Text } from "@/components/Themed";
import { useI18n } from "@/i18n";
import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { styles } from "../styles";
import { ChartType, ThemeColors } from "../types";

interface OverviewHeaderProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: Array<{ label: string; value: ChartType }>;
  setItems: React.Dispatch<
    React.SetStateAction<Array<{ label: string; value: ChartType }>>
  >;
  themeColors: ThemeColors;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  chartType,
  setChartType,
  dropdownOpen,
  setDropdownOpen,
  items,
  setItems,
  themeColors,
}) => {
  const { t } = useI18n();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{t("summary.chart.trends")}</Text>
      <View style={styles.dropdownWrapper}>
        <DropDownPicker
          open={dropdownOpen}
          value={chartType}
          items={items}
          setOpen={setDropdownOpen}
          setValue={setChartType as any}
          setItems={setItems}
          style={[
            styles.dropdown,
            {
              backgroundColor: themeColors.pickerBg,
              borderColor: themeColors.border,
            },
          ]}
          textStyle={{
            color: themeColors.text,
            fontSize: 13,
            fontWeight: "500",
          }}
          dropDownContainerStyle={{
            backgroundColor: themeColors.pickerBg,
            borderColor: themeColors.border,
            borderRadius: 8,
            marginTop: 4,
          }}
          arrowIconStyle={{ tintColor: themeColors.text } as any}
          tickIconStyle={{ tintColor: themeColors.text } as any}
          listMode="SCROLLVIEW"
          zIndex={2000}
          zIndexInverse={1000}
          maxHeight={150}
        />
      </View>
    </View>
  );
};
