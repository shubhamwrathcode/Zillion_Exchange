/**
 * Skeleton for NewSwapHistory (Swap History). Shown while swap history is loading.
 */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../theme/colors";

const SHIMMER_STRIP_WIDTH = 80;

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

const SwapCardSkeleton = () => (
  <View style={[styles.card, { backgroundColor: colors.themeElevationColor }]}>
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <ShimmerBox width={160} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
        <ShimmerBox width={120} height={12} borderRadius={4} />
      </View>
      <ShimmerBox width={56} height={20} borderRadius={4} />
    </View>
    <View style={styles.cardBody}>
      <View style={styles.cardRow}>
        <ShimmerBox width={48} height={12} borderRadius={4} />
        <ShimmerBox width={32} height={12} borderRadius={4} />
      </View>
      <View style={styles.cardRow}>
        <ShimmerBox width={90} height={12} borderRadius={4} />
        <ShimmerBox width={100} height={12} borderRadius={4} />
      </View>
      <View style={styles.cardRow}>
        <ShimmerBox width={110} height={12} borderRadius={4} />
        <ShimmerBox width={100} height={12} borderRadius={4} />
      </View>
      <View style={styles.cardRow}>
        <ShimmerBox width={95} height={12} borderRadius={4} />
        <ShimmerBox width={80} height={12} borderRadius={4} />
      </View>
      <View style={styles.cardRow}>
        <ShimmerBox width={28} height={12} borderRadius={4} />
        <ShimmerBox width={60} height={12} borderRadius={4} />
      </View>
    </View>
  </View>
);

const NewSwapHistorySkeleton = () => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {[1, 2, 3, 4].map((i) => (
      <SwapCardSkeleton key={i} />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: "95%",
    alignSelf: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  cardBody: { gap: 6 },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 20,
  },
});

export default NewSwapHistorySkeleton;
