import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  AppSafeAreaView,
  AppText,
  Toolbar,
} from "../../shared";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import { useAppSelector } from "../../store/hooks";
import FastImage from "react-native-fast-image";
import { NO_NOTIFICATION_ICON } from "../../helper/ImageAssets";
import { useDispatch } from "react-redux";
import { getOpenOrders } from "../../actions/walletActions";
import moment from "moment";
import OpenOrderSkeleton from "./OpenOrderSkeleton";
import { toFixedSix, toFixedEight } from "../../helper/utility";
import NavigationService from "../../navigation/NavigationService";
import { SPOT_ORDER_HISTORY_DETAIL } from "../../navigation/routes";
import { fontFamilySemiBold } from "../../theme/typography";

const OpenOrder = ({
  investments = [],
  totalSelfInvestment = 0,
  totalDownlineInvestment = 0,
  totalAllInvestment = 0,
}) => {
  const dispatch = useDispatch();
  const { colors: themeColors, isDark } = useTheme();
  const openOrdersRedux = useAppSelector((state) => state.home.openOrders);
  const [openOrders, setOpenOrders] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const limit = 10;

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    setOpenOrders([]);
    setIsInitialLoad(true);
    loadMoreData(0, true);
  }, []);

  useEffect(() => {
    if (openOrdersRedux == null) return; // still loading (skeleton visible)
    if (isInitialLoad) {
      setOpenOrders(openOrdersRedux);
      setIsInitialLoad(false);
    } else {
      setOpenOrders(prev => [...prev, ...openOrdersRedux]);
    }
    if (openOrdersRedux.length < limit) setHasMore(false);
    setLoading(false);
  }, [openOrdersRedux]);

  const loadMoreData = (currentSkip, isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    
    setLoading(true);
    setSkip(currentSkip);
    dispatch(getOpenOrders(currentSkip, limit));
  };
  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && hasMore && !loading) {
      const nextSkip = skip + limit;
      loadMoreData(nextSkip);
    }
  };

  const formatDateTimeCard = (dateString) => {
    if (!dateString) return "---";
    return moment(dateString).format("YYYY-MM-DD HH:mm:ss");
  };

  const getStatusColor = (status = "") => {
    const s = String(status).toUpperCase().trim();
    if (s === "FILLED" || s === "COMPLETED" || s === "EXECUTED") return colors.green;
    if (s === "REJECTED" || s === "CANCELLED" || s === "CANCELED") return colors.red;
    if (s === "PARTIAL") return colors.amber;
    if (s === "OPEN" || s === "PENDING") return colors.lightYellow;
    return themeColors.secondaryText;
  };

  const renderCard = (inv, idx) => {
    const currencyPair = inv?.side === "BUY"
      ? `${inv?.base_currency_short_name || inv?.ask_currency || inv?.base_currency}/${inv?.quote_currency_short_name || inv?.pay_currency || inv?.quote_currency}`
      : `${inv?.quote_currency_short_name || inv?.pay_currency || inv?.quote_currency}/${inv?.base_currency_short_name || inv?.ask_currency || inv?.base_currency}`;
    const qty = Number(inv?.quantity ?? inv?.filled ?? 0) || 0;
    const remaining = Number(inv?.remaining) || 0;
    const filled = qty > 0 ? qty - remaining : (Number(inv?.filled) || 0);
    const totalQty = qty || filled || 0;
    const price = Number(inv?.price) || 0;
    const avgPrice = Number(inv?.avg_execution_price) || price;
    const status = inv?.status || "";
    const isFilled = String(status).toUpperCase().trim() === "FILLED";
    const orderTypeLabel = (inv?.order_type === "MARKET" ? "Market" : "Limit") + " / " + (inv?.side === "BUY" ? "Buy" : "Sell");
    
    const getStatusLabel = (s = "") => {
      const statusUpper = s.toUpperCase().trim();
      if (statusUpper === "FILLED") return "Filled";
      if (statusUpper === "CANCELLED" || statusUpper === "CANCELED") return "Cancelled";
      if (statusUpper === "REJECTED") return "Rejected";
      if (statusUpper === "PARTIAL") return "Partial";
      if (statusUpper === "OPEN") return "Open";
      if (statusUpper === "PENDING") return "Pending";
      return s || "---";
    };
    const statusLabel = getStatusLabel(status);

    const textColor = themeColors.text;
    const labelColor = themeColors.secondaryText;

    return (
      <TouchableOpacity
        key={idx}
        activeOpacity={0.8}
        onPress={() => NavigationService.navigate(SPOT_ORDER_HISTORY_DETAIL, { order: inv })}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.pairRow}>
            <AppText style={[styles.cardTitle, { color: textColor }]}>{currencyPair}</AppText>
          </View>
          <AppText style={[styles.cardDate, { color: labelColor }]}>
            {formatDateTimeCard(inv?.updatedAt || inv?.createdAt)}
          </AppText>
        </View>

        <AppText
          style={[
            styles.orderTypeLabel,
            { color: inv?.side === "BUY" ? colors.green : colors.red },
          ]}
        >
          {orderTypeLabel}
        </AppText>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Amount:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {toFixedEight(filled)} / {toFixedEight(totalQty)}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Avg. / Price:</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {isFilled ? `${toFixedSix(avgPrice)} / ${toFixedSix(price)} (Counterparty 1)` : `0 / ${toFixedSix(price)}`}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: labelColor }]}>Status:</AppText>
          <AppText style={[styles.cardValue, { color: getStatusColor(status) }]}>{statusLabel}</AppText>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: themeColors.border }]} />
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      <Toolbar
        isSecond
        title={"All Open Orders"}
        style={{ width: "62%", backgroundColor: "transparent" }}
      />

      {(openOrdersRedux == null || isInitialLoad) ? (
        <OpenOrderSkeleton />
      ) : openOrders?.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {openOrders.map((inv, idx) => renderCard(inv, idx))}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.buttonBg || "#007AFF"} />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.noDataRow}>
          <FastImage
            source={NO_NOTIFICATION_ICON}
            resizeMode="contain"
            style={{ width: 80, height: 80 }}
          />
        </View>
      )}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 5,
    paddingBottom: 20,
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

  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 14,
    marginRight: 6,
    fontFamily: fontFamilySemiBold,
  },

  cardDate: {
    fontSize: 11,
  },

  orderTypeLabel: {
    fontSize: 12,
    fontWeight: "600",
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
    paddingTop: 50,
  },
  noDataText: {
    color: "#888",
    fontStyle: "italic",
    marginTop: 10,
    fontSize: 14,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OpenOrder;
