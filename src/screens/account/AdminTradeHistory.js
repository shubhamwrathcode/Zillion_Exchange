import React, { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  GREEN,
  Header,
  RED,
  Toolbar,
  WHITE,
  YELLOW,
} from "../../shared";
import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import FastImage from "react-native-fast-image";
import { folder, NO_NOTIFICATION_ICON } from "../../helper/ImageAssets";
import { useDispatch } from "react-redux";
import { getAdminTrades } from "../../actions/walletActions";
import moment from "moment";
import AdminTradeHistorySkeleton from "./AdminTradeHistorySkeleton";
import { toFixedSix } from "../../helper/utility";

const AdminTradeHistory = ({

}) => {
  const dispatch = useDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const adminTradeList = useAppSelector((state) => state.wallet.adminTradeList);

  let skip = 0;
  let limit = 200;
  // const filteredInvestments = investments.filter(
  //   (inv) => inv.type === "self" || inv.your_upline_percent > 0
  // );

  useEffect(() => {
    dispatch(getAdminTrades(skip, limit));
  }, []);

  const headers = [
    "Sr no.",
    "Date",
    "Amount",
    "Description",
    "Status",
  ];

  return (
    <AppSafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.newThemeColor },
      ]}
    >
      <Toolbar
        isSecond
        title={"Bonus History"}
        style={{ width: "62%", backgroundColor: "transparent" }}
      />
      {adminTradeList == null ? (
        <AdminTradeHistorySkeleton />
      ) : adminTradeList?.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableWrapper}>
          <ScrollView stickyHeaderIndices={[0]}>
            {/* Table Header */}
            {adminTradeList.length > 0 && (
              <ScrollView style={[styles.row, styles.headerRow]} horizontal>
                {headers.map((h, idx) => (
                  <AppText key={idx} style={[styles.cell, styles.headerCell]}>
                    {h}
                  </AppText>
                ))}
              </ScrollView>
            )}

            {/* Table Body */}
            {adminTradeList.length > 0 ? (
              adminTradeList.map((inv, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.row,
                    idx % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <AppText style={styles.cell}>{idx + 1}</AppText>
                  <AppText style={styles.cell}>
                    {moment(inv?.createdAt).format("lll")}
                  </AppText>
            
                  <AppText style={styles.cell}>
                    {toFixedSix(inv?.amount)} {inv?.short_name}
                  </AppText>
                  <AppText style={styles.cell}>
                    {inv?.description}
                  </AppText>
                  <AppText style={[styles.cell, {color: colors.green}]}>
                    {inv?.status}
                  </AppText>
                </View>
              ))
            ) : (
              <View style={styles.noDataRow}>
                <FastImage
                  source={folder}
                  resizeMode="contain"
                  style={{ width: 80, height: 80 }}
                />
                <AppText style={styles.noDataText}>No Data</AppText>
              </View>
            )}
          </ScrollView>
        </View>
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
  container: { padding: 10, flex: 1 },

  summaryCard: {
    // backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  summaryList: { gap: 4 },
  summaryItem: { fontSize: 14 },
  summaryLabel: { fontWeight: "bold" },

  tableWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    // backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  row: { flexDirection: "row" },
  headerRow: {
    // backgroundColor: "#FFD700",
    borderBottomWidth: 2,
    borderBottomColor: "#b8860b",
  },
  //   evenRow: { backgroundColor: "#fff" },
  //   oddRow: { backgroundColor: "#f9f9f9" },
  //
  cell: {
    width: 110,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    textAlign: "center",
    // color:
  },
  headerCell: { fontWeight: "bold", fontSize: 13 },

  noDataRow: { justifyContent: "center", alignItems: "center", flex: 1 },
  noDataText: { color: "#888", fontStyle: "italic" },
});

export default AdminTradeHistory;
