import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Linking,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FastImage from "react-native-fast-image";
import moment from "moment";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  AppSafeAreaView,
  AppText,
  BOLD,
  EIGHT,
  EIGHTEEN,
  ELEVEN,
  FIFTEEN,
  FOURTEEN,
  NORMAL,
  SECOND,
  SEMI_BOLD,
  TEN,
  THIRTEEN,
  TWELVE,
  TWENTY,
  WHITE,
  BLACK,
  YELLOW,
  Button,
  Input,
} from "../../shared";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { colors } from "../../theme/colors";
import { back_ic, linkIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { IMAGE_BASE_URL } from "../../helper/Constants";
import { showError } from "../../helper/logger";

const { width } = Dimensions.get("window");

const ProjectDetails = () => {
  const route = useRoute();
  const projectFromParams = route?.params?.project || {};
  const [project, setProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const buySheetRef = useRef(null);
  const subscriptionSheetRef = useRef(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  const fetchProjectDetails = useCallback(async (projectId) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://159.195.23.93:5001/v1/user/user-launchpad-details/${projectId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Unable to fetch project details.");
      }
      setProject(payload?.data || {});
    } catch (fetchError) {
      setError(fetchError?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const projectId = projectFromParams?._id || project?._id;
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [fetchProjectDetails, projectFromParams?._id]);

  // Format helpers
  const formatListing = (value) => {
    if (!value) return "--";
    const date = moment(value);
    if (!date.isValid()) return "--";
    return date.utc().format("DD/MM/YYYY HH:mm:ss");
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "--";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "--";
    return numericValue.toLocaleString("en-US");
  };

  const formatTokenPrice = (value, symbol) => {
    if (value === null || value === undefined) return "--";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "--";
    // Extract just the symbol part if it contains "Token" or spaces
    const cleanSymbol = (symbol || "ENL").split(" ")[0];
    return `1 ${cleanSymbol}=${numericValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} USDT`;
  };

  const formatUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const handleWebsitePress = () => {
    const url = formatUrl(project?.website);
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  const handleWhitepaperPress = () => {
    const url = formatUrl(project?.whitepaper);
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  const tokenLogoSource = project?.logoUrl
    ? {
        uri: `${IMAGE_BASE_URL}${project.logoUrl}`,
        priority: FastImage.priority.normal,
      }
    : null;

  // Determine status
  const status = project?.status?.toUpperCase() || "ENDED";
  const statusColor =
    status === "ENDED"
      ? colors.inactiveDot || "#666666"
      : status === "UPCOMING"
      ? colors.buttonBg
      : status === "LIVE" || status === "ONGOING"
      ? "#4CAF50"
      : colors.inactiveDot || "#666666";

  // Determine subscription currency (default to USDT)
  const subscriptionCurrency = "USDT";

  // Extract clean token symbol (remove "Token" suffix if present)
  const tokenSymbol = project?.tokenSymbol
    ? project.tokenSymbol.split(" ")[0]
    : project?.tokenName || "ENL";

  // Map API fields to component fields
  const minSubscription = project?.minPurchase || project?.minSubscription || 0;
  const maxSubscription = project?.maxPurchase || project?.maxSubscription || 0;

  // Calculate tokens to receive
  const tokensToReceive = purchaseAmount && project?.tokenPrice
    ? (parseFloat(purchaseAmount) / parseFloat(project.tokenPrice)).toFixed(2)
    : "0.00";

  const handleOpenBuySheet = () => {
    buySheetRef.current?.open();
  };

  const handleCloseBuySheet = () => {
    buySheetRef.current?.close();
    setPurchaseAmount("");
  };

  const fetchSubscriptionHistory = useCallback(async () => {
    setSubscriptionsLoading(true);
    try {
      const token = await AsyncStorage.getItem("USER_TOKEN_KEY");
      const response = await fetch(
        "http://159.195.23.93:5001/v1/user/user-token-subscription-history",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token || "",
          },
        }
      );
      const payload = await response.json();
      if (response.ok && payload?.success) {
        setSubscriptions(payload?.data || []);
      } else {
        showError(payload?.message || "Failed to fetch subscription history.");
        setSubscriptions([]);
      }
    } catch (fetchError) {
      showError(fetchError?.message || "Something went wrong.");
      setSubscriptions([]);
    } finally {
      setSubscriptionsLoading(false);
    }
  }, []);

  const handleOpenSubscriptionSheet = async () => {
    await fetchSubscriptionHistory();
    if(subscriptions.length > 0){
      subscriptionSheetRef.current?.open();
    } 
  };

  const handleCloseSubscriptionSheet = () => {
    subscriptionSheetRef.current?.close();
  };

  const handleConfirmPurchase = async () => {
    if (!project?._id) {
      showError("Launchpad information not available.");
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      showError("Please enter a valid amount.");
      return;
    }

    // Validate min/max limits
    const amount = parseFloat(purchaseAmount);
    const minAmount = parseFloat(minSubscription || 10);
    const maxAmount = parseFloat(maxSubscription || 15000);

    if (amount < minAmount) {
      showError(`Minimum purchase amount is ${minAmount} USDT.`);
      return;
    }

    if (amount > maxAmount) {
      showError(`Maximum purchase amount is ${maxAmount} USDT.`);
      return;
    }

    // Call API to purchase tokens
    setPurchasing(true);
    try {
      const token = await AsyncStorage.getItem("USER_TOKEN_KEY");
      const response = await fetch(
        "http://159.195.23.93:5001/v1/user/purchase-token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: JSON.stringify({
            amountInvested: amount,
            launchpadId: project._id,
          }),
        }
      );

      const payload = await response.json();
      
      if (response.ok && payload?.success) {
        showError(payload?.message || "Purchase successful!");
        handleCloseBuySheet();
        // Refresh project details to get updated data
        fetchProjectDetails(project._id);
      } else {
        showError(payload?.message || "Purchase failed. Please try again.");
      }
    } catch (purchaseError) {
      showError(purchaseError?.message || "Something went wrong. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <AppSafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.buttonBg} size="large" />
          <AppText type={FOURTEEN} color={SECOND} style={styles.loadingText}>
            Loading project details...
          </AppText>
        </View>
      </AppSafeAreaView>
    );
  }

  if (error) {
    return (
      <AppSafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AppText type={FOURTEEN} color={SECOND} style={styles.errorText}>
            {error}
          </AppText>
          <TouchableOpacityView
            style={styles.retryButton}
            onPress={() => {
              const projectId = project?._id;
              if (projectId) {
                fetchProjectDetails(projectId);
              }
            }}
          >
            <AppText type={TWELVE} weight={SEMI_BOLD} color={WHITE}>
              Retry
            </AppText>
          </TouchableOpacityView>
        </View>
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacityView
            onPress={() => NavigationService.goBack()}
            style={styles.backButton}
          >
            <FastImage
              source={back_ic}
              style={styles.backIcon}
              resizeMode="contain"
              tintColor={colors.white}
            />
          </TouchableOpacityView>
          <AppText
            type={EIGHTEEN}
            weight={SEMI_BOLD}
            style={styles.headerTitle}
          >
            {project?.tokenName || "EUL"}
          </AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} color={WHITE}>
              {status}
            </AppText>
          </View>
        </View>

        {/* Project Overview */}
        <View style={styles.projectOverview}>
          <View style={styles.projectIdentity}>
            {tokenLogoSource ? (
              <FastImage
                source={tokenLogoSource}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.projectLogo}
              />
            ) : (
              <View style={styles.projectLogoPlaceholder}>
                <AppText type={TWENTY} weight={BOLD} color={WHITE}>
                  {(project?.tokenSymbol || project?.tokenName || "?")
                    ?.toString()
                    .charAt(0)}
                </AppText>
              </View>
            )}
            <AppText
              type={EIGHTEEN}
              weight={SEMI_BOLD}
              style={styles.projectName}
            >
              {project?.tokenName || "EUL"}
            </AppText>
          </View>
          <View style={styles.externalLinks}>
            {project?.website && (
            <TouchableOpacityView
              style={styles.linkButton}
              onPress={handleWebsitePress}
            >
              <FastImage
                source={linkIcon}
                style={styles.linkIcon}
                resizeMode="contain"
                tintColor={colors.whiteShadow || "#999"}
              />
              <AppText type={TWELVE} style={styles.linkText}>
                Website
              </AppText>
            </TouchableOpacityView>
            )}
            {project?.whitepaper && (
            <TouchableOpacityView
              style={styles.linkButton}
              onPress={handleWhitepaperPress}
            >
              <FastImage
                source={linkIcon}
                style={styles.linkIcon}
                resizeMode="contain"
                tintColor={colors.whiteShadow || "#999"}
              />
              <AppText type={TWELVE} style={styles.linkText}>
                Whitepaper
                </AppText>
              </TouchableOpacityView>
            )}
          </View>
        </View>

        {/* Subscription Details */}
        <View style={styles.section}>
          <AppText
            type={FIFTEEN}
            weight={SEMI_BOLD}
            style={styles.sectionTitle}
          >
            Subscription Details
          </AppText>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <AppText type={THIRTEEN} style={styles.detailLabel}>
              Participants
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.detailValue}
              >
                {/* {formatTokenPrice(project?.participantsCount, tokenSymbol)} */} 
                {project?.participantsCount || "0.00"}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText type={THIRTEEN} style={styles.detailLabel}>
              Current Percent
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.detailValue}
              >
                {/* {project?.tokensForSale
                  ? `${formatNumber(project.tokensForSale)} ${tokenSymbol}`
                  : "--"} */}
                {project?.progressPercent || "0.00"}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText type={THIRTEEN} style={styles.detailLabel}>
              Raised
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.detailValue}
              >
                {/* {minSubscription
                  ? `${formatNumber(minSubscription)} ${subscriptionCurrency}`
                  : "--"} */}
                  {project?.totalInvested || "0.00"}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText type={THIRTEEN} style={styles.detailLabel}>
              Total Supply
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.detailValue}
              >
                {/* {maxSubscription
                  ? `${formatNumber(maxSubscription)} ${subscriptionCurrency}`
                  : "--"} */}
                  {project?.totalSupply || "0.00"}
              </AppText>
            </View>
          </View>
        </View>

        {(status === "LIVE" || status === "ONGOING") && (
          <Button
            onPress={handleOpenBuySheet}
            children="Buy now"
            containerStyle={styles.buyNowButton}
          />
        )}

        {/* Project Cycle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText
              type={FIFTEEN}
              weight={SEMI_BOLD}
              style={styles.sectionTitle}
            >
              Project Cycle
            </AppText>
            {status !== "UPCOMING" && (
              <TouchableOpacityView onPress={handleOpenSubscriptionSheet}>
                <AppText
                  type={THIRTEEN}
                  color={YELLOW}
                  style={styles.subscriptionLink}
                >
                  My Subscription &gt;
                </AppText>
              </TouchableOpacityView>
            )}
          </View>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineCircle}>
                <AppText type={TWELVE} weight={BOLD} color={BLACK}>
                  1.
                </AppText>
              </View>
              <View style={styles.timelineContent}>
                <AppText
                  type={THIRTEEN}
                  weight={SEMI_BOLD}
                  style={styles.timelineTitle}
                >
                  Start Subscription
                </AppText>
                <AppText type={TWELVE} style={styles.timelineDate}>
                  {formatListing(project?.startTime) || "26/05/2025 05:30:00"}
                </AppText>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineItem}>
              <View style={styles.timelineCircle}>
                <AppText type={TWELVE} weight={BOLD} color={BLACK}>
                  2.
                </AppText>
              </View>
              <View style={styles.timelineContent}>
                <AppText
                  type={THIRTEEN}
                  weight={SEMI_BOLD}
                  style={styles.timelineTitle}
                >
                  End Subscription
                </AppText>
                <AppText type={TWELVE} style={styles.timelineDate}>
                  {formatListing(project?.endTime) || "26/05/2025 05:30:00"}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Key Highlight */}
        <View style={styles.section}>
          <AppText
            type={FIFTEEN}
            weight={SEMI_BOLD}
            style={styles.sectionTitle}
          >
            Key Highlight
          </AppText>
          <View style={styles.highlightTable}>
            <View style={[styles.tableRow, { backgroundColor: "#1F1F1F",}]}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Token Symbol
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {tokenSymbol}
              </AppText>
            </View>
            <View style={styles.tableRow}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Total Platform Issuance
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {project?.totalSupply
                  ? `${formatNumber(project.totalSupply)} ${tokenSymbol}`
                  : "--"}
              </AppText>
            </View>
            <View style={[styles.tableRow, { backgroundColor: "#1F1F1F",}]}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Subscription Price
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {formatTokenPrice(project?.tokenPrice, tokenSymbol)}
              </AppText>
            </View>
            <View style={styles.tableRow}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Min Subscription Amount
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {minSubscription
                  ? `${formatNumber(minSubscription)} ${subscriptionCurrency}`
                  : "--"}
              </AppText>
            </View>
            <View style={[styles.tableRow, { backgroundColor: "#1F1F1F",}]}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Max Subscription Amount
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {maxSubscription
                  ? `${formatNumber(maxSubscription)} ${subscriptionCurrency}`
                  : "--"}
              </AppText>
            </View>
            <View style={styles.tableRow}>
              <AppText type={THIRTEEN} style={styles.tableLabel}>
                Tokens For Sale
              </AppText>
              <AppText
                type={THIRTEEN}
                weight={SEMI_BOLD}
                style={styles.tableValue}
              >
                {project?.tokensForSale}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buy Token Bottom Sheet */}
      <RBSheet
        ref={buySheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={340}
        animationType="slide"
        customStyles={{
          container: {
            backgroundColor: "#191919",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          },
          wrapper: {
            backgroundColor: "#0006",
          },
          draggableIcon: {
            backgroundColor: colors.whiteShadow || "#666",
            width: 40,
          },
        }}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <AppText type={EIGHTEEN} weight={SEMI_BOLD} style={styles.bottomSheetTitle}>
              Enter Purchase Amount
            </AppText>
            <TouchableOpacityView onPress={handleCloseBuySheet}>
              <AppText type={TWENTY} weight={BOLD} style={styles.closeButton}>
                ✖
              </AppText>
            </TouchableOpacityView>
          </View>

          <Input
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={purchaseAmount}
            onChangeText={setPurchaseAmount}
            mainContainer={styles.buyInputMainContainer}
            containerStyle={styles.buyInputContainer}
            inputStyle={styles.buyInput}
          />

          {purchaseAmount && project?.tokenPrice && (
            <View style={styles.tokensInfo}>
              <AppText type={FOURTEEN} weight={SEMI_BOLD} style={styles.tokensInfoText}>
                You will receive: {tokensToReceive} {tokenSymbol}
              </AppText>
            </View>
          )}

          <AppText type={TWELVE} style={styles.limitText}>
            Min: {formatNumber(minSubscription || 10)} USDT | Max: {formatNumber(maxSubscription || 15000)} USDT
          </AppText>

          <View style={styles.bottomSheetButtons}>
            <Button
              children="Confirm"
              onPress={handleConfirmPurchase}
              loading={purchasing}
              containerStyle={[
                styles.confirmButton,
                ((!purchaseAmount || parseFloat(purchaseAmount) <= 0) || purchasing) && styles.disabledButton,
              ]}
              disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || purchasing}
            />
            {/* <Button
              children="Cancel"
              onPress={handleCloseBuySheet}
              containerStyle={styles.cancelButton}
            /> */}
          </View>
        </View>
      </RBSheet>

      {/* Subscription History Bottom Sheet */}
      <RBSheet
        ref={subscriptionSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={Dimensions.get("window").height * 0.85}
        animationType="slide"
        customStyles={{
          container: {
            backgroundColor: "#191919",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          },
          wrapper: {
            backgroundColor: "#0006",
          },
          draggableIcon: {
            backgroundColor: colors.whiteShadow || "#666",
            width: 40,
          },
        }}
      >
        <View style={styles.subscriptionSheetContent}>
          <View style={styles.subscriptionSheetHeader}>
            <AppText type={EIGHTEEN} weight={SEMI_BOLD} style={styles.subscriptionSheetTitle}>
              My Subscription
            </AppText>
            <TouchableOpacityView onPress={handleCloseSubscriptionSheet}>
              <AppText type={TWENTY} weight={BOLD} style={styles.closeButton}>
                ✖
              </AppText>
            </TouchableOpacityView>
          </View>

          {subscriptionsLoading ? (
            <View style={styles.subscriptionLoadingContainer}>
              <ActivityIndicator color={colors.buttonBg} size="large" />
              <AppText type={FOURTEEN} color={SECOND} style={styles.subscriptionLoadingText}>
                Loading subscription history...
              </AppText>
            </View>
          ) : subscriptions && subscriptions.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.subscriptionTableScroll}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              decelerationRate="fast"
            >
              <View style={styles.subscriptionTableWrapper}>
                <ScrollView 
                  stickyHeaderIndices={[0]}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Table Header */}
                  {subscriptions.length > 0 && (
                    <ScrollView 
                      style={[styles.subscriptionTableRow, styles.subscriptionTableHeaderRow]} 
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={false}
                    >
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        #
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Token Name
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Token Symbol
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Invested ($)
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Total Tokens
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Last Purchase
                      </AppText>
                      <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.subscriptionTableCell, styles.subscriptionTableHeaderCell]}>
                        Status
                      </AppText>
                    </ScrollView>
                  )}

                  {/* Table Body */}
                  {subscriptions.length > 0 ? (
                    subscriptions.map((sub, index) => {
                      const totalInvested = sub.totalInvested?.$numberDecimal 
                        ? parseFloat(sub.totalInvested.$numberDecimal).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00";
                      
                      const statusColor = 
                        sub.status === "LIVE" || sub.status === "ONGOING"
                          ? "#4CAF50"
                          : sub.status === "ENDED"
                          ? "#F44336"
                          : "#555";

                      return (
                        <View
                          key={index}
                          style={[
                            styles.subscriptionTableRow,
                            index % 2 === 0 ? styles.subscriptionTableEvenRow : styles.subscriptionTableOddRow,
                          ]}
                        >
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {index + 1}
                          </AppText>
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {sub.tokenName || "--"}
                          </AppText>
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {sub.tokenSymbol || "--"}
                          </AppText>
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {totalInvested}
                          </AppText>
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {sub.totalTokensReceived || "0"}
                          </AppText>
                          <AppText type={TWELVE} style={styles.subscriptionTableCell}>
                            {sub.lastPurchase 
                              ? moment(sub.lastPurchase).format("DD/MM/YYYY LT")
                              : "--"}
                          </AppText>
                          <AppText 
                            type={TWELVE} 
                            weight={SEMI_BOLD}
                            style={[styles.subscriptionTableCell, { color: statusColor }]}
                          >
                            {sub.status ? sub.status.charAt(0) + sub.status.slice(1).toLowerCase() : "--"}
                          </AppText>
                        </View>
                      );
                    })
                  ) : null}
                </ScrollView>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.subscriptionEmptyContainer}>
              <AppText type={FOURTEEN} color={SECOND} style={styles.subscriptionEmptyText}>
                No subscription data found.
              </AppText>
            </View>
          )}

          <View style={styles.subscriptionSheetFooter}>
            <Button
              children="Close"
              onPress={handleCloseSubscriptionSheet}
              containerStyle={styles.subscriptionCloseButton}
            />
          </View>
        </View>
      </RBSheet>
    </AppSafeAreaView>
  );
};

export default ProjectDetails;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0A0A0A",
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 18,
    height: 18,
  },
  headerTitle: {
    color: colors.white,
    flex: 1,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#666666",
  },
  projectOverview: {
    marginTop: 8,
    marginBottom: 24,
  },
  projectIdentity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  projectLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  projectLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  projectName: {
    color: colors.white,
  },
  externalLinks: {
    flexDirection: "row",
    gap: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    gap: 8,
  },
  linkIcon: {
    width: 14,
    height: 14,
  },
  linkText: {
    color: colors.whiteShadow || "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    marginBottom: 12,
  },
  subscriptionLink: {
    marginBottom: 12,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    color: colors.whiteShadow || "#999",
    flex: 1,
  },
  detailValue: {
    color: colors.white,
    flex: 1,
    textAlign: "right",
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.buttonBg || "#FEBA00",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    color: colors.white,
    marginBottom: 0,
  },
  timelineDate: {
    color: colors.whiteShadow || "#999",
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.buttonBg || "#FEBA00",
    marginLeft: 13,
    marginVertical: 6,
  },
  highlightTable: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
   
    borderBottomWidth: 1,
    borderBottomColor: "#0A0A0A",
  },
  tableLabel: {
    color: colors.whiteShadow || "#999",
    flex: 1,
  },
  tableValue: {
    color: colors.white,
    flex: 1,
    textAlign: "right",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyNowButton: {
    marginBottom: 24,
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    color: colors.white,
  },
  closeButton: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 24,
  },
  buyInputMainContainer: {
    marginBottom: 20,
  },
  buyInputContainer: {
    backgroundColor: "#1F1F1F",
    borderColor: "#29313D",
    borderWidth: 1,
    borderRadius: 8,
  },
  buyInput: {
    fontSize: 16,
  },
  tokensInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "rgba(243, 187, 43, 0.1)",
    borderRadius: 8,
  },
  tokensInfoText: {
    color: colors.buttonBg || "#F3BB2B",
  },
  limitText: {
    color: colors.whiteShadow || "#4D5B6F",
    marginBottom: 20,
  },
  bottomSheetButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.buttonBg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.red_fifty,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  subscriptionSheetContent: {
    flex: 1,
  },
  subscriptionSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  subscriptionSheetTitle: {
    color: colors.white,
  },
  subscriptionLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 40,
  },
  subscriptionLoadingText: {
    marginTop: 12,
  },
  subscriptionTableScroll: {
    flex: 1,
    marginBottom: 20,
  },
  subscriptionTableWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    width: 700,
  },
  subscriptionTableRow: {
    flexDirection: "row",
    flexShrink: 0,
  },
  subscriptionTableHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: colors.buttonBg || "#FEBA00",
  },
  subscriptionTableEvenRow: {
    backgroundColor: "#191919",
  },
  subscriptionTableOddRow: {
    backgroundColor: "#1F1F1F",
  },
  subscriptionTableCell: {
    width: 100,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    textAlign: "center",
    color: colors.white,
    flexShrink: 0,
  },
  subscriptionTableHeaderCell: {
    fontWeight: "bold",
    fontSize: 13,
    color: colors.white,
  },
  subscriptionEmptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  subscriptionEmptyText: {
    textAlign: "center",
  },
  subscriptionSheetFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
  },
  subscriptionCloseButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
