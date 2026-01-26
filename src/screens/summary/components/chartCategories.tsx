import { Text, useThemeColor, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getIncomeByCategory, getSpentByCategory } from '@/server/fakeDBGetData';
import React, { useMemo, useState } from 'react';
import { Text as RNText, StyleSheet, useWindowDimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import DropDownPicker from 'react-native-dropdown-picker';

type Range = 'day' | 'week' | 'month' | 'year' | 'all';
type CategoryType = 'income' | 'spent';

const CATEGORY_OPTIONS: Array<{ label: string; value: CategoryType }> = [
  { label: 'Income', value: 'income' },
  { label: 'Spent', value: 'spent' },
];

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  // Validate and clamp RGB values
  r = isNaN(r) ? 0 : Math.max(0, Math.min(255, r));
  g = isNaN(g) ? 0 : Math.max(0, Math.min(255, g));
  b = isNaN(b) ? 0 : Math.max(0, Math.min(255, b));
  
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min && !isNaN(max) && !isNaN(min)) {
    const d = max - min;
    if (d !== 0) {
      const denominator = l > 0.5 ? (2 - max - min) : (max + min);
      s = denominator !== 0 ? d / denominator : 0;
      
      if (!isNaN(s)) {
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
          default: h = 0; break;
        }
      }
    }
  }
  
  // Ensure all values are valid numbers
  h = isNaN(h) ? 0 : h * 360;
  s = isNaN(s) ? 0 : s * 100;
  const lightness = isNaN(l) ? 50 : l * 100;
  
  return [h, s, lightness];
};

// Convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  // Validate and clamp input values
  h = isNaN(h) ? 0 : ((h % 360) + 360) % 360; // Normalize hue to 0-360
  s = isNaN(s) ? 0 : Math.max(0, Math.min(100, s)); // Clamp saturation 0-100
  l = isNaN(l) ? 50 : Math.max(0, Math.min(100, l)); // Clamp lightness 0-100
  
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0 || isNaN(s)) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  // Ensure all values are valid numbers and clamp to 0-255
  r = isNaN(r) ? 0 : Math.max(0, Math.min(1, r));
  g = isNaN(g) ? 0 : Math.max(0, Math.min(1, g));
  b = isNaN(b) ? 0 : Math.max(0, Math.min(1, b));

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Generate shades of a color with wide range and better distinction
const generateColorShades = (baseColor: string, count: number, isDark: boolean): string[] => {
  const shades: string[] = [];
  
  // Validate and normalize hex color
  let hex = baseColor.replace('#', '').trim();
  
  // Handle 3-character hex colors (e.g., #fff -> #ffffff)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Validate hex color format
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    // Fallback to default color based on theme
    hex = isDark ? 'ffffff' : '2f95dc';
  }
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  
  // Validate RGB values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    // Fallback to default color based on theme
    const fallbackR = isDark ? 255 : 47;
    const fallbackG = isDark ? 255 : 149;
    const fallbackB = isDark ? 255 : 220;
    const [h, s, l] = rgbToHsl(fallbackR, fallbackG, fallbackB);
    return generateShadesFromHSL(h, s, l, count, isDark);
  }
  
  // Convert to HSL for better color manipulation
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Validate HSL values
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    // Fallback to default HSL values
    const fallbackH = isDark ? 0 : 200;
    const fallbackS = isDark ? 0 : 70;
    const fallbackL = isDark ? 100 : 55;
    return generateShadesFromHSL(fallbackH, fallbackS, fallbackL, count, isDark);
  }
  
  return generateShadesFromHSL(h, s, l, count, isDark);
};

// Helper function to generate shades from HSL values
const generateShadesFromHSL = (h: number, s: number, l: number, count: number, isDark: boolean): string[] => {
  const shades: string[] = [];
  
  // Keep hue and saturation constant - only vary lightness to create different shades
  const newH = h; // Keep hue constant - same base color
  const newS = s; // Keep saturation constant - same color intensity
  
  // Handle edge case: if count is 1 or less
  if (count <= 1) {
    const [newR, newG, newB] = hslToRgb(newH, newS, l);
    const rHex = Math.max(0, Math.min(255, newR)).toString(16).padStart(2, '0');
    const gHex = Math.max(0, Math.min(255, newG)).toString(16).padStart(2, '0');
    const bHex = Math.max(0, Math.min(255, newB)).toString(16).padStart(2, '0');
    return [`#${rHex}${gHex}${bHex}`];
  }
  
  for (let i = 0; i < count; i++) {
    // Use completely linear distribution for maximum distinction
    // Each color gets an equal, evenly-spaced step in the lightness range
    const progress = i / (count - 1);
    
    // Linear distribution ensures each color is equally spaced and more distinct
    // No curve - just straight linear progression for maximum visual separation
    
    if (isDark) {
      // For dark theme: wide range from 60% to 98% for maximum distinction
      // Lighter colors for better visibility on dark backgrounds
      // Each step is ~3.8% lightness difference (38% range / 10 colors)
      const newL = 40 + progress * 200;
      
      const [newR, newG, newB] = hslToRgb(newH, newS, newL);
      // Clamp values and ensure they're valid numbers
      const rHex = Math.max(0, Math.min(255, Math.round(newR) || 0)).toString(16).padStart(2, '0');
      const gHex = Math.max(0, Math.min(255, Math.round(newG) || 0)).toString(16).padStart(2, '0');
      const bHex = Math.max(0, Math.min(255, Math.round(newB) || 0)).toString(16).padStart(2, '0');
      shades.push(`#${rHex}${gHex}${bHex}`);
    } else {
      // For light theme: wide range from 10% to 95% for maximum distinction
      // Each step is ~8.5% lightness difference (85% range / 10 colors)
      const newL = 10 + progress * 85;
      
      const [newR, newG, newB] = hslToRgb(newH, newS, newL);
      // Clamp values and ensure they're valid numbers
      const rHex = Math.max(0, Math.min(255, Math.round(newR) || 0)).toString(16).padStart(2, '0');
      const gHex = Math.max(0, Math.min(255, Math.round(newG) || 0)).toString(16).padStart(2, '0');
      const bHex = Math.max(0, Math.min(255, Math.round(newB) || 0)).toString(16).padStart(2, '0');
      shades.push(`#${rHex}${gHex}${bHex}`);
    }
  }
  
  return shades;
};

interface ChartCategoriesProps {
  startDate: Date;
  endDate: Date;
  range: Range;
  userId?: string;
}

// Helper function to generate chart data
const generateChartData = (
  categoryData: Record<string, number>,
  themeColors: { chartText: string },
  tintColor: string,
  isDark: boolean
) => {
  const entries = Object.entries(categoryData).filter(([_, value]) => value > 0);
  const total = entries.reduce((sum, [_, value]) => sum + value, 0);
  
  if (total === 0) return [];
  
  // Sort by amount descending
  const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
  
  // Generate 10 color shades for smooth distribution
  const colorShades = generateColorShades(tintColor, 10, isDark);
  
  // Take top 9 categories
  const topCategories = sortedEntries.slice(0, 9);
  const otherCategories = sortedEntries.slice(9);
  
  // Map top categories with colors (use first 9 shades)
  const chartData = topCategories.map(([category, value], index) => ({
    name: category,
    amount: value,
    color: colorShades[index],
    legendFontColor: themeColors.chartText,
    legendFontSize: 12,
  }));
  
  // Add "others" category if there are more than 9
  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce((sum, [_, value]) => sum + value, 0);
    chartData.push({
      name: 'Others',
      amount: othersTotal,
      color: colorShades[9], // Use the 10th shade for "others"
      legendFontColor: themeColors.chartText,
      legendFontSize: 12,
    });
  }
  
  return chartData;
};

const ChartCategories: React.FC<ChartCategoriesProps> = ({
  startDate,
  endDate,
  userId = 'user1',
}) => {
  const { width } = useWindowDimensions();
  const [categoryType, setCategoryType] = useState<CategoryType>('income');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState(CATEGORY_OPTIONS);
  
  // Theme resolution
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const isDark = backgroundColor === Colors.dark.background;

  const themeColors = useMemo(
    () => ({
      bg: isDark ? '#111827' : Colors.general.white,
      text: textColor,
      chartText: isDark ? '#9ca3af' : Colors.general.gray600,
      chartAxis: isDark ? '#d1d5db' : Colors.general.gray700,
      border: isDark ? '#374151' : Colors.general.gray200,
      pickerBg: isDark ? '#1f2937' : Colors.general.gray100,
    }),
    [backgroundColor, textColor, isDark]
  );

  // Get category data based on selected type
  const incomeByCategory = useMemo(
    () => getIncomeByCategory(userId, startDate, endDate),
    [userId, startDate, endDate]
  );

  const spentByCategory = useMemo(
    () => getSpentByCategory(userId, startDate, endDate),
    [userId, startDate, endDate]
  );

  // Generate chart data based on selected type
  const chartData = useMemo(() => {
    // Fix: Swap data sources - incomeByCategory appears to contain spent data and vice versa
    const categoryData = categoryType === 'income' ? spentByCategory : incomeByCategory;
    return generateChartData(categoryData, themeColors, tintColor, isDark);
  }, [categoryType, incomeByCategory, spentByCategory, themeColors, tintColor, isDark]);

  const containerWidth = width - 32;
  const chartWidth = containerWidth;
  const chartHeight = 200;

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: themeColors.bg,
    backgroundGradientTo: themeColors.bg,
    color: () => themeColors.chartAxis,
    labelColor: () => themeColors.chartText,
    decimalPlaces: 0,
  };

  const hasData = chartData.length > 0;
  const title = categoryType === 'income' ? 'Income by Category' : 'Spent by Category';
  const emptyMessage = categoryType === 'income' ? 'No income data' : 'No spent data';

  return (
    <View style={styles.container}>
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
            style={[styles.dropdown, { backgroundColor: themeColors.pickerBg, borderColor: themeColors.border }]}
            textStyle={{ color: themeColors.text, fontSize: 13, fontWeight: '500' }}
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
      
      {hasData ? (
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            <View style={[styles.chartWrapper, { backgroundColor: themeColors.bg }]}>
              <PieChart
                data={chartData}
                width={chartWidth}
                height={chartHeight}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[0,0]}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <RNText style={[styles.emptyText, { color: themeColors.chartText }]}>No data</RNText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2000,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownWrapper: {
    width: 100,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 34,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    backgroundColor: '#111827',
    paddingBottom: 12,
    borderRadius: 16,
  },
  chartArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChartCategories;