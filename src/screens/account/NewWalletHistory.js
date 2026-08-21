import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  Toolbar,
} from "../../shared";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import FastImage from "react-native-fast-image";
import { NO_NOTIFICATION_ICON, NO_NOTIFICATION_ICON_LIGHT, copyIcon } from "../../helper/ImageAssets";
import { getWalletHistory, getWithdrawalHistory } from "../../actions/walletActions";
import { useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";
import moment from "moment";
import NewWalletHistorySkeleton from "./NewWalletHistorySkeleton";
import NavigationService from "../../navigation/NavigationService";
import { WALLET_HISTORY_DETAILS_SCREEN } from "../../navigation/routes";
import { fontFamilySemiBold } from "../../theme/typography";
import { copyText } from "../../helper/utility";

const NewWalletHistory = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { colors: themeColors, isDark } = useTheme();
  const initialTab = route?.params?.tab || route?.params?.data || "Deposit";
  const [activeTab, setActiveTab] = useState(initialTab); // "Deposit" | "Withdrawal"
  const [walletHistory, setWalletHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDataLength, setTotalDataLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const limit = 10;

  const shortenAddress = (address, length = 6) => {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
  };

  const fetchPage = async (page, tab) => {
    setLoading(true);
    const skip = (page - 1) * limit;

    let res = null;
    if (tab === "Deposit") {
      res = await dispatch(getWalletHistory(skip, limit));
    } else {
      res = await dispatch(getWithdrawalHistory(skip, limit));
    }

    const list = Array.isArray(res?.list) ? res.list : [];
    const pagination = res?.pagination || {};
    setWalletHistory(list);
    setCurrentPage(page);
    const totalCount = pagination.total ?? list.length;
    setTotalDataLength(totalCount);
    setTotalPages(pagination.totalPages ?? Math.max(1, Math.ceil(totalCount / limit)));
    setIsInitialLoad(false);
    setLoading(false);
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setCurrentPage(1);
    setWalletHistory([]);
    setIsInitialLoad(true);
    fetchPage(1, newTab);
  };

  useEffect(() => {
    const tabFromRoute = route?.params?.tab || route?.params?.data || "Deposit";
    setActiveTab(tabFromRoute);
    fetchPage(1, tabFromRoute);
  }, [route?.params]);

  const handlePagination = (action) => {
    if (loading) return;
    if (action === "first" && currentPage > 1) {
      fetchPage(1, activeTab);
    } else if (action === "prev" && currentPage > 1) {
      fetchPage(currentPage - 1, activeTab);
    } else if (action === "next" && currentPage < totalPages) {
      fetchPage(currentPage + 1, activeTab);
    } else if (action === "last" && currentPage < totalPages) {
      fetchPage(totalPages, activeTab);
    }
  };

  const renderCard = (inv, idx) => {
    const textColor = themeColors.text;
    const isDeposit = activeTab === "Deposit";
    const typeLabel = isDeposit ? "Deposit" : "Withdrawal";
    const shortTxHash = shortenAddress(inv?.transaction_hash || inv?.txHash || inv?.transaction_number || "");
    const fullTxHash = inv?.transaction_hash || inv?.txHash || inv?.transaction_number || "";
    const isSuccess = !inv?.status || String(inv?.status).toUpperCase() === "SUCCESS" || String(inv?.status).toUpperCase() === "COMPLETED";
    const statusText = inv?.status ? String(inv?.status).toUpperCase() : "COMPLETED";
    const statusColor = isSuccess ? "#00C087" : String(inv?.status).toUpperCase() === "PENDING" ? "#FF9800" : "#F44336";

    const dateVal = inv?.createdAt || inv?.updatedAt;

    return (
      <TouchableOpacity
        key={idx}
        activeOpacity={0.8}
        onPress={() => NavigationService.navigate(WALLET_HISTORY_DETAILS_SCREEN, { item: inv })}
        style={styles.card}
      >
        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Date</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {dateVal ? moment(dateVal).format("DD/MM/YYYY") : "---"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Time</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {dateVal ? moment(dateVal).format("hh:mm A") : "---"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Transaction Type</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {typeLabel}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Currency</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {inv?.short_name || inv?.currency || inv?.coin || inv?.assetId || "---"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Chain</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {inv?.chain || inv?.chainId || "---"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Amount</AppText>
          <AppText style={[styles.cardValue, { color: textColor }]}>
            {inv?.amount ?? "0"}
          </AppText>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Tx Hash</AppText>
          <View style={styles.txHashRow}>
            <AppText style={[styles.cardValue, { color: textColor, marginRight: 6 }]}>
              {shortTxHash || "---"}
            </AppText>
            {fullTxHash ? (
              <TouchableOpacity onPress={() => copyText(fullTxHash)}>
                <FastImage
                  source={copyIcon}
                  style={{ width: 14, height: 14 }}
                  tintColor={isDark ? colors.white : colors.black}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.cardRow}>
          <AppText style={[styles.cardLabel, { color: textColor }]}>Status</AppText>
          <AppText style={[styles.cardValue, { color: statusColor, fontWeight: "700" }]}>
            {statusText}
          </AppText>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: isDark ? themeColors.border : "#E0E0E0" }]} />
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
        title={"Transaction history"}
        style={{ width: "75%", backgroundColor: "transparent" }}
      />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: isDark ? "#1E1F24" : "#F3F4F6" }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Deposit" && [
              styles.activeTabButton,
              { backgroundColor: isDark ? "#2C2D35" : colors.white },
            ],
          ]}
          onPress={() => handleTabChange("Deposit")}
          activeOpacity={0.8}
        >
          <AppText
            style={[
              styles.tabText,
              {
                color: activeTab === "Deposit" ? (colors.buttonBg || "#F3BB2B") : themeColors.secondaryText,
                fontFamily: activeTab === "Deposit" ? fontFamilySemiBold : undefined,
                fontWeight: activeTab === "Deposit" ? "600" : "400",
              },
            ]}
          >
            Deposit
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Withdrawal" && [
              styles.activeTabButton,
              { backgroundColor: isDark ? "#2C2D35" : colors.white },
            ],
          ]}
          onPress={() => handleTabChange("Withdrawal")}
          activeOpacity={0.8}
        >
          <AppText
            style={[
              styles.tabText,
              {
                color: activeTab === "Withdrawal" ? (colors.buttonBg || "#F3BB2B") : themeColors.secondaryText,
                fontFamily: activeTab === "Withdrawal" ? fontFamilySemiBold : undefined,
                fontWeight: activeTab === "Withdrawal" ? "600" : "400",
              },
            ]}
          >
            Withdrawal
          </AppText>
        </TouchableOpacity>
      </View>

      {isInitialLoad ? (
        <NewWalletHistorySkeleton />
      ) : walletHistory?.length > 0 ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.buttonBg || "#007AFF"} />
              </View>
            ) : (
              walletHistory.map((inv, idx) => renderCard(inv, idx))
            )}
          </ScrollView>

          {/* Pagination Footer */}
          <View style={[styles.paginationContainer, { borderTopColor: isDark ? themeColors.border : "#EAEAEA", backgroundColor: themeColors.background }]}>
            <AppText style={[styles.paginationInfoText, { color: themeColors.secondaryText }]}>
              {totalDataLength === 0 ? 0 : (currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalDataLength)} of {totalDataLength}
            </AppText>
            <View style={styles.paginationButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" },
                  currentPage <= 1 && styles.pageButtonDisabled,
                ]}
                disabled={currentPage <= 1 || loading}
                onPress={() => handlePagination("first")}
              >
                <AppText style={[styles.pageButtonText, { color: currentPage <= 1 ? (isDark ? "#555" : "#CCC") : themeColors.text }]}>
                  «
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" },
                  currentPage <= 1 && styles.pageButtonDisabled,
                ]}
                disabled={currentPage <= 1 || loading}
                onPress={() => handlePagination("prev")}
              >
                <AppText style={[styles.pageButtonText, { color: currentPage <= 1 ? (isDark ? "#555" : "#CCC") : themeColors.text }]}>
                  ‹
                </AppText>
              </TouchableOpacity>

              <View style={[styles.currentPageIndicator, { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" }]}>
                <AppText style={[styles.currentPageText, { color: themeColors.text }]}>
                  {currentPage} / {totalPages}
                </AppText>
              </View>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" },
                  currentPage >= totalPages && styles.pageButtonDisabled,
                ]}
                disabled={currentPage >= totalPages || loading}
                onPress={() => handlePagination("next")}
              >
                <AppText style={[styles.pageButtonText, { color: currentPage >= totalPages ? (isDark ? "#555" : "#CCC") : themeColors.text }]}>
                  ›
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" },
                  currentPage >= totalPages && styles.pageButtonDisabled,
                ]}
                disabled={currentPage >= totalPages || loading}
                onPress={() => handlePagination("last")}
              >
                <AppText style={[styles.pageButtonText, { color: currentPage >= totalPages ? (isDark ? "#555" : "#CCC") : themeColors.text }]}>
                  »
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noDataRow}>
          <FastImage
            source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT}
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
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
    borderRadius: 10,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    paddingVertical: 14,
    width: "100%",
  },
  cardDivider: {
    height: 1,
    marginTop: 14,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  txHashRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardValue: {
    fontSize: 13,
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
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  paginationInfoText: {
    fontSize: 12,
    fontWeight: "500",
  },
  paginationButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  currentPageIndicator: {
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  currentPageText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default NewWalletHistory;
