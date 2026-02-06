import { Text } from "@/components/Themed";
import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { TYPE_OPTIONS } from "../constants";
import { styles } from "../styles";
import { ChartType, ThemeColors } from "../types";

interface OverviewHeaderProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: typeof TYPE_OPTIONS;
  setItems: React.Dispatch<React.SetStateAction<typeof TYPE_OPTIONS>>;
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
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Trends</Text>
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
