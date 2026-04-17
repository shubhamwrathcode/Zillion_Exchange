import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  ELEVEN,
  FOURTEEN,
  SEMI_BOLD,
  SIXTEEN,
  TEN,
  TWENTY,
  WHITE,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { useAppSelector } from "../../store/hooks";
import { back_ic, BACK_ICON, folder, NO_NOTIFICATION_ICON } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { useState } from "react";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import moment from "moment";
import { toFixedFive, twoFixedTwo } from "../../helper/utility";

const EarningHistory = () => {
  const theme = useAppSelector((state) => state.auth.theme);
  const subscribedActivePackages = useAppSelector(
    (state) => state.wallet.subscribedActivePackages
  );
  const subscribedCompletePackages = useAppSelector(
    (state) => state.wallet.subscribedCompletePackages
  );
  const subscribedCancelPackages = useAppSelector(
    (state) => state.wallet.subscribedCancelPackages
  );

  const [activeTab, setActiveTab] = useState("Active");

  let data =
    activeTab === "Active"
      ? subscribedActivePackages
      : activeTab === "Completed"
      ? subscribedCompletePackages
      : subscribedCancelPackages;

  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      <KeyBoardAware style={{ paddingHorizontal: 20 }}>
        {/* <View
          style={{
            borderWidth: 1,
            borderColor: "#595959",
            marginTop: 50,
            borderRadius: 12,
            margin: 10,
          }}
        > */}
        <View style={{flexDirection: "row", alignItems: "center", gap: 20}}>
        <TouchableOpacity
          style={{ marginVertical: 20 }}
          onPress={() => NavigationService.goBack()}
        >
          <FastImage
            source={back_ic}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"Recent 
            tintColor={colors.white}
          />
        </TouchableOpacity>
        <AppText style={{ margin: 10 }} weight={SEMI_BOLD} type={SIXTEEN} color={colors.white}>
          Recent Plans{" "}
        </AppText>
        </View>
        
        
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Active" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("Active")}
          >
            <AppText
             
              weight={SEMI_BOLD}
              type={SIXTEEN}
              style={[styles.tabLabel,{
              color: activeTab === "Active" ? colors.white : colors.secondaryText
              }]}
            >
              Active
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Completed" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("Completed")}
          >
            <AppText
              weight={SEMI_BOLD}
              type={SIXTEEN}
              style={[styles.tabLabel,{
                color: activeTab === "Completed" ? colors.white : colors.secondaryText
              }]}
            >
              Completed
            </AppText>
          </TouchableOpacity>
        </View>

        {data?.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {data?.map((item, index) => (
              <View key={item?._id || index} style={styles.historyCard}>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Currency</AppText>
                  <AppText type={ELEVEN} weight={SEMI_BOLD} color={colors.white}>{item?.currency}</AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>
                    {activeTab === "Active" ? "Deducted From" : "Received In"}
                  </AppText>
                  <AppText type={ELEVEN} style={{color: colors.buttonBg}}>
                    {activeTab === "Active"
                      ? (item?.wallet_type || "")?.toUpperCase()
                      : (item?.credited_wallet_type || "")?.toUpperCase()}{" "}
                    Wallet
                  </AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Duration</AppText>
                  <AppText type={ELEVEN} color={colors.white}>{item?.duration_days} days</AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Start Date</AppText>
                  <AppText type={ELEVEN} color={colors.white}>
                    {moment(item?.start_date).format("YYYY-MM-DD")}
                  </AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Mature Date</AppText>
                  <AppText type={ELEVEN} color={colors.white}>
                    {moment(item?.end_date).format("YYYY-MM-DD")}
                  </AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Subscription Amount</AppText>
                  <AppText type={ELEVEN} color={colors.white}>
                    {toFixedFive(Number(item?.invested_amount?.$numberDecimal || 0))} {item?.currency}
                  </AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Bonus Amount</AppText>
                  <AppText type={ELEVEN} color={YELLOW}>
                    +{toFixedFive(
                      Number(
                        (item?.expected_return?.$numberDecimal || 0) -
                          (item?.invested_amount?.$numberDecimal || 0)
                      )
                    )}
                  </AppText>
                </View>
                <View style={styles.cardRow}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>
                    {activeTab === "Active" ? "Receivable Amount" : "Received Amount"}
                  </AppText>
                  <AppText type={ELEVEN} color={colors.white}>
                    {toFixedFive(Number(item?.expected_return?.$numberDecimal || 0))} {item?.currency}
                  </AppText>
                </View>
                <View style={[styles.cardRow, styles.cardRowLast]}>
                  <AppText type={ELEVEN} color={colors.secondaryText}>Status</AppText>
                  <AppText type={ELEVEN}  style={{color: colors.buttonBg}}>
                    {item?.status}
                  </AppText>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <FastImage
              source={NO_NOTIFICATION_ICON}
              resizeMode="contain"
              style={{ width: 80, height: 80 }}
            />
          </View>
        )}

        {/* </View> */}
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default EarningHistory;

const styles = StyleSheet.create({
  tabsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerColor || "#3A3A3A",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: -1,
  },
  tabLabel: {
    fontSize: 15,
  },
  tabActive: {
    borderBottomWidth: 1,
    borderBottomColor: colors.buttonBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  historyCard: {
    backgroundColor: colors.themeElevationColor || "#282f3b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  cardRowLast: {
    borderBottomWidth: 0,
  },
  emptyState: {
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});
