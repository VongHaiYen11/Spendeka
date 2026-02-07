import { Text } from "@/components/Themed";
import { useI18n } from "@/i18n";
import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { styles } from "../styles";
import { CategoryType, ThemeColors } from "../types";

interface ChartHeaderProps {
  categoryType: CategoryType;
  setCategoryType: (type: CategoryType) => void;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: Array<{ label: string; value: CategoryType }>;
  setItems: React.Dispatch<
    React.SetStateAction<Array<{ label: string; value: CategoryType }>>
  >;
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
  const { t } = useI18n();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{t("summary.chart.breakdown")}</Text>
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
