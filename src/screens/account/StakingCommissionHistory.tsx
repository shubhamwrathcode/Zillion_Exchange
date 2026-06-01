import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  AppSafeAreaView,
  AppText,
  Toolbar,
} from "../../shared";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getStakingReferralCommissions } from "../../actions/walletActions";
import moment from "moment";
import FastImage from "react-native-fast-image";
import { folder, NO_NOTIFICATION_ICON, NO_NOTIFICATION_ICON_LIGHT } from "../../helper/ImageAssets";
import { fontFamilySemiBold } from "../../theme/typography";
import StakingCommissionHistorySkeleton from "./StakingCommissionHistorySkeleton";

const { width: screenWidth } = Dimensions.get("window");

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatUserName = (user: any) => {
  if (!user) return "—";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return user.userName || name || user.uuid || "—";
};

const StakingCommissionHistory = () => {
  const dispatch = useAppDispatch();
  const { colors: themeColors, isDark } = useTheme();
  
  const stakingCommissionData = useAppSelector(
    (state) => state.wallet.stakingCommissionData
  );

  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    dispatch(getStakingReferralCommissions(page, limit));
  }, [page]);

  const items = stakingCommissionData?.items || [];
  const summary = stakingCommissionData?.summary || {
    totalCommission: 0,
    byLevel: { level1: 0, level2: 0, level3: 0 },
  };
  const pagination = stakingCommissionData?.pagination || {
    total: 0,
    totalPages: 1,
  };

  const currencySymbol = items[0]?.currency?.short_name || items[0]?.plan?.currency || "USDT";

  const renderCard = (item: any, idx: number) => {
    const sym = item?.currency?.short_name || item?.plan?.currency || "USDT";
    const textColor = themeColors.text;
    const labelColor = themeColors.secondaryText;

    return (
      <View key={item?.id || idx} style={styles.card}>
        <View style={styles.topRow}>
          <AppText style={[styles.orderTypeLabel, { color: colors.buttonBg }]}>
            Level {item?.level ?? "—"}
          </AppText>
          <AppText style={[styles.cardDate, { color: labelColor }]}>
            {item?.credited_at ? moment(item.credited_at).format("YYYY-MM-DD HH:mm") : "—"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>From User:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]} numberOfLines={1}>
            {formatUserName(item?.from_user)}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Currency:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>{sym}</AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Payout Amount:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {toNum(item?.payout_amount)} {sym}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Commission %:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {toNum(item?.commission_percent)}%
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Commission Amount:</AppText>
          <AppText style={[styles.cardValue, { color: colors.green, fontWeight: "700" }]}>
            +{toNum(item?.commission_amount)} {sym}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Plan Duration:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {item?.plan?.duration_days != null ? `${item.plan.duration_days} days` : "—"}
          </AppText>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
      </View>
    );
  };

  return (
    <AppSafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: themeColors.background },
      ])}
    >
      <Toolbar
        isSecond
        title={"Staking Commission"}
        style={{ width: "70%", backgroundColor: "transparent" }}
      />

      {stakingCommissionData === undefined ? (
        <StakingCommissionHistorySkeleton />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f9f9f9", borderColor: themeColors.border }]}>
            <AppText style={[styles.summaryTitle, { color: themeColors.text }]}>💼 Staking Commission Summary</AppText>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <AppText style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>Total Commission</AppText>
                <AppText style={styles.summaryValue} color="YELLOW">
                  {toNum(summary.totalCommission)} {currencySymbol}
                </AppText>
              </View>
              <View style={styles.summaryItem}>
                <AppText style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>Level 1</AppText>
                <AppText style={styles.summaryValue} color="GREEN">
                  {toNum(summary.byLevel?.level1)} {currencySymbol}
                </AppText>
              </View>
              <View style={styles.summaryItem}>
                <AppText style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>Level 2</AppText>
                <AppText style={[styles.summaryValue, { color: themeColors.text }]}>
                  {toNum(summary.byLevel?.level2)} {currencySymbol}
                </AppText>
              </View>
              <View style={styles.summaryItem}>
                <AppText style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>Level 3</AppText>
                <AppText style={[styles.summaryValue, { color: themeColors.text }]}>
                  {toNum(summary.byLevel?.level3)} {currencySymbol}
                </AppText>
              </View>
            </View>
          </View>

          {/* History Cards Section */}
          {items.length > 0 ? (
            <View style={styles.listContainer}>
              {items.map((item: any, idx: number) => renderCard(item, idx))}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled, { borderColor: themeColors.border }]}
                    disabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <AppText style={{ color: page <= 1 ? colors.disabledText : themeColors.text }}>Prev</AppText>
                  </TouchableOpacity>

                  <AppText style={[styles.pageIndicator, { color: themeColors.text }]}>
                    Page {page} of {pagination.totalPages}
                  </AppText>

                  <TouchableOpacity
                    style={[styles.pageBtn, page >= pagination.totalPages && styles.pageBtnDisabled, { borderColor: themeColors.border }]}
                    disabled={page >= pagination.totalPages}
                    onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    <AppText style={{ color: page >= pagination.totalPages ? colors.disabledText : themeColors.text }}>Next</AppText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noDataRow}>
              <FastImage
                source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT}
                resizeMode="contain"
                style={{ width: 80, height: 80 }}
              />
              <AppText style={[styles.noDataText, { color: themeColors.secondaryText }]}>
                No Commission History
              </AppText>
            </View>
          )}
        </ScrollView>
      )}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  summaryTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 12 },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 11, marginBottom: 2 },
  summaryValue: { fontSize: 13, fontWeight: "700" },
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
  cardDate: {
    fontSize: 11,
  },
  orderTypeLabel: {
    fontSize: 12,
    fontFamily: fontFamilySemiBold,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 12,
    flex: 1,
  },
  cardValue: {
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  noDataRow: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingVertical: 100,
  },
  noDataText: {
    marginTop: 15,
    fontStyle: "italic",
    fontSize: 13,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 15,
  },
  pageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default StakingCommissionHistory;
