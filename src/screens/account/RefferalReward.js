import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import {
  AppSafeAreaView,
  AppText,
  DISCLAIMTEXT,
  SEMI_BOLD,
  SIXTEEN,
  TWELVE,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { useAppSelector } from "../../store/hooks";
import FastImage from "react-native-fast-image";
import {
  back_ic,
  copyIcon,
  earngift_vector,
  giftIc,
  invite_ic,
  linkIcon,
  NO_NOTIFICATION_ICON,
  peopleIcon,
  searchIcon,
  usdtearn_vector,
} from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { getUserReferCode } from "../../actions/accountActions";
import { getReferralList } from "../../actions/homeActions";
import { copyText } from "../../helper/utility";
import moment from "moment";
import RefferalRewardSkeleton from "./RefferalRewardSkeleton";

const SIGNUP_BASE_URL = "https://zillion.wrathcode.com";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTENT_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - CONTENT_PADDING * 2;

const referralEvents = [
  {
    title: "Earn Exciting Rewards!",
    description: "Invite friends to join and start earning benefits",
    image: earngift_vector,
  },
  {
    title: "Invite & Get Rewarded",
    description: "Unlock special bonuses with every successful referral",
    image: usdtearn_vector,
  },
  {
    title: "More Referrals, More Rewards",
    description: "Grow your network and enjoy bigger reward opportunities",
    image: earngift_vector,
  },
];

const howToReferSteps = [
  {
    icon: invite_ic,
    title: "Invite Friends to Join",
    desc: "Share your referral code and invite your friends to create an account and get started.",
  },
  {
    icon: linkIcon,
    title: "Instant Referral Linking",
    desc: "When your friends sign up using your referral, their account is automatically linked to you.",
  },
  {
    icon: giftIc,
    title: "Earn Exciting Rewards",
    desc: "As your referrals stay active and trade, you receive attractive reward benefits automatically.",
  },
];

const RefferalReward = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const referCode = useAppSelector((state) => state.home.referCode);
  const referralList = useAppSelector((state) => state.home.referralList);

  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contentLoading, setContentLoading] = useState(true);

  const referralLink = referCode
    ? `${SIGNUP_BASE_URL}/signup?reffcode=${referCode}`
    : "";

  const copyToClipboard = useCallback((text) => {
    if (!text) return;
    copyText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  useEffect(() => {
    dispatch(getUserReferCode());
    dispatch(getReferralList());
  }, [dispatch]);

  useEffect(() => {
    if (referCode != null || Array.isArray(referralList)) {
      setContentLoading(false);
    }
  }, [referCode, referralList]);

  const filteredList = (referralList ?? []).filter((item) => {
    if (!searchTerm?.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    const maskedId = item?.masked_id ?? item?.uuid ?? "";
    const fullName =
      item?.full_name_masked ??
      `${item?.firstName ?? ""} ${item?.lastName ?? ""}`.trim();
    return (
      maskedId?.toLowerCase().includes(q) ||
      fullName?.toLowerCase().includes(q)
    );
  });

  const getDisplayName = (item) => {
    const name =
      item?.full_name_masked ??
      `${item?.firstName ?? ""} ${item?.lastName ?? ""}`.trim();
    return name || "—";
  };
  const getDisplayId = (item) => item?.masked_id ?? item?.uuid ?? "—";
  const getJoinDateTime = (item) => {
    const d = item?.signup_date ?? item?.createdAt;
    return d ? moment(d).format("DD/MM/YYYY hh:mm A") : "—";
  };
  const getKycStatus = (item) => {
    if (item?.kyc_status) return item.kyc_status;
    return item?.kycVerified === 2 ? "Verified" : "Not Submitted";
  };
  const getKycStatusColor = (item) => {
    const status = getKycStatus(item);
    if (status?.toLowerCase().includes("verified") && !status?.toLowerCase().includes("not"))
      return colors.green;
    if (
      status?.toLowerCase().includes("submitted") ||
      status?.toLowerCase().includes("pending")
    )
      return colors.buttonBg;
    return colors.descText;
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      <KeyBoardAware>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <FastImage
              source={back_ic}
              resizeMode="contain"
              style={styles.backIcon}
              tintColor={theme !== "Dark" ? colors.black : colors.white}
            />
          </TouchableOpacity>
          <AppText weight={SEMI_BOLD} type={SIXTEEN}>
            Referral/Rewards Hub
          </AppText>
        </View>

        {contentLoading ? (
          <RefferalRewardSkeleton />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentBlock}>
              <AppText style={styles.cardTitle} color={YELLOW} weight={SEMI_BOLD}>
                Exciting Referral Reward
              </AppText>
              <AppText style={styles.cardSubtitle} weight={SEMI_BOLD}>
                Invite your friends and earn amazing rewards!
              </AppText>
              <AppText style={styles.cardDesc} color={DISCLAIMTEXT}>
                Get rewarded when they sign up and unlock additional bonuses after
                they complete verification.
              </AppText>
            </View>
            <View style={styles.card}>

              {/* Referral link row */}
              <View style={styles.refRow}>
                <View style={styles.refLabelRow}>
                  <FastImage
                    tintColor={colors.secondaryText}
                    source={linkIcon}
                    style={styles.refIconImg}
                    resizeMode="contain"
                  />
                  <AppText type={TWELVE} style={{ color: colors.descText }}>
                    Referral link:
                  </AppText>
                </View>
                <View style={styles.refValueRow}>
                  <AppText type={TWELVE} color={colors.descText} numberOfLines={1} style={styles.refValue}>
                    {referralLink || "—"}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(referralLink)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <FastImage source={copyIcon} style={styles.copyIconImg} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Referral code row */}
              <View style={styles.refRow}>
                <View style={styles.refLabelRow}>
                  <FastImage
                    source={peopleIcon}
                    style={styles.refIconImg}
                    tintColor={colors.secondaryText}
                    resizeMode="contain"
                  />
                  <AppText type={TWELVE} style={{ color: colors.descText }}>
                    Referral code:
                  </AppText>
                </View>
                <View style={styles.refValueRow}>
                  <AppText type={TWELVE} color={colors.descText}>
                    {referCode || "—"}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(referCode)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <FastImage source={copyIcon} style={styles.copyIconImg} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Code input + Copy button */}
              <View style={styles.copyFieldWrap}>
                <TextInput
                  style={styles.copyFieldInput}
                  value={referCode ?? ""}
                  editable={false}
                  placeholder="Referral code"
                  placeholderTextColor={colors.placeholderColor}
                />
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(referCode)}
                >
                  <AppText type={TWELVE} weight={SEMI_BOLD}>
                    {isCopied ? "Copied!" : "Copy"}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
            {/* <FastImage
             source={rewardBanner1}
             resizeMode="contain"
             style={{
               width: Dimensions.get('window').width - 40,
               height: 100,
               alignSelf: 'center',
               marginTop: 15,
               overflow: 'hidden',
             }}
           /> */}

            {/* More Referral Events */}
            <View style={styles.eventsSection}>

              <Carousel
                loop
                width={CONTENT_WIDTH}
                height={250}
                autoPlay
                autoPlayInterval={3500}
                data={referralEvents}
                scrollAnimationDuration={400}
                onSnapToItem={(index) => setCurrentSlide(index)}
                renderItem={({ item: event }) => (
                  <View style={[styles.eventCard, { width: CONTENT_WIDTH }]}>
                    <View style={styles.eventCardInner}>
                      <FastImage
                        source={event.image}
                        resizeMode="contain"
                        style={styles.eventCardImage}
                      />
                      <AppText style={styles.eventCardTitle} weight={SEMI_BOLD}>
                        {event.title}
                      </AppText>
                      <AppText
                        type={TWELVE}
                        color={colors.descText}
                        style={styles.eventCardDesc}
                      >
                        {event.description}
                      </AppText>
                      <TouchableOpacity
                        style={styles.inviteNowBtn}
                        onPress={() => copyToClipboard(referralLink)}
                      >
                        <AppText type={TWELVE} weight={SEMI_BOLD}>
                          Invite Now
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                style={styles.eventsCarousel}
              />
              <View style={styles.dotsRow}>
                {referralEvents.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentSlide === index && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
            {/* How to Refer and Earn Rewards */}

            <View style={styles.howToSection}>
              <AppText style={styles.sectionTitle} weight={SEMI_BOLD}>
                How to Refer and Earn Rewards
              </AppText>
              {howToReferSteps.map((step, index) => (
                <View key={index} style={styles.howToItem}>
                  <FastImage
                    tintColor={colors.secondaryText}
                    source={step.icon}
                    style={styles.howToIconImg}
                    resizeMode="contain"
                  />
                  <View style={styles.howToContent}>
                    <AppText style={styles.howToTitle} weight={SEMI_BOLD}>
                      {step.title}
                    </AppText>
                    <AppText type={TWELVE} color={colors.descText}>
                      {step.desc}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>



            {/* Referral History */}
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <AppText style={styles.sectionTitle} weight={SEMI_BOLD}>
                  Referral History
                </AppText>
                <View style={styles.searchWrap}>
                  <FastImage
                    source={searchIcon}
                    style={styles.searchIconImg}
                    resizeMode="contain"
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by ID"
                    placeholderTextColor={colors.placeholderColor}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                  />
                </View>
              </View>

              {filteredList?.length > 0 ? (
                filteredList.map((item, index) => (
                  <View key={item?._id ?? index} style={styles.historyCard}>
                    <View style={styles.historyRow}>
                      <AppText type={TWELVE} color={colors.descText}>
                        Name
                      </AppText>
                      <AppText type={TWELVE}>{getDisplayName(item)}</AppText>
                    </View>
                    <View style={styles.historyRow}>
                      <AppText type={TWELVE} color={colors.descText}>
                        Referral ID
                      </AppText>
                      <AppText type={TWELVE}>{getDisplayId(item)}</AppText>
                    </View>
                    <View style={styles.historyRow}>
                      <AppText type={TWELVE} color={colors.descText}>
                        KYC Status
                      </AppText>
                      <AppText
                        type={TWELVE}
                        style={{ color: getKycStatusColor(item) }}
                      >
                        {getKycStatus(item)}
                      </AppText>
                    </View>
                    <View style={styles.historyRow}>
                      <AppText type={TWELVE} color={colors.descText}>
                        Join Date
                      </AppText>
                      <AppText type={TWELVE}>
                        {getJoinDateTime(item)}
                      </AppText>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataWrap}>
                  <FastImage source={NO_NOTIFICATION_ICON} style={{ width: 80, height: 80 }} resizeMode="contain" />
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
    marginHorizontal: CONTENT_PADDING,
    alignItems: "center",
  },
  backIcon: { width: 20, height: 20 },
  tabsRow: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: CONTENT_PADDING,
    gap: 20,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  contentBlock: {
    marginHorizontal: CONTENT_PADDING,
    paddingTop: 4,
    paddingBottom: 0,
    marginTop: 10
  },
  card: {
    marginHorizontal: CONTENT_PADDING,
    marginTop: 4,
    padding: 16,
    backgroundColor: colors.themeElevationColor,
    borderRadius: 12,
  },
  cardTitle: { fontSize: 14, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.white, marginBottom: 2 },
  cardDesc: { fontSize: 12, marginBottom: 12 },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  refLabelRow: { flexDirection: "row", alignItems: "center", flex: 0.4 },
  refIconImg: { width: 13, height: 13, marginRight: 6, tintColor: colors.secondaryText },
  copyIconImg: { width: 15, height: 15, },
  refValueRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.6,
    gap: 8,
  },
  refValue: { flex: 1 },
  copyFieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.dividerColor,
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  copyFieldInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.white,
    fontSize: 12,
  },
  copyBtn: {
    backgroundColor: colors.overlayColor,
    paddingVertical: 12,
    paddingHorizontal: 20,
    right: 5,
    borderRadius: 5
  },
  bannerWrap: {
    marginHorizontal: CONTENT_PADDING,
    marginTop: 16,
    backgroundColor: colors.themeElevationColor,
    borderRadius: 12,
  },
  bannerImage: {
    width: CONTENT_WIDTH,
    height: Math.round(CONTENT_WIDTH * 0.55),
  },
  howToSection: {
    marginHorizontal: CONTENT_PADDING,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.white,
    marginBottom: 12,
  },
  howToItem: {
    flexDirection: "row",
    marginBottom: 14,
  },
  howToIconImg: { width: 20, height: 20, marginRight: 10 },
  howToContent: { flex: 1 },
  howToTitle: { fontSize: 12, color: colors.white, marginBottom: 2 },
  eventsSection: { marginTop: 24, marginHorizontal: CONTENT_PADDING },
  eventsCarousel: { width: CONTENT_WIDTH, marginTop: 8 },
  eventCard: {
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    justifyContent: "center",

  },
  eventCardInner: {
    backgroundColor: '#2b313c',
    borderRadius: 12,
    padding: 16,
  },
  eventCardImage: {
    width: "100%",
    height: 100,
    marginBottom: 12,
  },
  eventCardTitle: { fontSize: 13, color: colors.white, marginBottom: 4 },
  eventCardDesc: { fontSize: 12, marginBottom: 8 },
  inviteNowBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.sheetColor,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: { backgroundColor: colors.white },
  historySection: { marginHorizontal: CONTENT_PADDING, marginTop: 24, paddingBottom: 24 },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.themeElevationColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    minWidth: 140,
  },
  searchIconImg: { width: 18, height: 18, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 12,
    paddingVertical: 0,
  },
  historyCard: {
    backgroundColor: colors.themeElevationColor,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noDataWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
});

export default RefferalReward;
