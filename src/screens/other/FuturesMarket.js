import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { AppText, ELEVEN, SEMI_BOLD, TWELVE } from "../../shared";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { FUTURES_SCREEN } from "../../navigation/routes";
import { toFixedFive, toFixedThree } from "../../helper/utility";
import FastImage from "react-native-fast-image";
import { Coin, tetherIcon, bitcoinIcon, bnbIcon, NO_NOTIFICATION_ICON } from "../../helper/ImageAssets";
import { BASE_URL } from "../../helper/Constants";

const QUOTE_OPTIONS = [
  { key: "All", label: "All", icon: Coin },
  { key: "USDT", label: "USDT", icon: tetherIcon },
  { key: "BTC", label: "BTC", icon: bitcoinIcon },
  { key: "ETH", label: "ETH", icon: Coin },
  { key: "BNB", label: "BNB", icon: bnbIcon },
];
const TYPE_OPTIONS = [
  { key: "All", label: "All" },
  { key: "Gainers", label: "Gainers" },
  { key: "Losers", label: "Losers" },
  { key: "Trending", label: "Trending" },
];

const FuturesMarket = ({ search }) => {
  const theme = useAppSelector((state) => state.auth.theme);
  const futuresPairData = useAppSelector((state) => state.home.futuresPairs || []) || [];
  const [quoteCurrency, setQuoteCurrency] = useState("USDT");
  const [filterType, setFilterType] = useState("All");
  const isDark = theme === "Dark";

  const filterFuturesData = useMemo(() => {
    let data = Array.isArray(futuresPairData) ? [...futuresPairData] : [];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (item) =>
          item?.short_name?.toLowerCase()?.includes(s) || item?.name?.toLowerCase()?.includes(s)
      );
    }
    if (quoteCurrency !== "All") {
      data = data.filter((item) => item?.margin_asset?.toUpperCase() === quoteCurrency);
    }
    if (filterType === "Gainers") {
      data = data
        .filter((item) => Number(item?.change_percentage) > 0)
        .sort((a, b) => Number(b?.change_percentage) - Number(a?.change_percentage));
    } else if (filterType === "Losers") {
      data = data
        .filter((item) => Number(item?.change_percentage) < 0)
        .sort((a, b) => Number(a?.change_percentage) - Number(b?.change_percentage));
    } else if (filterType === "Trending") {
      data = data.sort((a, b) => Number(b?.volume) - Number(a?.volume));
    }
    return data;
  }, [futuresPairData, search, quoteCurrency, filterType]);

  const handleNavigate = (item) => {
    if (item?.short_name) {
      NavigationService.navigate(FUTURES_SCREEN, { pair: item });
    }
  };

  const chipBg = (selected) => (selected ? colors.themeElevationColor : "transparent");
  const chipTextColor = (selected) => (selected ? colors.white : (isDark ? "#9D9D9D" : "#666"));

  return (
    <View style={styles.container}>
      {/* Row 1: All, Gainers, Losers, Trending (same as Spot) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterScroll, styles.filterScrollType]}
        style={styles.filterRow}
      >
        {TYPE_OPTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setFilterType(key)}
            style={[styles.chip, { backgroundColor: "transparent" }]}
            activeOpacity={0.8}
          >
            <AppText type={ELEVEN} weight={SEMI_BOLD} style={{ color: chipTextColor(filterType === key) }}>
              {label}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Row 2: All, USDT, BTC, ETH, BNB with icons (same as Spot) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterScroll, styles.filterScrollType]}
        style={styles.filterRow}
      >
        {QUOTE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setQuoteCurrency(opt.key)}
            style={[styles.chip, styles.chipWithIcon, { backgroundColor: chipBg(quoteCurrency === opt.key) }]}
            activeOpacity={0.8}
          >
            {opt.key !== "All" && (
              <FastImage
                source={opt.icon}
                resizeMode="contain"
                style={styles.chipIcon}
              />
            )}
            <AppText type={ELEVEN} weight={SEMI_BOLD} style={{ color: chipTextColor(quoteCurrency === opt.key) }}>
              {opt.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filterFuturesData?.length > 0 ? (
        <FuturesList data={filterFuturesData} onPress={handleNavigate} theme={theme} />
      ) : (
        <View style={styles.empty}>
          <FastImage source={NO_NOTIFICATION_ICON} resizeMode="contain" style={{ width: 150, height: 150 }} />
          <AppText type={TWELVE} color={colors.disabledText}>
            No futures data at the moment.
          </AppText>
        </View>
      )}
    </View>
  );
};

export const FuturesList = ({ data, onPress, theme }) => {
  const textColor = theme !== "Dark" ? colors.black : colors.white;
  const secondaryColor = theme !== "Dark" ? "#666" : colors.secondaryText;
  return (
    <View style={styles.list}>
      {data.map((item, index) => {
        const isPositive = Number(item?.change_percentage) >= 0;
        const iconSource = item?.icon_path ? { uri: BASE_URL + item.icon_path } : Coin;
        return (
          <TouchableOpacity
            key={item?._id || index}
            style={[styles.row, { borderBottomColor: theme !== "Dark" ? "#eee" : colors.dividerColor }]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.nameCol}>
              <View style={styles.nameRow}>
                <View style={styles.iconWrap}>
                  <FastImage
                    source={iconSource}
                    resizeMode="contain"
                    style={styles.coinIconImg}
                  />
                </View>
                <View style={styles.nameBlock}>
                  <View style={styles.symbolRow}>
                    <AppText type={TWELVE} weight={SEMI_BOLD} color={textColor} numberOfLines={1}>
                      {item?.short_name}/{item?.margin_asset}
                    </AppText>
                    <View style={styles.perpBadge}>
                      <AppText type={ELEVEN} color={colors.disabledText}>Perp</AppText>
                    </View>
                  </View>
                  <AppText type={ELEVEN} style={[styles.volText, { color: secondaryColor }]} numberOfLines={1}>
                    Vol {toFixedThree(item?.volume)}
                  </AppText>
                </View>
              </View>
            </View>
            <View style={styles.priceCol}>
              <AppText type={TWELVE} weight={SEMI_BOLD} color={textColor} style={styles.priceText}>
                {toFixedFive(item?.buy_price)}
              </AppText>
              <View style={[styles.chgPill, isPositive ? styles.chgPillGreen : styles.chgPillRed]}>
                <AppText type={ELEVEN} weight={SEMI_BOLD} style={styles.chgPillText}>
                  {isPositive ? "+" : ""}{toFixedThree(item?.change_percentage)}%
                </AppText>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, marginTop: 4, paddingBottom: 12 },
  filterRow: { marginBottom: 4, maxHeight: 36 },
  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
  },
  filterScrollType: {
    gap: 3,
    paddingHorizontal: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chipWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  chipIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  list: { paddingBottom: 24, paddingHorizontal: 4, paddingTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
  },
  nameCol: { flex: 1, minWidth: 0, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  nameBlock: { flex: 1, minWidth: 0 },
  symbolRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  volText: { marginTop: 1 },
  priceCol: { flex: 1, minWidth: 0, alignItems: "flex-end", justifyContent: "center" },
  priceText: { textAlign: "right" },
  chgPill: {
    minWidth: 64,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  chgPillRed: { backgroundColor: colors.red },
  chgPillGreen: { backgroundColor: colors.green },
  chgPillText: { color: colors.white },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.inputBorder,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coinIconImg: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  perpBadge: {
    marginLeft: 2,
    backgroundColor: colors.inputBorder,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
});

export default FuturesMarket;
