import React from "react";
import { View, StyleSheet, Platform, Dimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { AppText, SEMI_BOLD, TEN, TWELVE, FOURTEEN, FIFTEEN } from "../../shared";
import { colors } from "../../theme/colors";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { BASE_URL } from "../../helper/Constants";
import { toFixedFive, toFixedThree } from "../../helper/utility";
import { useAppSelector } from "../../store/hooks";
import MiniSparkline from "../../shared/components/MiniSparkline";

const COIN_NAMES = { BTC: "Bitcoin", ETH: "Ethereum", BNB: "BNB" };

const formatVolume = (vol) => {
  const n = Number(vol);
  if (!n || isNaN(n)) return "0";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return toFixedThree(n);
};

// Ref: 1) Full name, niche short name, samne icon → 2) Niche price → 3) Line chart (crypto style) → 4) Bottom today status
const MarketFeaturedCard = ({ data, chartData, chartId, onPress }) => {
  const theme = useAppSelector((state) => state.auth.theme);
  const change = Number(data?.change_percentage) ?? 0;
  const isPositive = change >= 0;
  const ticker = data?.base_currency || "---";
  const coinName = COIN_NAMES[ticker] || ticker;
  const textColor = theme !== "Dark" ? colors.black : colors.white;
  const subTextColor = theme !== "Dark" ? "#6B7280" : "rgba(255,255,255,0.65)";
  const priceStr = toFixedFive(data?.buy_price);
  const volumeStr = formatVolume(data?.volume);
  const cardContentWidth = (Dimensions.get("window").width / 2 - 22) - 28;
  const [chartWidth, setChartWidth] = React.useState(cardContentWidth);
  const priceNum = Number(data?.buy_price) || 0;
  const absoluteChange = (priceNum * Math.abs(change)) / 100;
  const absoluteStr = absoluteChange >= 1 ? absoluteChange.toFixed(2) : absoluteChange.toFixed(4);

  return (
    <TouchableOpacityView
      style={[styles.container, theme !== "Dark" ? styles.containerLight : styles.containerDark]}
      activeOpacity={0.7}
      onPress={() => onPress?.(data)}
    >
      {/* 1) Top: Full name (upar), niche short name, aur samne coin icon */}
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <AppText type={FOURTEEN} weight={SEMI_BOLD} color={textColor} numberOfLines={1}>
            {coinName}
          </AppText>
          <AppText type={TEN} style={[styles.symbolText, { color: subTextColor }]} numberOfLines={1}>
            {ticker}
          </AppText>
        </View>
        <View style={styles.iconWrap}>
          <FastImage
            resizeMode="contain"
            style={styles.coinLogo}
            source={{ uri: data?.icon_path ? BASE_URL + data.icon_path : null }}
          />
        </View>
      </View>

      {/* 2) Niche: Price (bada) + $ wala niche */}
      <View style={styles.priceSection}>
        {/* <AppText type={FIFTEEN} weight={SEMI_BOLD} color={textColor} style={styles.bigPrice} numberOfLines={1}>
          {priceStr}
        </AppText> */}
        <AppText type={FIFTEEN} style={[styles.dollarPrice, { color: colors.white }]} numberOfLines={1}>
          ${priceStr}
        </AppText>
      </View>

      {/* 3) Line chart – dark area, bright line, soft shadow, thin bottom line */}
      <View
        style={[styles.graphWrap,]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setChartWidth(w);
        }}
      >
        <MiniSparkline
          chartData={chartData}
          isPositive={isPositive}
          width={chartWidth}
          height={46}
          chartId={chartId}
          fallbackPrice={Number(data?.buy_price) || 100}
        />

        
      </View>

      {/* 4) 24H Volume row */}
      <AppText type={TEN} style={[styles.volumeText, { color: subTextColor, }]} numberOfLines={1}>
        24H Volume：{volumeStr} (USD)
      </AppText>

      {/* 5) Today pill – position absolute, card ke bottom par */}
      <View style={[styles.todayPill, isPositive ? styles.todayPillPositive : styles.todayPillNegative]}>
        <AppText type={TEN} weight={SEMI_BOLD} style={[styles.todayPillText, { color: textColor }]}>
          {isPositive ? "▲ " : "▼ "}{absoluteStr} ({isPositive ? "+" : ""}{toFixedThree(change)}%) Today
        </AppText>
      </View>
    </TouchableOpacityView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingBottom: 52,
    width: "100%",
    overflow: "hidden",
    borderWidth: 0.5,
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...(Platform.OS === "ios"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }
      : { elevation: 3 }),
  },
  containerLight: {
    backgroundColor: colors.themeElevationColor,
    borderColor: "#E8E8E8",
  },
  containerDark: {
    backgroundColor: colors.themeElevationColor,
    borderColor: "#302F2F",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameBlock: {},
  symbolText: { marginTop: 2, fontSize: 11 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  coinLogo: {
    width: 36,
    height: 36,
  },
  priceSection: {
    marginBottom: 10,
  },
  bigPrice: {
    fontSize: 18,
    marginBottom: 2,
  },
  dollarPrice: {
  },
  graphWrap: {
    width: "100%",
    alignSelf: "stretch",
    height: 46,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    // borderBottomWidth: 1,
    overflow: "hidden",
  },
  graphWrapDark: {
    backgroundColor: "rgba(0,0,0,0.28)",
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  graphWrapLight: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  volumeText: {
    fontSize: 11,
  },
  todayPill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: -14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  todayPillPositive: {
    backgroundColor: "rgba(100, 180, 155, 0.08)",
  },
  todayPillNegative: {
    backgroundColor: "rgba(255, 140, 130, 0.10)",
  },
  todayPillText: {
    textAlign: "left",
  },
});

export default MarketFeaturedCard;
