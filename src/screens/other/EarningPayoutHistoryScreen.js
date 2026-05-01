import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import moment from "moment";
import {
  AppSafeAreaView,
  AppText,
  FOURTEEN,
  SEMI_BOLD,
  SIXTEEN,
  TEN,
  TWELVE,
} from "../../shared";
import { useTheme } from "../../hooks/useTheme";
import { useAppSelector } from "../../store/hooks";
import NavigationService from "../../navigation/NavigationService";
import { fetchPerDayPayoutHistory } from "../../actions/walletActions";
import { toFixedFive } from "../../helper/utility";
import { BACK_ICON } from "../../helper/ImageAssets";
import { showError } from "../../helper/logger";
import { colors } from "../../theme/colors";

const parsePayoutAmount = (amount) => {
  if (amount == null) return 0;
  if (typeof amount === "object" && amount?.$numberDecimal != null) {
    const n = parseFloat(amount.$numberDecimal);
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseFloat(typeof amount === "number" ? amount : String(amount));
  return Number.isFinite(n) ? n : 0;
};

const EarningPayoutHistoryScreen = () => {
  const route = useRoute();
  const subscription = route?.params?.subscription;
  const { colors: themeColors } = useTheme();
  const userData = useAppSelector((s) => s.auth.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    const uid = userData?._id ?? userData?.user_id ?? userData?.userId;
    const sid = subscription?._id;
    if (!sid) {
      setError("Missing subscription.");
      setLoading(false);
      return;
    }
    if (!uid) {
      const msg = "Please log in again.";
      setError(msg);
      setLoading(false);
      showError(msg);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetchPerDayPayoutHistory(uid, sid);
    setLoading(false);
    if (res.ok) {
      setList(res.list);
    } else {
      setError(res.message || "Could not load payout history.");
    }
  }, [userData, subscription?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const currency = subscription?.currency || "";

  return (
    <AppSafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <FastImage
            source={BACK_ICON}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
            tintColor={themeColors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <AppText type={SIXTEEN} weight={SEMI_BOLD} style={{ color: themeColors.text }}>
            Daily payout history
          </AppText>
          <AppText type={TEN} style={{ color: themeColors.secondaryText, marginTop: 4 }}>
            Day-by-day payouts for this subscription.
          </AppText>
        </View>
        {currency ? (
          <View style={[styles.badge, { borderColor: themeColors.border }]}>
            <AppText type={TEN} weight={SEMI_BOLD} style={{ color: themeColors.text }}>
              {currency}
            </AppText>
          </View>
        ) : (
          <View style={{ width: 8 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <AppText type={TWELVE} style={{ color: themeColors.secondaryText, marginTop: 12 }}>
            Loading payout history…
          </AppText>
        </View>
      ) : error ? (
        <View style={styles.padded}>
          <AppText type={FOURTEEN} style={{ color: colors.red }}>
            {error}
          </AppText>
        </View>
      ) : list.length === 0 ? (
        <View style={[styles.centered, styles.padded]}>
          <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: themeColors.text }}>
            No payouts yet
          </AppText>
          <AppText type={TWELVE} style={{ color: themeColors.secondaryText, marginTop: 8, textAlign: "center" }}>
            Daily rewards will appear here after each payout is processed for this plan.
          </AppText>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppText type={TEN} style={{ color: themeColors.secondaryText, marginBottom: 12 }}>
            {list.length} payout{list.length !== 1 ? "s" : ""} recorded
          </AppText>
          {list.map((row, ri) => (
            <View
              key={row._id || `payout-${row.day}-${ri}`}
              style={[styles.rowCard, { backgroundColor: themeColors.themeElevationColor, borderColor: themeColors.border }]}
            >
              <View style={styles.rowTop}>
                <AppText type={TEN} style={{ color: themeColors.secondaryText }}>
                  Day {String(row.day ?? "—")}
                </AppText>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: themeColors.text }}>
                  {toFixedFive(parsePayoutAmount(row.amount))} {currency}
                </AppText>
              </View>
              <View style={styles.rowBottom}>
                <View style={[styles.rowCol, { marginRight: 10 }]}>
                  <AppText type={TEN} style={{ color: themeColors.secondaryText }}>Paid at</AppText>
                  <AppText type={TWELVE} style={{ color: themeColors.text, marginTop: 4 }}>
                    {row.paid_at ? moment(row.paid_at).format("MMM D, YYYY · HH:mm") : "—"}
                  </AppText>
                </View>
                <View style={styles.rowCol}>
                  <AppText type={TEN} style={{ color: themeColors.secondaryText }}>Next payout</AppText>
                  <AppText type={TWELVE} style={{ color: themeColors.text, marginTop: 4 }}>
                    {row.next_payout_date ? moment(row.next_payout_date).format("MMM D, YYYY · HH:mm") : "—"}
                  </AppText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </AppSafeAreaView>
  );
};

export default EarningPayoutHistoryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTextWrap: { flex: 1, minWidth: 0 },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  padded: { paddingHorizontal: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  rowCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowCol: { flex: 1, minWidth: 0 },
});
