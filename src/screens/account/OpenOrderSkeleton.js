/**
 * Skeleton for OpenOrder screen. Shown while open orders are loading.
 */
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");
const CARD_PAD = 14;
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

const OrderCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.topRow}>
      <ShimmerBox width={140} height={14} borderRadius={4} />
      <ShimmerBox width={100} height={11} borderRadius={4} />
    </View>
    <ShimmerBox width={80} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
    <View style={styles.cardRow}>
      <ShimmerBox width={56} height={12} borderRadius={4} />
      <ShimmerBox width={100} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBox width={80} height={12} borderRadius={4} />
      <ShimmerBox width={120} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardRow}>
      <ShimmerBox width={50} height={12} borderRadius={4} />
      <ShimmerBox width={44} height={12} borderRadius={4} />
    </View>
    <View style={styles.cardDivider} />
  </View>
);

const OpenOrderSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {[1, 2, 3, 4].map((i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  card: {
    padding: CARD_PAD,
    paddingBottom: 0,
    width: "100%",
    alignSelf: "center",
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
    marginBottom: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.overlayColor,
    marginTop: 14,
  },
});

export default OpenOrderSkeleton;
