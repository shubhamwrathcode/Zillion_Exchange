import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  AppText,
  FOURTEEN,
  SEMI_BOLD,
  TEN,
  TWELVE,
  YELLOW,
} from "../../shared";
import FastImage from "react-native-fast-image";
import { NO_NOTIFICATION_ICON, NO_NOTIFICATION_ICON_LIGHT, wallet_coins_balance, wallet_coins_balance2 } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import { appOperation } from "../../appOperation";
import moment from "moment";

const formatNum = (val, decimals = 2) => {
  if (val == null || val === undefined) return "0.00";
  const n = typeof val === "object" && val?.$numberDecimal
    ? parseFloat(val.$numberDecimal)
    : Number(val);
  if (isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatToNineDecimals = (val) => {
  if (val == null || val === undefined) return "0";
  const n = typeof val === "object" && val?.$numberDecimal
    ? parseFloat(val.$numberDecimal)
    : Number(val);
  if (isNaN(n)) return "0";
  return parseFloat(n.toFixed(9)).toString();
};

const BrokerageCommission = () => {
  const { colors: themeColors, theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [brokerageList, setBrokerageList] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState(null);

  const textColor = isDark ? colors.white : colors.black;
  const secondaryColor = isDark ? colors.descText : "#666";
  const cardBg = themeColors.themeElevationColor;
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const fetchBrokerageCommissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await appOperation.customer.get_brokerage_commissions(1, 100);
      if (res?.success) {
        setBrokerageList(Array.isArray(res?.data) ? res.data : []);
        setSummary(res?.summary || {});
      } else {
        setError(res?.message || "Failed to load brokerage commissions");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrokerageCommissions();
  }, [fetchBrokerageCommissions]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.buttonBg} />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.content]}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor, marginBottom: 8 }}>
          Brokerage Commission
        </AppText>
        <AppText type={TEN} style={{ color: secondaryColor }}>
          See how much trade commission you earned, from whom and when.
        </AppText>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: "rgba(229,57,53,0.1)", borderColor: "#E53935" }]}>
          <AppText type={TWELVE} style={{ color: "#E53935" }}>{error}</AppText>
        </View>
      ) : null}

      {/* Summary Grid */}
      <View style={styles.balanceGrid}>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: "#22C55E" }}>
              {formatToNineDecimals(summary?.total_received || 0)} $
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Total Commission Received
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance} style={styles.balanceCardIcon} resizeMode="contain" />
          </View>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
              {brokerageList?.length || 0}
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Total Commission Entries
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance2} style={[styles.balanceCardIcon, { width: 55, height: 55 }]} resizeMode="contain" />
          </View>
        </View>
      </View>

      {/* Level-wise Summary */}
      {summary?.by_level && Object.keys(summary.by_level).length > 0 && (
        <View style={styles.sectionContainer}>
          <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor, marginBottom: 12 }}>
            Level-wise Commission
          </AppText>
          {Object.entries(summary.by_level)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([level, amount]) => (
              <View key={level} style={[styles.assetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={styles.assetCardHeader}>
                  <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
                    Level {level}
                  </AppText>
                </View>
                <View style={[styles.assetCardDivider, { backgroundColor: dividerColor }]} />
                <View style={styles.assetDetails}>
                  <View style={styles.assetDetailRow}>
                    <AppText type={TEN} style={{ color: secondaryColor }}>Entries</AppText>
                    <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{summary?.by_level_count?.[level] || 0}</AppText>
                  </View>
                  <View style={styles.assetDetailRow}>
                    <AppText type={TEN} style={{ color: secondaryColor }}>Commission</AppText>
                    <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(amount || 0)} $</AppText>
                  </View>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Commission History List */}
      <View style={styles.sectionContainer}>
        <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor, marginBottom: 12 }}>
          Commission History
        </AppText>
        {brokerageList?.length > 0 ? (
          brokerageList.map((item, index) => (
            <View key={item._id || index} style={[styles.assetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.assetCardHeader}>
                <View style={styles.rowBetween}>
                  <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
                    {item?.from_user?.name || item?.from_user?.uuid || "—"}
                  </AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: colors.buttonBg }}>
                    Level {item?.level}
                  </AppText>
                </View>
              </View>
              <View style={[styles.assetCardDivider, { backgroundColor: dividerColor }]} />
              <View style={styles.assetDetails}>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Currency</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{item?.currency || "—"}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Trade Fee</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(item?.trade_fee || 0)}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Commission %</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(item?.commission_percentage || 0)}%</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Commission Amount</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: "#22C55E" }}>+{formatToNineDecimals(item?.commission_amount || 0)} {item?.currency}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Date</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>
                    {item?.created_at ? moment(item.created_at).format("DD/MM/YYYY hh:mm A") : "—"}
                  </AppText>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <FastImage source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT} resizeMode="contain" style={styles.emptyIcon} />
            <AppText type={FOURTEEN} style={{ color: secondaryColor, marginTop: 12 }}>No brokerage commission found</AppText>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
};

export default BrokerageCommission;

const styles = StyleSheet.create({
  container: {},
  content: { paddingBottom: 20, paddingTop: 12 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  headerRow: {
    marginBottom: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  balanceCard: {
    width: "47%",
    minWidth: "47%",
    height: 95,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    }),
  },
  balanceCardLeft: {
    flex: 1,
    minWidth: 0,
  },
  balanceCardIconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCardIcon: {
    width: 44,
    height: 44,
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  assetCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    }),
  },
  assetCardHeader: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetCardDivider: {
    height: 1,
    marginBottom: 8,
  },
  assetDetails: { gap: 6 },
  assetDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    opacity: 0.7,
  },
});
