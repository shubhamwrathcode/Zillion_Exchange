import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  Button,
  ELEVEN,
  FIFTEEN,
  FOURTEEN,
  SEMI_BOLD,
  SIXTEEN,
  TEN,
  TWELVE,
  WHITE,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import FastImage from "react-native-fast-image";
import {
  searchIcon,
  earningAsset1,
  earnAsset2,
  NO_NOTIFICATION_ICON,
  NO_NOTIFICATION_ICON_LIGHT,
  bitcoinIcon,
  tetherIcon,
  lock_ic,
  calendarIcon,
  checkIcon,
  downIcon,
  earningIcon,
  wallet_coins_balance,
  wallet_coins_balance2,
  wallet_coins_balance3,
  wallet_coins_balance4,
  earning_balance_vector,
  earining_bnr_vector,
  Down_Imgs,
} from "../../helper/ImageAssets";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  cancelEarningSubscription,
  getEarningPortfolio,
  getEarningPortfolioSummary,
  getPackageList,
  getSubscribedPackageList,
} from "../../actions/walletActions";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/colors";
import EarningSkeleton from "./EarningSkeleton";
import { BASE_URL, IMAGE_BASE_URL } from "../../helper/Constants";
import NavigationService from "../../navigation/NavigationService";
import { EARNING_PAYOUT_HISTORY_SCREEN } from "../../navigation/routes";
import { useTheme } from "../../hooks/useTheme";
import { toFixedFive } from "../../helper/utility";
import moment from "moment";
import Carousel from "react-native-reanimated-carousel";
import LinearGradient from "react-native-linear-gradient";
import { Screen } from "../../theme/dimens";
import CustomDots from "../home/CustomDots";
import EarningDashboard from "./EarningDashboard";
import StakingTeamLevelPerformance from "./StakingTeamLevelPerformance";
import ReferralPerformanceHistory from "./ReferralPerformanceHistory";
import BrokerageCommission from "./BrokerageCommission";
import { showError } from "../../helper/logger";

const formatNum = (val, decimals = 2) => {
  if (val == null || val === undefined) return "0.00";
  const n = typeof val === "object" && val?.$numberDecimal
    ? parseFloat(val.$numberDecimal)
    : Number(val);
  if (isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

/** Same field resolution as web `readStakingMoney` — supports `$numberDecimal` or plain numbers. */
const readStakingMoney = (item, ...keys) => {
  for (const k of keys) {
    const v = item?.[k];
    if (v == null) continue;
    if (typeof v === "object" && v?.$numberDecimal != null) {
      const n = parseFloat(v.$numberDecimal);
      if (Number.isFinite(n)) return n;
    } else {
      const n = parseFloat(typeof v === "number" ? v : String(v));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
};

const formatWalletTypeLabel = (wt) => {
  const w = String(wt || "").trim();
  if (!w) return "";
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
};

const CARD_GAP = 10;
const CAROUSEL_WIDTH = Screen.Width - 40;
const CARD_WIDTH = (CAROUSEL_WIDTH - CARD_GAP) / 2;
const SLIDE_WIDTH = CARD_WIDTH + CARD_GAP;
const baseOptions = {
  vertical: false,
  width: SLIDE_WIDTH,
  height: 165,
};

const Earning = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { colors: themeColors, theme, isDark } = useTheme();
  const packageList = useAppSelector((state) => state.wallet.packageList);
  // const earningPortfolio = useAppSelector(
  //   (state) => state.wallet.earningPortfolio
  // );
  const subscribedActivePackages = useAppSelector(
    (state) => state.wallet.subscribedActivePackages
  );
  const subscribedCompletePackages = useAppSelector(
    (state) => state.wallet.subscribedCompletePackages
  );
  const subscribedCancelPackages = useAppSelector(
    (state) => state.wallet.subscribedCancelPackages
  );
  const earningPortfolio = useAppSelector(
    (state) => state.wallet.earningPortfolio
  );
  const earningPortfolioSummary = useAppSelector(
    (state) => state.wallet.earningPortfolioSummary
  );
  const userData = useAppSelector((state) => state.auth.userData);

  const [activeTab, setActiveTab] = useState(0); // 0 = Earning, 1 = Earning Dashboard, 2 = Recent Plans
  const [planTab, setPlanTab] = useState("Active"); // Active | Completed | Cancel (Recent Plans)
  const [activeSections, setActiveSections] = useState([]);
  const [expandedPlanKeys, setExpandedPlanKeys] = useState(new Set()); // All Plans card expand/collapse
  const planAnimValuesRef = useRef({}); // key -> Animated.Value(0|1) for open/close animation
  const [activeIndex, setActiveIndex] = useState(0);

  const getPlanAnimValue = useCallback((key) => {
    if (!planAnimValuesRef.current[key]) {
      planAnimValuesRef.current[key] = new Animated.Value(0);
    }
    return planAnimValuesRef.current[key];
  }, []);
  const [list, setList] = useState([]);
  const [value, setValue] = useState("");
  const [contentLoading, setContentLoading] = useState(() => {
    return !(packageList && packageList.length > 0);
  });

  const isFirstLoad = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingId, setCancellingId] = useState(null);

  const onRefresh = useCallback(async () => {
    console.log("Pull to refresh triggered! Fetching latest Earning data...");
    setRefreshing(true);
    await Promise.all([
      dispatch(getPackageList()),
      dispatch(getEarningPortfolio()),
      dispatch(getEarningPortfolioSummary()),
      dispatch(getSubscribedPackageList())
    ]);
    setRefreshing(false);
    console.log("Refresh Complete.");
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (route.params?.initialTab === 1) setActiveTab(1);
      if (route.params?.initialTab === 2) setActiveTab(5);

      if (isFirstLoad.current) {
        if (!packageList || packageList.length === 0) {
          setContentLoading(true);
        }
      }

      const fetchAll = async () => {
        try {
          await Promise.all([
            dispatch(getPackageList()),
            dispatch(getEarningPortfolio()),
            dispatch(getEarningPortfolioSummary()),
            dispatch(getSubscribedPackageList())
          ]);
        } catch (e) {
          console.error(e);
        } finally {
          if (!cancelled) {
            setContentLoading(false);
            isFirstLoad.current = false;
          }
        }
      };

      fetchAll();

      return () => {
        cancelled = true;
      };
    }, [dispatch, route.params?.initialTab])
  );

  useEffect(() => {
    getData();
  }, [value, packageList]);

  const getData = () => {
    if (value === "") {
      setList(packageList || []);
    } else {
      const filterData = (packageList || []).filter((data) =>
        (data?.currency?.toLowerCase() || "").includes((value || "").toLowerCase())
      );
      setList(filterData);
    }
  };

  // Min/max APR and duration from distribution (web-style All Plans)
  const getAprDurationRange = useCallback((item) => {
    const dist = item?.distribution || [];
    if (dist.length === 0) {
      return {
        minApr: item?.max_return_percentage ?? 0,
        maxApr: item?.max_return_percentage ?? 0,
        minDays: item?.max_duration_days ?? 0,
        maxDays: item?.max_duration_days ?? 0,
      };
    }
    const aprs = dist.map((d) => d.return_percentage ?? 0);
    const days = dist.map((d) => d.duration_days ?? 0);
    return {
      minApr: Math.min(...aprs),
      maxApr: Math.max(...aprs),
      minDays: Math.min(...days),
      maxDays: Math.max(...days),
    };
  }, []);

  // Carousel card: icon, name, Trending badge, Days | % APY - tap whole card to subscribe
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.carouselCard, { width: CARD_WIDTH, marginRight: CARD_GAP, backgroundColor: themeColors.themeElevationColor }]}
        activeOpacity={0.7}
        onPress={() => NavigationService.navigate("BuyPackage", { data: item })}
      >
        <View style={styles.currencyBit}>
          <View style={styles.currencyBitInner}>
            <FastImage
              source={{ uri: BASE_URL + item?.icon_path }}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <View>
              <AppText weight={SEMI_BOLD} type={SIXTEEN} color={themeColors.text}>
                {item?.currency}
              </AppText>
              <AppText type={TWELVE} color={themeColors.secondaryText} numberOfLines={1}>
                ({item?.currency_fullname})
              </AppText>
            </View>
          </View>
          <View style={styles.trendingBadge}>
            <AppText type={TEN} color={"#fff"}>Trending</AppText>
          </View>
        </View>
        <View style={styles.usdDetailList}>
          <View>
            <AppText type={TEN} color={themeColors.secondaryText}>Days</AppText>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} color={themeColors.text}>
              {item?.max_duration_days}
            </AppText>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <AppText type={TEN} color={themeColors.secondaryText}>% APY</AppText>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} color={YELLOW}>
              {typeof item?.max_return_percentage === "number"
                ? item.max_return_percentage.toFixed(2)
                : item?.max_return_percentage ?? "0"}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ANIM_DURATION = 350;

  const togglePlanExpand = (key) => {
    const anim = getPlanAnimValue(key);
    const isCurrentlyExpanded = expandedPlanKeys.has(key);

    if (isCurrentlyExpanded) {
      // Close: animate height to 0, then remove from state so both open & close animate
      Animated.timing(anim, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }).start(() => {
        setExpandedPlanKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });
    } else {
      // Only one card open at a time: close any other first, then open this one
      const prevKeys = Array.from(expandedPlanKeys);
      if (prevKeys.length > 0) {
        const otherKey = prevKeys[0];
        const otherAnim = getPlanAnimValue(otherKey);
        Animated.timing(otherAnim, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: false,
        }).start(() => {
          setExpandedPlanKeys(new Set([key]));
          anim.setValue(0);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              Animated.timing(anim, {
                toValue: 1,
                duration: ANIM_DURATION,
                useNativeDriver: false,
              }).start();
            });
          });
        });
      } else {
        anim.setValue(0);
        setExpandedPlanKeys(new Set([key]));
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            Animated.timing(anim, {
              toValue: 1,
              duration: ANIM_DURATION,
              useNativeDriver: false,
            }).start();
          });
        });
      }
    }
  };

  const onPressSubscribe = (item) => () => NavigationService.navigate("BuyPackage", { data: item });

  const confirmCancelPlan = useCallback(
    (item) => {
      const stakingId = item?._id;
      if (!stakingId) {
        showError("Unable to cancel. Please try again.");
        return;
      }
      Alert.alert(
        "Cancel plan",
        "Cancel this active earning plan? A cancellation fee may apply; the remaining balance will be refunded per platform rules.",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, cancel",
            style: "destructive",
            onPress: async () => {
              setCancellingId(stakingId);
              try {
                await dispatch(cancelEarningSubscription(stakingId, item?.currency));
              } finally {
                setCancellingId(null);
              }
            },
          },
        ]
      );
    },
    [dispatch]
  );

  const goToPayoutHistory = useCallback(
    (item) => {
      const stakingId = item?._id;
      const uid = userData?._id ?? userData?.user_id ?? userData?.userId;
      if (!stakingId) {
        showError("Unable to open payout history.");
        return;
      }
      if (!uid) {
        showError("Please log in again.");
        return;
      }
      NavigationService.navigate(EARNING_PAYOUT_HISTORY_SCREEN, { subscription: item });
    },
    [userData]
  );

  // All Plans card: icon + currency, APR, Duration, collapse caret. Card press = Subscribe (BuyPackage).
  const renderAllPlansCard = (item) => {
    const key = item?._id || item?.currency;
    const { minApr, maxApr, minDays, maxDays } = getAprDurationRange(item);
    const isExpanded = expandedPlanKeys.has(key);
    const animValue = getPlanAnimValue(key);
    const displayApr = minApr === maxApr ? `${minApr.toFixed(1)} %` : `${minApr.toFixed(1)} ~ ${maxApr.toFixed(1)} %`;
    const displayDuration = minDays === maxDays ? `${minDays} Days` : `${minDays} - ${maxDays} Days`;

    const detailsMaxHeight = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 90],
    });

    return (
      <TouchableOpacity
        key={key}
        style={[styles.allPlansCard, { backgroundColor: themeColors.themeElevationColor, borderColor: themeColors.border }]}
        activeOpacity={0.8}
        onPress={() => {
          if (isExpanded) {
            onPressSubscribe(item)();
          } else {
            togglePlanExpand(key);
          }
        }}
      >
        <View style={styles.allPlansCardHeader}>
          <View style={styles.allPlansCardTitleRow}>
            <FastImage
              source={{ uri: BASE_URL + item?.icon_path }}
              style={styles.allPlansCardIcon}
              resizeMode="contain"
            />
            <AppText type={FOURTEEN} weight={SEMI_BOLD} color={themeColors.text}>
              {item?.currency}
            </AppText>
          </View>
          <View style={{ padding: 4 }}>
            <FastImage
              source={Down_Imgs}
              style={[styles.allPlansCardCaretIcon, isExpanded && { transform: [{ rotate: "180deg" }] }]}
              resizeMode="contain"
              tintColor={themeColors.secondaryText}
            />
          </View>
        </View>
        {isExpanded ? (
          <Animated.View style={[styles.allPlansCardDetailsWrap, { maxHeight: detailsMaxHeight, overflow: "hidden" }]}>
            <View style={styles.allPlansCardDetails}>
              <View style={styles.allPlansCardDetailItem}>
                <AppText type={TEN} color={themeColors.secondaryText}>APR</AppText>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} color={themeColors.text}>
                  {displayApr}
                </AppText>
              </View>
              <View style={[styles.allPlansCardDetailItem, styles.allPlansCardDetailItemRight]}>
                <AppText type={TEN} color={themeColors.secondaryText}>Duration</AppText>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} color={themeColors.text}>
                  {displayDuration}
                </AppText>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.keyboardAware} contentContainerStyle={styles.keyboardAwareContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />}>
        <View style={styles.earningContentWrap}>
          {/* Top bar: title + Portfolio & History icons (like web) */}
          <View style={styles.topBar}>
            <AppText type={FIFTEEN} weight={SEMI_BOLD} color={themeColors.text} style={styles.topBarTitle}>
              Staking
            </AppText>

          </View>

          {/* Tabs: Earning | Earning Dashboard | Staking Team Level Performance | Referral Performance History | Brokerage Commission | Recent Plans */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.tabRow, { borderBottomColor: themeColors.border }]}
            contentContainerStyle={styles.tabRowContent}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && styles.tabActive]}
              onPress={() => setActiveTab(0)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 0 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Earning
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 1 && styles.tabActive]}
              onPress={() => setActiveTab(1)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 1 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Earning Dashboard
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 2 && styles.tabActive]}
              onPress={() => setActiveTab(2)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 2 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Staking Team Level Performance
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 3 && styles.tabActive]}
              onPress={() => setActiveTab(3)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 3 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Referral Performance Team
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 4 && styles.tabActive]}
              onPress={() => setActiveTab(4)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 4 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Brokerage Commission
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 5 && styles.tabActive]}
              onPress={() => setActiveTab(5)}
              activeOpacity={0.7}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={{
                  color: activeTab === 5 ? colors.buttonBg : themeColors.secondaryText,
                }}
              >
                Recent Plans
              </AppText>
            </TouchableOpacity>
          </ScrollView>

          {activeTab === 5 ? (
            <View style={styles.recentPlansWrap}>
              <View style={styles.planTabsWrapper}>
                <TouchableOpacity
                  style={[styles.planTab, planTab === "Active" && styles.planTabActive]}
                  onPress={() => setPlanTab("Active")}
                >
                  <AppText
                    type={FOURTEEN}
                    weight={SEMI_BOLD}
                    style={[styles.planTabLabel, { color: planTab === "Active" ? colors.buttonBg : themeColors.secondaryText }]}
                  >
                    Active
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.planTab, planTab === "Completed" && styles.planTabActive]}
                  onPress={() => setPlanTab("Completed")}
                >
                  <AppText
                    type={FOURTEEN}
                    weight={SEMI_BOLD}
                    style={[styles.planTabLabel, { color: planTab === "Completed" ? colors.buttonBg : themeColors.secondaryText }]}
                  >
                    Completed
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.planTab, planTab === "Cancel" && styles.planTabActive]}
                  onPress={() => setPlanTab("Cancel")}
                >
                  <AppText
                    type={FOURTEEN}
                    weight={SEMI_BOLD}
                    style={[styles.planTabLabel, { color: planTab === "Cancel" ? colors.buttonBg : themeColors.secondaryText }]}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
              </View>
              {(() => {
                const planList =
                  planTab === "Active"
                    ? subscribedActivePackages
                    : planTab === "Completed"
                      ? subscribedCompletePackages
                      : subscribedCancelPackages;
                if (!planList?.length) {
                  return (
                    <View style={styles.planEmptyState}>
                      <FastImage
                        source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT}
                        resizeMode="contain"
                        style={{ width: 80, height: 80 }}
                      />
                    </View>
                  );
                }
                return (
                  <ScrollView
                    style={styles.planScroll}
                    contentContainerStyle={styles.planScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {planList.map((item, index) => {
                      if (planTab === "Cancel") {
                        const refundN = readStakingMoney(item, "refund_amount", "refundAmount");
                        const feeN = readStakingMoney(item, "cancel_fee_amount", "fee_amount", "feeAmount", "cancelFeeAmount");
                        const feePctN = readStakingMoney(item, "cancel_fee_percent", "fee_percent", "feePercent", "cancelFeePercent");
                        const invested = readStakingMoney(item, "invested_amount") ?? 0;
                        return (
                          <View key={item?._id || index} style={[styles.planCard, { backgroundColor: themeColors.themeElevationColor }]}>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Currency</AppText>
                              <AppText type={ELEVEN} weight={SEMI_BOLD} color={themeColors.text}>{item?.currency}</AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Deducted From</AppText>
                              <AppText type={ELEVEN} style={{ color: colors.buttonBg }}>
                                {formatWalletTypeLabel(item?.wallet_type)} Wallet
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Duration</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>{item?.duration_days} days</AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Start Date</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>
                                {item?.start_date ? moment(item.start_date).format("YYYY-MM-DD") : "—"}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Mature Date</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>
                                {item?.end_date ? moment(item.end_date).format("YYYY-MM-DD") : "—"}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Subscription Amount</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>
                                {toFixedFive(invested)} {item?.currency}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Cancel fee %</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>
                                {feePctN != null ? `${formatNum(feePctN, 2)}%` : "—"}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Cancel fee</AppText>
                              <AppText type={ELEVEN} color={themeColors.text}>
                                {feeN != null ? `${toFixedFive(feeN)} ${item?.currency}` : "—"}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Refund Amount</AppText>
                              <AppText type={ELEVEN} style={{ color: YELLOW }}>
                                {refundN != null ? `${toFixedFive(refundN)} ${item?.currency}` : "—"}
                              </AppText>
                            </View>
                            <View style={styles.planCardRow}>
                              <AppText type={ELEVEN} color={themeColors.secondaryText}>Status</AppText>
                              <AppText type={ELEVEN} style={{ color: colors.buttonBg }}>
                                {item?.status}
                              </AppText>
                            </View>
                            <View style={[styles.planCardRow, styles.planCardActionsRow, styles.planCardRowLast]}>
                              <TouchableOpacity
                                onPress={() => goToPayoutHistory(item)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.planViewLinkBtn}
                                activeOpacity={0.7}
                              >
                                <AppText type={ELEVEN} weight={SEMI_BOLD} style={styles.planViewLinkText}>
                                  View
                                </AppText>
                              </TouchableOpacity>
                              <View style={{ width: 24 }} />
                            </View>
                          </View>
                        );
                      }

                      const invested = readStakingMoney(item, "invested_amount") ?? 0;
                      const expected = readStakingMoney(item, "expected_return") ?? 0;
                      const bonus = Math.max(0, expected - invested);
                      return (
                        <View key={item?._id || index} style={[styles.planCard, { backgroundColor: themeColors.themeElevationColor }]}>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Currency</AppText>
                            <AppText type={ELEVEN} weight={SEMI_BOLD} color={themeColors.text}>{item?.currency}</AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>
                              {planTab === "Active" ? "Deducted From" : "Received In"}
                            </AppText>
                            <AppText type={ELEVEN} style={{ color: colors.buttonBg }}>
                              {planTab === "Active"
                                ? formatWalletTypeLabel(item?.wallet_type)
                                : formatWalletTypeLabel(item?.credited_wallet_type)}{" "}
                              Wallet
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Duration</AppText>
                            <AppText type={ELEVEN} color={themeColors.text}>{item?.duration_days} days</AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Start Date</AppText>
                            <AppText type={ELEVEN} color={themeColors.text}>
                              {item?.start_date ? moment(item.start_date).format("YYYY-MM-DD") : "—"}
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Mature Date</AppText>
                            <AppText type={ELEVEN} color={themeColors.text}>
                              {item?.end_date ? moment(item.end_date).format("YYYY-MM-DD") : "—"}
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Subscription Amount</AppText>
                            <AppText type={ELEVEN} color={themeColors.text}>
                              {toFixedFive(invested)} {item?.currency}
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Bonus Amount</AppText>
                            <AppText type={ELEVEN} color={YELLOW}>
                              +{toFixedFive(bonus)}
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>
                              {planTab === "Active" ? "Receivable Amount" : "Received Amount"}
                            </AppText>
                            <AppText type={ELEVEN} color={themeColors.text}>
                              {toFixedFive(expected)} {item?.currency}
                            </AppText>
                          </View>
                          <View style={styles.planCardRow}>
                            <AppText type={ELEVEN} color={themeColors.secondaryText}>Status</AppText>
                            <AppText type={ELEVEN} style={{ color: colors.buttonBg }}>
                              {item?.status}
                            </AppText>
                          </View>
                          <View style={[styles.planCardRow, styles.planCardActionsRow, styles.planCardRowLast]}>
                            <TouchableOpacity
                              onPress={() => goToPayoutHistory(item)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.planViewLinkBtn}
                              activeOpacity={0.7}
                            >
                              <AppText type={ELEVEN} weight={SEMI_BOLD} style={styles.planViewLinkText}>
                                View
                              </AppText>
                            </TouchableOpacity>
                            {planTab === "Active" ? (
                              <TouchableOpacity
                                disabled={cancellingId === item._id}
                                onPress={() => confirmCancelPlan(item)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.planCancelBtnWrap}
                              >
                                {cancellingId === item._id ? (
                                  <ActivityIndicator size="small" color="#E53935" />
                                ) : (
                                  <AppText type={ELEVEN} weight={SEMI_BOLD} style={styles.planCancelBtnLabel}>
                                    Cancel
                                  </AppText>
                                )}
                              </TouchableOpacity>
                            ) : (
                              <View style={{ minWidth: 72 }} />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                );
              })()}
            </View>
          ) : activeTab === 1 ? (
            <EarningDashboard
              theme={theme}
              earningPortfolio={earningPortfolio}
              portfolioSummary={earningPortfolioSummary}
            >
              {(() => {
                const isDark = theme === "Dark";
                const textColor = isDark ? colors.white : colors.black;
                const secondaryColor = isDark ? themeColors.secondaryText : "#666";
                const cardBg = themeColors.themeElevationColor;
                const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
                const summary = {
                  totalInvested: earningPortfolioSummary?.total_invested ?? earningPortfolioSummary?.totalInvested ?? 0,
                  expectedReturn: earningPortfolioSummary?.total_expected_return ?? earningPortfolioSummary?.totalExpectedReturn ?? 0,
                  runningInvestment: earningPortfolioSummary?.total_running_investment ?? earningPortfolioSummary?.totalRunningInvestment ?? 0,
                  bonusRemaining: earningPortfolioSummary?.total_bonus_remaining ?? earningPortfolioSummary?.totalBonusRemaining ?? 0,
                };
                const dashboardCards = [
                  { label: "Total Invested", value: formatNum(summary.totalInvested), key: "invested", icon: wallet_coins_balance },
                  { label: "Expected Return", value: formatNum(summary.expectedReturn), key: "return", icon: wallet_coins_balance2 },
                  { label: "Running Investment", value: formatNum(summary.runningInvestment), key: "running", icon: wallet_coins_balance3 },
                  // { label: "Bonus Remaining", value: formatNum(summary.bonusRemaining), key: "bonus", icon: wallet_coins_balance4 },
                ];
                return (
                  <View style={styles.dashboardBalanceGrid}>
                    {dashboardCards.map((card) => (
                      <View key={card.key} style={[styles.dashboardBalanceCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <View style={styles.dashboardBalanceCardLeft}>
                          <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textColor }}>
                            {card.value} $
                          </AppText>
                          <AppText type={TEN} style={{ color: secondaryColor, marginTop: 6 }}>
                            {card.label}
                          </AppText>
                        </View>
                        <View style={styles.dashboardBalanceCardIconWrap}>
                          <FastImage source={card.icon} style={styles.dashboardBalanceCardIcon} resizeMode="contain" />
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </EarningDashboard>
          ) : activeTab === 2 ? (
            <StakingTeamLevelPerformance />
          ) : activeTab === 3 ? (
            <ReferralPerformanceHistory />
          ) : activeTab === 4 ? (
            <BrokerageCommission />
          ) : null}

          {activeTab === 0 && contentLoading && <EarningSkeleton />}
          {activeTab === 0 && !contentLoading && (
            <>
              {/* Earning tab header banner - above linear gradient card */}
              <View style={styles.earningHeaderBanner}>
                <View style={styles.earningHeaderBannerLeft}>
                  <AppText type={SIXTEEN} weight={SEMI_BOLD} style={{ color: themeColors.text, marginBottom: 6 }}>
                    Zillion Exchange Earning
                  </AppText>
                  <View style={styles.earningHeaderBannerSubrow}>
                    <AppText type={TEN} style={{ color: themeColors.secondaryText }}>
                      New user exclusive: Up to{" "}
                    </AppText>
                    <AppText type={TEN} weight={SEMI_BOLD} style={{ color: colors.buttonBg }}>
                      600% APR
                    </AppText>
                  </View>
                </View>
                {/* <FastImage source={earining_bnr_vector} style={styles.earningHeaderBannerImg} resizeMode="contain" /> */}
              </View>
              {/* Simple Earn Banner - shows when loader is false */}
              <LinearGradient
                colors={["#00D68F", "#00BF73", "#009959"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.simpleEarnBanner}
              >
                <LinearGradient
                  colors={["#6EA8FF", "#3F7CFF", "#1E56F5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lowRiskTag}
                >
                  <AppText type={TEN} weight={SEMI_BOLD} >
                    Low risk
                  </AppText>
                </LinearGradient>
                <AppText type={SIXTEEN} weight={SEMI_BOLD} color={WHITE} style={styles.bannerMainTitle}>
                  Claim assured returns with no lock-in
                </AppText>
                <View style={styles.featureIconsRow}>
                  <View style={styles.featureItem}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featureIconCircle}
                    >
                      <FastImage source={lock_ic} style={styles.featureIconImg} resizeMode="contain" tintColor="#FFFFFF" />
                    </LinearGradient>
                    <AppText type={TEN} color={WHITE} style={styles.featureText}>
                      Withdraw Anytime
                    </AppText>
                  </View>
                  <View style={styles.featureItem}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featureIconCircle}
                    >
                      <FastImage source={calendarIcon} style={styles.featureIconImg} resizeMode="contain" tintColor="#FFFFFF" />
                    </LinearGradient>
                    <AppText type={TEN} color={WHITE} style={styles.featureText}>
                      Daily Payouts
                    </AppText>
                  </View>
                  <View style={styles.featureItem}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featureIconCircle}
                    >
                      <FastImage source={checkIcon} style={styles.featureIconImg} resizeMode="contain" tintColor="#FFFFFF" />
                    </LinearGradient>
                    <AppText type={TEN} color={WHITE} style={styles.featureText}>
                      Secure Assets
                    </AppText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.whatIsSimpleEarn}
                  activeOpacity={0.8}
                  disabled
                >
                  <View style={styles.whatIsLeft}>
                    <LinearGradient
                      colors={["rgba(0,191,115,0.25)", "rgba(0,191,115,0.1)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.playBtnCircle}
                    >
                      <FastImage source={earningIcon} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor={colors.red} />
                    </LinearGradient>
                    <View>
                      <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: colors.black }}>
                        Grow your crypto with staking
                      </AppText>
                      <AppText type={TEN} style={{ color: colors.black }}>
                        Quick & Easy
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.whatIsRightIcons}>
                    <FastImage source={bitcoinIcon} style={styles.miniCryptoIcon} resizeMode="contain" />
                    <FastImage source={tetherIcon} style={[styles.miniCryptoIcon, styles.miniCryptoIconOverlap]} resizeMode="contain" />
                  </View>
                </TouchableOpacity>
                <AppText type={TWELVE} color={WHITE} style={styles.investedText}>
                  100,000+ users have already invested!
                </AppText>
              </LinearGradient>

              {/* Carousel - web style cards */}
              {packageList?.length > 0 && (
                <>
                  <Carousel
                    {...baseOptions}
                    data={packageList}
                    renderItem={renderItem}
                    onSnapToItem={(index) => setActiveIndex(index)}
                    autoPlay={true}
                    pagingEnabled={false}
                    autoPlayInterval={2500}
                    style={{ width: CAROUSEL_WIDTH, marginBottom: -20 }}
                  />
                  <View style={styles.dotContainer}>
                    {packageList.map((data, index) => (
                      <CustomDots
                        key={data?._id || index}
                        index={index}
                        activeIndex={activeIndex}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* All Plans - cards with collapse; card press = Subscribe (BuyPackage) */}
              <View style={styles.allPlansBlock}>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} color={themeColors.text} style={styles.allPlansHeading}>
                  All Plans
                </AppText>
                {list?.length > 0 ? (
                  list.map((item) => renderAllPlansCard(item))
                ) : (
                  <View style={styles.noData}>
                    <FastImage source={isDark ? NO_NOTIFICATION_ICON : NO_NOTIFICATION_ICON_LIGHT} style={{ width: 80, height: 80 }} />
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default Earning;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.newThemeColor,
    paddingBottom: 20,
  },
  keyboardAware: {
    paddingHorizontal: 20,
    flex: 1,
  },
  keyboardAwareContent: {
    flexGrow: 1,
  },
  earningContentWrap: {},
  topBar: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabRow: {
    marginTop: 16,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  tabRowContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.buttonBg,
  },
  recentPlansWrap: { flex: 1, },
  planTabsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerColor || "#3A3A3A",
  },
  planTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: -1,
  },
  planTabLabel: { fontSize: 15 },
  planTabActive: {
    borderBottomWidth: 1,
    borderBottomColor: colors.buttonBg,
  },
  planScroll: { flex: 1 },
  planScrollContent: { paddingBottom: 24 },
  planCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  planCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  planCardRowLast: { borderBottomWidth: 0 },
  planCardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  planCancelBtnWrap: {
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  planCancelBtnLabel: {
    color: "#E53935",
  },
  /** Distinct from primary blue + Cancel red — reads as a tappable “View” control */
  planViewLinkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  planViewLinkText: {
    color: colors.green,
    textDecorationLine: "underline",
    textDecorationColor: colors.green,
  },
  planEmptyState: {
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  dashboardBalanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dashboardBalanceCard: {
    width: "47%",
    minWidth: "47%",
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
  dashboardBalanceCardLeft: {
    flex: 1,
    minWidth: 0,
  },
  dashboardBalanceCardIconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardBalanceCardIcon: {
    width: 52,
    height: 52,
  },
  topBarTitle: {
    paddingLeft: 6,
  },
  topBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  headerIconSmall: {
    width: 20,
    height: 20,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 2,
  },
  earningHeaderBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    marginTop: 15,
    paddingHorizontal: 5
  },
  earningHeaderBannerLeft: {
    flex: 1,
    minWidth: 0,
  },
  earningHeaderBannerSubrow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  earningHeaderBannerImg: {
    width: 150,
    height: 120,
  },
  simpleEarnBanner: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    paddingTop: 24,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  lowRiskTag: {
    position: "absolute",
    top: 0,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  bannerMainTitle: {
    marginBottom: 20,
    marginTop: 4,
    lineHeight: 22,
    maxWidth: "80%",
  },
  featureIconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureIconImg: {
    width: 22,
    height: 22,
  },
  featureText: {
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  whatIsSimpleEarn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  whatIsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  playBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  whatIsRightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniCryptoIcon: {
    width: 24,
    height: 24,
  },
  miniCryptoIconOverlap: {
    marginLeft: -6,
  },
  investedText: {
    textAlign: "center",
    opacity: 0.95,
  },

  searchIcon: {
    width: 14,
    height: 14,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.white,
    fontSize: 13,
    paddingVertical: 0,
  },
  carouselCard: {
    width: "100%",
    marginTop: 6,
    marginBottom: 2,
    borderRadius: 12,
    padding: 10,
  },
  currencyBit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyBitInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
  },
  trendingBadge: {
    backgroundColor: YELLOW,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  usdDetailList: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingVertical: 2,
  },
  subscribeBtnCard: {
    marginTop: 12,
    marginHorizontal: 0,
  },
  dotContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -16,
    marginBottom: 6,
  },
  allPlansBlock: {
    marginTop: 8,
    marginBottom: 20,
  },
  allPlansHeading: {
    marginBottom: 12,
  },
  allPlansCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  allPlansCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allPlansCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  allPlansCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  allPlansCardCaretWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  allPlansCardCaretIcon: {
    width: 15,
    height: 15,
  },
  allPlansCardDetailsWrap: {},
  allPlansCardDetails: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.secondBorder || "rgba(255,255,255,0.08)",
  },
  allPlansCardDetailItem: {
    flex: 1,
  },
  allPlansCardDetailItemRight: {
    alignItems: "flex-end",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerColor,
  },
  thToken: { flex: 1.2, paddingRight: 4 },
  thApr: { flex: 1, marginLeft: 12 },
  thDuration: { flex: 0.9 },
  thAction: { flex: 1, minWidth: 90, textAlign: "center" },
  allPlansRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: themeColors.themeElevationColor,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 12,
  },
  allPlansToken: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  allPlansIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  allPlansApr: {
    flex: 1,
    marginLeft: 12,
  },
  allPlansDuration: {
    flex: 0.9,
  },
  subscribeBtnWrap: {
    flex: 1,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribePill: {
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  noData: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
