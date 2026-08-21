import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
} from "react-native";
import { useDispatch } from "react-redux";
import { useRoute } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import moment from "moment";

import {
  getWalletBalance,
  subscribeEarningPackage,
} from "../../actions/walletActions";
import { useAppSelector } from "../../store/hooks";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../../shared/components/Button";
import {
  AppText,
  BLACK,
  DISCLAIMTEXT,
  FOURTEEN,
  GREEN,
  SEMI_BOLD,
  TWELVE,
  SIXTEEN,
  EIGHTEEN,
  TEN,
} from "../../shared/components/AppText";
import { AppSafeAreaView } from "../../shared";
import BuyPackageSkeleton from "./BuyPackageSkeleton";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import EarningDropdown from "../../shared/components/EarningDropdown";
import Checkbox from "../../common/Checkbox";
import { BACK_ICON } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { BASE_URL } from "../../helper/Constants";
import NavigationService from "../../navigation/NavigationService";
import TransferModal from "../../shared/components/TransferModal";

const formatToNineDecimals = (data) => {
  if (typeof data === "number" && !isNaN(data)) {
    return parseFloat(data.toFixed(9));
  }
  const parsed = parseFloat(data);
  if (!isNaN(parsed)) {
    return parseFloat(parsed.toFixed(9));
  }
  return 0;
};

const BuyPackage = () => {
  const route = useRoute();
  const rawData = route?.params?.data;

  const dispatch = useDispatch();
  const { colors: themeColors, theme, isDark } = useTheme();

  const WalletTypes = useAppSelector((state) => state.wallet.walletTypes);
  const earnWalletBal = useAppSelector((state) => state.wallet.earnWalletBal);
  const packageList = useAppSelector((state) => state.wallet.packageList);

  const [selectedWallet, setSelectedWallet] = useState(WalletTypes?.[0] || "");
  const [amount, setAmount] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [visible, setVisible] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);

  // Find all packages for the selected currency (duration options)
  const allPackages = useMemo(() => {
    if (rawData?.distribution && Array.isArray(rawData.distribution) && rawData.distribution.length > 0) {
      return [...rawData.distribution].sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));
    }
    const currency = rawData?.currency;
    if (currency && Array.isArray(packageList)) {
      const match = packageList.find(
        (p) => p?.currency === currency || (Array.isArray(p) && p.some((item) => item?.currency === currency))
      );
      if (match) {
        if (Array.isArray(match)) {
          return [...match].sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));
        }
        if (match?.distribution && Array.isArray(match.distribution)) {
          return [...match.distribution].sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));
        }
      }
    }
    return rawData ? [rawData] : [];
  }, [rawData, packageList]);

  // Selected package duration item
  const [selectedPackage, setSelectedPackage] = useState(() => {
    if (rawData?.distribution && Array.isArray(rawData.distribution) && rawData.distribution.length > 0) {
      return rawData.distribution[0];
    }
    return rawData || {};
  });

  useEffect(() => {
    if (allPackages.length > 0) {
      // If current selectedPackage is not in allPackages, default to first
      const exists = allPackages.find((p) => (p._id && p._id === selectedPackage?._id) || p.duration_days === selectedPackage?.duration_days);
      if (!exists) {
        setSelectedPackage(allPackages[0]);
      }
    }
  }, [allPackages]);

  useEffect(() => {
    if (WalletTypes?.length > 0 && (!selectedWallet || selectedWallet === "")) {
      setSelectedWallet(WalletTypes[0]);
    }
  }, [WalletTypes]);

  useEffect(() => {
    const currencyId = selectedPackage?.currency_id || rawData?.currency_id;
    if (selectedWallet && selectedWallet !== "" && currencyId) {
      const walletParam = typeof selectedWallet === "object" ? selectedWallet?.value ?? selectedWallet?.id ?? selectedWallet : selectedWallet;
      dispatch(getWalletBalance(walletParam, currencyId));
    }
  }, [selectedWallet, selectedPackage?.currency_id, rawData?.currency_id, dispatch]);

  useEffect(() => {
    if (rawData && Array.isArray(WalletTypes)) {
      setContentLoading(false);
    }
  }, [rawData, WalletTypes]);

  const currencySymbol = selectedPackage?.currency || rawData?.currency || "";
  const iconPath = selectedPackage?.icon_path || rawData?.icon_path || "";
  const minAmount = selectedPackage?.min_amount ?? rawData?.min_amount ?? 0;
  const maxAmount = selectedPackage?.max_amount ?? rawData?.max_amount ?? null;
  const durationDays = selectedPackage?.duration_days ?? 0;
  const returnPercentage = selectedPackage?.return_percentage ?? 0;
  const returnPercentageShow = selectedPackage?.returnPercenatgeShowtoUser ?? returnPercentage;
  const returnType = selectedPackage?.return_type || "daily";

  const walletBalance = parseFloat(earnWalletBal || 0);

  // Return calculations
  const totalReturns = useMemo(() => {
    if (!amount || !returnPercentage) return "0.00";
    const amt = parseFloat(amount) || 0;
    const total = (amt * returnPercentage) / 100;
    return formatToNineDecimals(total);
  }, [amount, returnPercentage]);

  const dailyReturns = useMemo(() => {
    if (!amount || !returnPercentage || !durationDays) return "0.00";
    const amt = parseFloat(amount) || 0;
    const days = durationDays || 1;
    const daily = (amt * returnPercentage) / 100 / days;
    return formatToNineDecimals(daily);
  }, [amount, returnPercentage, durationDays]);

  const totalReceivable = useMemo(() => {
    if (!amount) return "0.00";
    const amt = parseFloat(amount) || 0;
    const returns = parseFloat(totalReturns) || 0;
    return formatToNineDecimals(amt + returns);
  }, [amount, totalReturns]);

  const handleDurationSelect = (pkg) => {
    setSelectedPackage(pkg);
    setAmount("");
  };

  const handleMaxAmount = () => {
    if (walletBalance > 0) {
      const maxVal = maxAmount && maxAmount > 0 ? Math.min(walletBalance, maxAmount) : walletBalance;
      setAmount(String(maxVal));
    }
  };

  const handleAmountChange = (text) => {
    if (text === "" || /^\d*\.?\d*$/.test(text)) {
      setAmount(text);
    }
  };

  const isAmountBelowMin = amount && minAmount > 0 && parseFloat(amount) < minAmount;
  const isAmountAboveMax = amount && maxAmount && maxAmount > 0 && parseFloat(amount) > maxAmount;
  const isInsufficientBal = amount && parseFloat(amount) > walletBalance;

  const isSubmitDisabled =
    !agreeTerms ||
    !amount ||
    parseFloat(amount) <= 0 ||
    isInsufficientBal ||
    isAmountBelowMin ||
    isAmountAboveMax;

  const buyEarningPackage = () => {
    const planId = selectedPackage?._id || rawData?._id;
    const walletTypeVal = typeof selectedWallet === "object" ? selectedWallet?.value ?? selectedWallet?.id ?? selectedWallet : selectedWallet;
    const data = {
      planId: planId,
      investAmount: parseFloat(amount),
      walletType: walletTypeVal,
    };
    dispatch(subscribeEarningPackage(data, setVisible));
  };

  const handlePopup = () => {
    setVisible(false);
    NavigationService.navigate("EarningPortfolio");
  };

  // Timeline dates
  const subscriptionDateStr = moment().format("D/M/YYYY, HH:mm");
  const accrualDateStr = moment().add(1, "days").format("D/M/YYYY, HH:mm");
  const profitDistributionDateStr = moment().add(durationDays || 0, "days").format("D/M/YYYY, 17:30");
  const maturityDateStr = moment().add(durationDays || 0, "days").format("D/M/YYYY");

  const dynamicCardBg = isDark ? colors.themeElevationColor : "#F8F9FA";
  const dynamicBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dynamicDivider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <AppSafeAreaView style={{ backgroundColor: isDark ? colors.newThemeColor : "#FFFFFF" }}>
      <KeyBoardAware style={{ paddingHorizontal: 16 }}>
        {contentLoading ? (
          <BuyPackageSkeleton />
        ) : (
          <View style={{ paddingBottom: 30 }}>
            {/* Top Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => NavigationService.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FastImage
                  source={BACK_ICON}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                  tintColor={isDark ? colors.white : colors.black}
                />
              </TouchableOpacity>
              <AppText
                style={[styles.headerTitle, { color: isDark ? colors.white : colors.black }]}
                weight={SEMI_BOLD}
                type={SIXTEEN}
              >
                {currencySymbol} Subscribe
              </AppText>
              <View style={{ width: 20 }} />
            </View>

            {/* Currency Header with Icon */}
            <View style={styles.coinHeaderRow}>
              <View
                style={[
                  styles.coinIconWrap,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    borderColor: dynamicBorder,
                  },
                ]}
              >
                <FastImage
                  source={{ uri: BASE_URL + iconPath }}
                  resizeMode="contain"
                  style={{ width: 32, height: 32 }}
                />
              </View>
              <AppText weight={SEMI_BOLD} type={EIGHTEEN} style={{ color: isDark ? colors.white : colors.black }}>
                {currencySymbol}
              </AppText>
            </View>

            {/* Duration Day Selector Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.durationScrollContent}
            >
              {allPackages.map((pkg, idx) => {
                const isSelected =
                  (pkg._id && pkg._id === selectedPackage?._id) ||
                  pkg.duration_days === selectedPackage?.duration_days;
                return (
                  <TouchableOpacity
                    key={pkg._id || `dur-${pkg.duration_days}-${idx}`}
                    onPress={() => handleDurationSelect(pkg)}
                    activeOpacity={0.7}
                    style={[
                      styles.durationCard,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "rgba(74, 114, 255, 0.15)"
                            : "rgba(30, 86, 245, 0.08)"
                          : dynamicCardBg,
                        borderColor: isSelected ? colors.buttonBg : dynamicBorder,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <AppText
                      type={TWELVE}
                      weight={SEMI_BOLD}
                      style={{
                        color: isSelected ? (isDark ? colors.white : colors.buttonBg) : (isDark ? "#BBB" : "#444"),
                        marginBottom: 4,
                      }}
                    >
                      {pkg?.duration_days} Day
                    </AppText>
                    <AppText
                      type={TWELVE}
                      weight={SEMI_BOLD}
                      style={{
                        color: isSelected ? (isDark ? colors.white : colors.buttonBg) : (isDark ? "#888" : "#666"),
                      }}
                    >
                      {Number(pkg?.return_percentage || 0).toFixed(2)}%
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Terms Details (Reference, Term, Return) */}
            <View style={styles.termsList}>
              <View style={styles.keyValueRow}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Reference
                </AppText>
                <AppText color={GREEN} weight={SEMI_BOLD} type={FOURTEEN}>
                  {Number(returnPercentage || 0).toFixed(2)}%
                </AppText>
              </View>

              <View style={styles.keyValueRow}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Term
                </AppText>
                <AppText weight={SEMI_BOLD} type={FOURTEEN} style={{ color: isDark ? colors.white : colors.black }}>
                  {durationDays} days
                </AppText>
              </View>

              <View style={styles.keyValueRow}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Return ({returnType})
                </AppText>
                <AppText weight={SEMI_BOLD} type={FOURTEEN} style={{ color: isDark ? colors.white : colors.black }}>
                  {returnPercentageShow}% {returnType}
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dynamicDivider }]} />

            {/* Payment Method */}
            <View style={{ marginVertical: 12 }}>
              <AppText
                weight={SEMI_BOLD}
                type={FOURTEEN}
                style={[styles.sectionTitle, { color: isDark ? colors.white : colors.black }]}
              >
                Payment Method
              </AppText>
              <EarningDropdown
                theme={theme}
                data={WalletTypes}
                selected={selectedWallet}
                onSelect={setSelectedWallet}
              />
            </View>

            {/* Subscription Amount */}
            <View style={{ marginVertical: 12 }}>
              <AppText
                weight={SEMI_BOLD}
                type={FOURTEEN}
                style={[styles.sectionTitle, { color: isDark ? colors.white : colors.black }]}
              >
                Subscription Amount
              </AppText>

              <View
                style={[
                  styles.inputRow,
                  {
                    borderColor: isInsufficientBal || isAmountBelowMin || isAmountAboveMax
                      ? colors.red
                      : dynamicBorder,
                    backgroundColor: dynamicCardBg,
                  },
                ]}
              >
                <TextInput
                  placeholder={`Enter Subscription Amount (Min ${minAmount} ${currencySymbol})`}
                  style={[
                    styles.input,
                    { color: isDark ? colors.white : colors.black },
                  ]}
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#777" : "#999"}
                  value={amount}
                  onChangeText={handleAmountChange}
                />
                <TouchableOpacity
                  onPress={handleMaxAmount}
                  style={styles.maxBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.maxText}>Max</Text>
                </TouchableOpacity>
              </View>

              {/* Validation errors */}
              {isInsufficientBal && (
                <Text style={styles.errorText}>Insufficient Balance in selected wallet</Text>
              )}
              {isAmountBelowMin && (
                <Text style={styles.errorText}>
                  Minimum subscription amount is {minAmount} {currencySymbol}
                </Text>
              )}
              {isAmountAboveMax && (
                <Text style={styles.errorText}>
                  Maximum subscription amount is {maxAmount} {currencySymbol}
                </Text>
              )}

              {/* Account balances info */}
              <View style={[styles.keyValueRow, { marginTop: 10 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Funding Account
                </AppText>
                <AppText weight={SEMI_BOLD} type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                  {walletBalance} {currencySymbol}
                </AppText>
              </View>

              <View style={[styles.keyValueRow, { marginTop: 8 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Max Account
                </AppText>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  {maxAmount && maxAmount > 0 ? `${maxAmount} ${currencySymbol}` : "Unlimited"}
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dynamicDivider }]} />

            {/* Preview Section */}
            <View style={{ marginVertical: 12 }}>
              <AppText
                weight={SEMI_BOLD}
                type={SIXTEEN}
                style={[styles.sectionTitle, { color: isDark ? colors.white : colors.black, marginBottom: 14 }]}
              >
                Preview
              </AppText>

              {/* Timeline Stepper */}
              <View style={styles.timelineContainer}>
                {/* Step 1 */}
                <View style={styles.timelineStep}>
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, { borderColor: isDark ? "#888" : "#666" }]} />
                    <View style={[styles.timelineLine, { backgroundColor: dynamicBorder }]} />
                  </View>
                  <View style={styles.timelineContentRow}>
                    <AppText color={DISCLAIMTEXT} type={TWELVE}>
                      Subscription Date
                    </AppText>
                    <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                      {subscriptionDateStr}
                    </AppText>
                  </View>
                </View>

                {/* Step 2 */}
                <View style={styles.timelineStep}>
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, { borderColor: isDark ? "#888" : "#666" }]} />
                    <View style={[styles.timelineLine, { backgroundColor: dynamicBorder }]} />
                  </View>
                  <View style={styles.timelineContentRow}>
                    <AppText color={DISCLAIMTEXT} type={TWELVE}>
                      Accrual Date
                    </AppText>
                    <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                      {accrualDateStr}
                    </AppText>
                  </View>
                </View>

                {/* Step 3 */}
                <View style={styles.timelineStep}>
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, { borderColor: isDark ? "#888" : "#666" }]} />
                    <View style={[styles.timelineLine, { backgroundColor: dynamicBorder }]} />
                  </View>
                  <View style={styles.timelineContentRow}>
                    <AppText color={DISCLAIMTEXT} type={TWELVE}>
                      Profit Distribution Date
                    </AppText>
                    <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                      {profitDistributionDateStr}
                    </AppText>
                  </View>
                </View>

                {/* Step 4 */}
                <View style={styles.timelineStep}>
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, { borderColor: isDark ? "#888" : "#666" }]} />
                  </View>
                  <View style={styles.timelineContentRow}>
                    <AppText color={DISCLAIMTEXT} type={TWELVE}>
                      Date of Maturity
                    </AppText>
                    <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                      {maturityDateStr}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Redemption & Profit Received */}
              <View style={[styles.keyValueRow, { marginTop: 14 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Redemption Period
                </AppText>
                <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                  {durationDays} days
                </AppText>
              </View>
              <View style={[styles.keyValueRow, { marginTop: 8 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Profit Received
                </AppText>
                <AppText type={TWELVE} style={{ color: isDark ? colors.white : colors.black }}>
                  At Maturity
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dynamicDivider }]} />

            {/* Estimated Returns Section */}
            <View style={{ marginVertical: 12 }}>
              <AppText
                weight={SEMI_BOLD}
                type={SIXTEEN}
                style={[styles.sectionTitle, { color: isDark ? colors.white : colors.black, marginBottom: 12 }]}
              >
                Estimated Returns
              </AppText>

              <View style={styles.keyValueRow}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Daily Earnings
                </AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: isDark ? colors.white : colors.black }}>
                  {dailyReturns} {currencySymbol} / D
                </AppText>
              </View>

              <View style={[styles.keyValueRow, { marginTop: 8 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Total Earnings ({durationDays}D)
                </AppText>
                <AppText color={GREEN} weight={SEMI_BOLD} type={TWELVE}>
                  +{totalReturns} {currencySymbol}
                </AppText>
              </View>

              <View style={[styles.keyValueRow, { marginTop: 8 }]}>
                <AppText color={DISCLAIMTEXT} type={TWELVE}>
                  Total Receivable
                </AppText>
                <AppText color={GREEN} weight={SEMI_BOLD} type={FOURTEEN}>
                  {totalReceivable} {currencySymbol}
                </AppText>
              </View>

              {/* Bullet points & disclaimers */}
              <View style={styles.disclaimerBox}>
                <AppText color={DISCLAIMTEXT} type={TEN} style={styles.disclaimerText}>
                  * At maturity, your funds are seamlessly transferred to you earning balance.
                </AppText>
                <AppText color={DISCLAIMTEXT} type={TEN} style={styles.disclaimerText}>
                  * Early withdrawals are not permitted. In case of cancellation before maturity, profits will not be applicable.
                </AppText>
              </View>
            </View>

            {/* Terms agreement checkbox */}
            <View style={styles.termsAgreementRow}>
              <Checkbox
                value={agreeTerms}
                onPress={() => setAgreeTerms(!agreeTerms)}
                containerStyle={{ marginRight: 8 }}
              />
              <TouchableOpacity
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
                style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}
              >
                <AppText type={TWELVE} style={{ color: isDark ? "#CCC" : "#555" }}>
                  I have read and agree to the{" "}
                </AppText>
                <Text
                  style={{ color: colors.buttonBg, fontSize: 12, fontWeight: "600" }}
                  onPress={() => {
                    // Optional open terms url
                  }}
                >
                  Earn Service Agreement.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Subscription Button */}
            <Button
              children="Subscription"
              containerStyle={{ marginTop: 24 }}
              disabled={isSubmitDisabled}
              onPress={buyEarningPackage}
            />
          </View>
        )}
      </KeyBoardAware>

      <TransferModal
        visible={visible}
        handleVisiblity={handlePopup}
        type={"earning"}
      />
    </AppSafeAreaView>
  );
};

export default BuyPackage;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
  },
  coinHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
  },
  coinIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  durationScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  durationCard: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 84,
  },
  termsList: {
    marginVertical: 10,
    gap: 10,
  },
  keyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    fontSize: 14,
  },
  maxBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  maxText: {
    fontWeight: "bold",
    color: "#2BB53C",
    fontSize: 14,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginTop: 6,
  },
  timelineContainer: {
    marginVertical: 6,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDotColumn: {
    alignItems: "center",
    width: 20,
    marginRight: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: "transparent",
    marginTop: 4,
  },
  timelineLine: {
    width: 1.5,
    height: 24,
    marginVertical: 2,
  },
  timelineContentRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 1,
    paddingBottom: 10,
  },
  disclaimerBox: {
    marginTop: 14,
    gap: 6,
  },
  disclaimerText: {
    lineHeight: 16,
  },
  termsAgreementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
});
