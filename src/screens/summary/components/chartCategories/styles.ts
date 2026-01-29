import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    zIndex: 2000,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    backgroundColor: "#111827",
    paddingBottom: 12,
    borderRadius: 16,
  },
  chartArea: {
    justifyContent: "center",
    alignItems: "center",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
