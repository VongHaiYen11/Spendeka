import { Text } from "@/components/Themed";
import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { CATEGORY_OPTIONS } from "../constants";
import { styles } from "../styles";
import { CategoryType, ThemeColors } from "../types";

interface ChartHeaderProps {
  categoryType: CategoryType;
  setCategoryType: (type: CategoryType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: typeof CATEGORY_OPTIONS;
  setItems: React.Dispatch<React.SetStateAction<typeof CATEGORY_OPTIONS>>;
  themeColors: ThemeColors;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  categoryType,
  setCategoryType,
  dropdownOpen,
  setDropdownOpen,
  items,
  setItems,
  themeColors,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Breakdown</Text>
      <View style={styles.dropdownWrapper}>
        <DropDownPicker
          open={dropdownOpen}
          value={categoryType}
          items={items}
          setOpen={setDropdownOpen}
          setValue={setCategoryType as any}
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
