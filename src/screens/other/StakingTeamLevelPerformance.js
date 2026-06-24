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
import {
  NO_NOTIFICATION_ICON,
  NO_NOTIFICATION_ICON_LIGHT,
  wallet_coins_balance,
  wallet_coins_balance2,
  wallet_coins_balance3,
  wallet_coins_balance4,
} from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import { appOperation } from "../../appOperation";

const formatNum = (val, decimals = 2) => {
  if (val == null || val === undefined) return "0.00";
  const n = typeof val === "object" && val?.$numberDecimal
    ? parseFloat(val.$numberDecimal)
    : Number(val);
  if (isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const StakingTeamLevelPerformance = () => {
  const { colors: themeColors, theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState(null);

  const textColor = isDark ? colors.white : colors.black;
  const secondaryColor = isDark ? colors.descText : "#666";
  const cardBg = themeColors.themeElevationColor;
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const fetchTeamPerformance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await appOperation.customer.get_team_staking_performance();
      if (res?.success) {
        setTeamMembers(res?.data?.members || []);
        setSummary(res?.data?.summary || {});
      } else {
        setError(res?.message || "Failed to load team staking performance");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamPerformance();
  }, [fetchTeamPerformance]);

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
          Staking Team Level Performance
        </AppText>
        <AppText type={TEN} style={{ color: secondaryColor }}>
          Track your team's staking performance across every level.
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
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
              {summary?.total_team_members || 0}
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Total Team Members
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance} style={styles.balanceCardIcon} resizeMode="contain" />
          </View>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
              {summary?.members_with_staking || 0}
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Members With Staking
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance2} style={styles.balanceCardIcon} resizeMode="contain" />
          </View>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
              {formatNum(summary?.grand_total_staked_usdt || 0)} $
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Total Staked (USDT)
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance3} style={[styles.balanceCardIcon, { width: 55, height: 55 }]} resizeMode="contain" />
          </View>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: "#22C55E" }}>
              {formatNum(summary?.grand_total_active_usdt || 0)} $
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Active Staked (USDT)
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance4} style={styles.balanceCardIcon} resizeMode="contain" />
          </View>
        </View>
        <View style={[styles.balanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.balanceCardLeft}>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
              {formatNum(summary?.grand_total_completed_usdt || 0)} $
            </AppText>
            <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
              Completed Staked (USDT)
            </AppText>
          </View>
          <View style={styles.balanceCardIconWrap}>
            <FastImage source={wallet_coins_balance} style={styles.balanceCardIcon} resizeMode="contain" />
          </View>
        </View>
      </View>

      {/* Level-wise Summary */}
      {summary?.by_level && Object.keys(summary.by_level).length > 0 && (
        <View style={styles.sectionContainer}>
          <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor, marginBottom: 12 }}>
            Level-wise Summary
          </AppText>
          {Object.entries(summary.by_level)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([level, data]) => (
              <View key={level} style={[styles.assetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={styles.assetCardHeader}>
                  <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
                    Level {level}
                  </AppText>
                </View>
                <View style={[styles.assetCardDivider, { backgroundColor: dividerColor }]} />
                <View style={styles.assetDetails}>
                  <View style={styles.assetDetailRow}>
                    <AppText type={TEN} style={{ color: secondaryColor }}>Members</AppText>
                    <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{data?.members || 0}</AppText>
                  </View>
                  <View style={styles.assetDetailRow}>
                    <AppText type={TEN} style={{ color: secondaryColor }}>Total Staked</AppText>
                    <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(data?.total_staked_usdt || 0)} $</AppText>
                  </View>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Team Members Performance */}
      <View style={styles.sectionContainer}>
        <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor, marginBottom: 12 }}>
          Team Members Performance
        </AppText>
        {teamMembers?.length > 0 ? (
          teamMembers.map((member, index) => (
            <View key={member.user_id || index} style={[styles.assetCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={styles.assetCardHeader}>
                <View style={styles.rowBetween}>
                  <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
                    {member?.name || "—"}
                  </AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: colors.buttonBg }}>
                    Level {member?.level}
                  </AppText>
                </View>
              </View>
              <View style={[styles.assetCardDivider, { backgroundColor: dividerColor }]} />
              <View style={styles.assetDetails}>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Referral Code</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{member?.referral_code || "—"}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Total Staked (USDT)</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(member?.total_staked_usdt || 0)}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Active (USDT)</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: "#22C55E" }}>{formatNum(member?.active_staked_usdt || 0)}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Completed (USDT)</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>{formatNum(member?.completed_staked_usdt || 0)}</AppText>
                </View>
                <View style={styles.assetDetailRow}>
                  <AppText type={TEN} style={{ color: secondaryColor }}>Plans (Total / Active / Completed)</AppText>
                  <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: textColor }}>
                    {member?.plans_count || 0} / {member?.active_count || 0} / {member?.completed_count || 0}
                  </AppText>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <FastImage source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT} resizeMode="contain" style={styles.emptyIcon} />
            <AppText type={FOURTEEN} style={{ color: secondaryColor, marginTop: 12 }}>No team staking data found</AppText>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </View>
  );
};

export default StakingTeamLevelPerformance;

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
