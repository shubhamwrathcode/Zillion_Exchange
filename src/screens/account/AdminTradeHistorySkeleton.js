/**
 * Skeleton for AdminTradeHistory (Bonus History). Shown while admin trade list is loading.
 */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../theme/colors";

const SHIMMER_STRIP_WIDTH = 80;
const CELL_WIDTH = 110;
const ROW_HEIGHT = 40;

const ShimmerBox = ({ width: w, height, borderRadius = 6, style }) => {
  const shimmerX = useRef(new Animated.Value(-SHIMMER_STRIP_WIDTH)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    shimmerX.setValue(-SHIMMER_STRIP_WIDTH);
    const run = () => {
      if (!mounted.current) return;
      shimmerX.setValue(-SHIMMER_STRIP_WIDTH);
      const toVal = Math.max(w, 1) + SHIMMER_STRIP_WIDTH;
      Animated.timing(shimmerX, {
        toValue: toVal,
        duration: 1100,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (mounted.current && finished) run();
      });
    };
    const t = setTimeout(run, 50);
    return () => {
      mounted.current = false;
      clearTimeout(t);
      shimmerX.stopAnimation();
    };
  }, [shimmerX, w]);

  const boneColor = colors.themeElevationColor;
  const shimmerColors = ["transparent", "rgba(255,255,255,0.16)", "transparent"];

  return (
    <View
      style={[
        { width: w, height, borderRadius, overflow: "hidden", backgroundColor: boneColor },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { position: "absolute", top: 0, bottom: 0, width: SHIMMER_STRIP_WIDTH, left: 0 },
          { transform: [{ translateX: shimmerX }] },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: SHIMMER_STRIP_WIDTH }}
        />
      </Animated.View>
    </View>
  );
};

const TableRowSkeleton = () => (
  <View style={styles.row}>
    <ShimmerBox width={40} height={14} borderRadius={4} style={styles.cell} />
    <ShimmerBox width={70} height={14} borderRadius={4} style={styles.cell} />
    <ShimmerBox width={60} height={14} borderRadius={4} style={styles.cell} />
    <ShimmerBox width={80} height={14} borderRadius={4} style={styles.cell} />
    <ShimmerBox width={50} height={14} borderRadius={4} style={styles.cell} />
  </View>
);

const AdminTradeHistorySkeleton = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.tableWrapper}>
      <View style={[styles.row, styles.headerRow]}>
        <ShimmerBox width={50} height={14} borderRadius={4} style={styles.cell} />
        <ShimmerBox width={70} height={14} borderRadius={4} style={styles.cell} />
        <ShimmerBox width={60} height={14} borderRadius={4} style={styles.cell} />
        <ShimmerBox width={80} height={14} borderRadius={4} style={styles.cell} />
        <ShimmerBox width={50} height={14} borderRadius={4} style={styles.cell} />
      </View>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <TableRowSkeleton key={i} />
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  tableWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    paddingRight: 20,
  },
  row: { flexDirection: "row" },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: colors.overlayColor || "#333",
    paddingBottom: 10,
    marginBottom: 8,
  },
  cell: {
    width: CELL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});

export default AdminTradeHistorySkeleton;
