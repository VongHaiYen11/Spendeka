import { useI18n } from "@/i18n";
import { formatDollar } from "@/utils/formatCurrency";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

/* =======================
   Types
======================= */
export type Period = "day" | "week" | "month" | "year" | "all";
type CardType = "saved" | "spent" | "all";

interface FinanceCardProps {
  label: string;
  amount: number;
  type: CardType;
  period: Period;
  colors: [string, string, ...string[]];
}

interface AccountInfoProps {
  period: Period;
  savedAmount: number;
  spentAmount: number;
  totalAmount?: number; // chỉ dùng khi period === 'all'
}

/* =======================
   Footer text map
======================= */
const getFooterText = (
  type: CardType,
  period: Period,
  t: (key: string) => string,
) => {
  if (type === "all" && period !== "all") {
    return "—";
  }
  if (period === "all") {
    return t("summary.account.period.allTime");
  }
  const periodMap: Record<Period, string> = {
    day: t("summary.account.period.today"),
    week: t("summary.account.period.thisWeek"),
    month: t("summary.account.period.thisMonth"),
    year: t("summary.account.period.thisYear"),
    all: t("summary.account.period.allTime"),
  };
  return periodMap[period];
};

/* =======================
   FinanceCard
======================= */
const FinanceCard: React.FC<
  FinanceCardProps & { t: (key: string) => string }
> = ({ label, amount, type, period, colors, t }) => {
  const displayAmount = formatDollar(amount);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 20,
        }}
      >
        {/* Header */}
        <Text className="text-white/80 text-lg font-medium">{label}</Text>

        {/* Amount */}
        <Text className="text-white text-2xl font-bold mt-2">
          {displayAmount}
        </Text>

        {/* Footer */}
        <Text className="text-white/70 text-[12px] mt-2 tracking-tight">
          {getFooterText(type, period, t)}
        </Text>
      </LinearGradient>
    </View>
  );
};

const AllSummary: React.FC<{ amount: number; t: (key: string) => string }> = ({
  amount,
  t,
}) => {
  return (
    <LinearGradient
      colors={["#6C8CF5", "#4F6CD9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 20,
      }}
    >
      <Text className="text-white/80 text-lg font-medium">
        {t("summary.account.allTimeBalance")}
      </Text>

      <Text className="text-white text-3xl font-bold mt-2">
        {formatDollar(amount)}
      </Text>

      <Text className="text-white/70 text-[12px] mt-2 tracking-tight">
        {t("summary.account.upToThisPoint")}
      </Text>
    </LinearGradient>
  );
};

/* =======================
   AccountInfo
======================= */
const AccountInfo: React.FC<AccountInfoProps> = ({
  period,
  savedAmount,
  spentAmount,
  totalAmount,
}) => {
  const { t } = useI18n();
  return (
    <View className="w-full px-4 flex-col gap-y-3">
      {/* ===== All-time card (top) ===== */}
      {period === "all" && <AllSummary amount={totalAmount ?? 0} t={t} />}

      {/* ===== Saved / Spent row ===== */}
      <View className="flex-row gap-x-3">
        <FinanceCard
          label={t("summary.account.saved")}
          amount={savedAmount}
          type="saved"
          period={period}
          colors={["#72E394", "#49B68D"]}
          t={t}
        />

        <FinanceCard
          label={t("summary.account.spent")}
          amount={spentAmount}
          type="spent"
          period={period}
          colors={["#E56B89", "#C84E6D"]}
          t={t}
        />
      </View>
    </View>
  );
};

export default AccountInfo;
