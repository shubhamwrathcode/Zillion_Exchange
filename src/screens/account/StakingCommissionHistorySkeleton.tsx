import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ShimmerBone from "../../shared/components/ShimmerBone";
import { useTheme } from "../../hooks/useTheme";

const SummaryCardSkeleton = ({ themeColors }: any) => (
  <View style={[styles.summaryCard, { borderColor: themeColors.border }]}>
    {/* Title */}
    <ShimmerBone width={180} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
    
    {/* Grid */}
    <View style={styles.summaryGrid}>
      <View style={styles.summaryItem}>
        <ShimmerBone width={90} height={11} borderRadius={3} style={{ marginBottom: 6 }} />
        <ShimmerBone width={70} height={14} borderRadius={4} />
      </View>
      <View style={styles.summaryItem}>
        <ShimmerBone width={60} height={11} borderRadius={3} style={{ marginBottom: 6 }} />
        <ShimmerBone width={80} height={14} borderRadius={4} />
      </View>
      <View style={styles.summaryItem}>
        <ShimmerBone width={60} height={11} borderRadius={3} style={{ marginBottom: 6 }} />
        <ShimmerBone width={80} height={14} borderRadius={4} />
      </View>
      <View style={styles.summaryItem}>
        <ShimmerBone width={60} height={11} borderRadius={3} style={{ marginBottom: 6 }} />
        <ShimmerBone width={80} height={14} borderRadius={4} />
      </View>
    </View>
  </View>
);

const HistoryCardSkeleton = ({ themeColors }: any) => (
  <View style={styles.card}>
    {/* Top Row (Level and Date) */}
    <View style={styles.topRow}>
      <ShimmerBone width={50} height={12} borderRadius={4} />
      <ShimmerBone width={110} height={11} borderRadius={4} />
    </View>

    {/* Details Rows */}
    <View style={styles.cardRow}>
      <ShimmerBone width={65} height={12} borderRadius={4} />
      <ShimmerBone width={95} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBone width={60} height={12} borderRadius={4} />
      <ShimmerBone width={40} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBone width={85} height={12} borderRadius={4} />
      <ShimmerBone width={70} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBone width={80} height={12} borderRadius={4} />
      <ShimmerBone width={45} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBone width={115} height={12} borderRadius={4} />
      <ShimmerBone width={80} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBone width={80} height={12} borderRadius={4} />
      <ShimmerBone width={50} height={12} borderRadius={4} />
    </View>

    <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
  </View>
);

const StakingCommissionHistorySkeleton = () => {
  const { colors: themeColors } = useTheme();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      <SummaryCardSkeleton themeColors={themeColors} />
      
      <View style={styles.listContainer}>
        {[1, 2, 3].map((i) => (
          <HistoryCardSkeleton key={i} themeColors={themeColors} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    marginBottom: 10,
  },
  listContainer: {
    marginHorizontal: 15,
  },
  card: {
    padding: 14,
    paddingBottom: 0,
    width: "100%",
    alignSelf: "center",
  },
  cardDivider: {
    height: 1,
    marginTop: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});

export default StakingCommissionHistorySkeleton;
