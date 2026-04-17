import React, { useCallback, useEffect, useState, useRef } from "react";
import { Animated, Dimensions } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  Button,
  RED,
  SEMI_BOLD,
  FOURTEEN,
  FIFTEEN,
  THIRD,
  NORMAL,
  TWELVE,
  THIRTEEN,
} from "../../shared";
import { StyleSheet, TouchableOpacity, View, ScrollView, FlatList, useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import {
  appBg,
  kyc_completed,
  kyc_pending,
  kyc_rejected,
  kyc_success_vector,
  NEW_STAR,
  KYC_THEME,
  closeIcon,
  checkIc,
  downIcon,
  upIcon,
  kyc_ic,
  kyc_verification_vector,
} from "../../helper/ImageAssets";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { borderWidth, universalPaddingHorizontal, universalPaddingHorizontalHigh } from "../../theme/dimens";
import { colors } from "../../theme/colors";
import { commonStyles } from "../../theme/commonStyles";
import NavigationService from "../../navigation/NavigationService";
import { KYC_STEP_ONE_SCREEN, KYC_RESUBMIT_SCREEN, TRADE_SCREEN, NAVIGATION_BOTTOM_TAB_STACK, NAVIGATION_TRADE_STACK } from "../../navigation/routes";
import { useFocusEffect } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { setLoading } from "../../slices/authSlice";
import { getUserProfile, getKycStatus } from "../../actions/accountActions";
import KycStepHeader from "./KycStepHeader";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SHIMMER_STRIP = 180;
const SIDE_PAD = 16;
const CARD_W = SCREEN_WIDTH - SIDE_PAD * 2;

// ─── Shimmer cell ────────────────────────────────────────────────────────────
const ShimmerCell = ({ width: w, height, borderRadius = 6, style }) => {
  const shimmerX = useRef(new Animated.Value(-SHIMMER_STRIP)).current;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const run = () => {
      if (!mounted.current) return;
      shimmerX.setValue(-SHIMMER_STRIP);
      Animated.timing(shimmerX, {
        toValue: Math.max(w, 1) + SHIMMER_STRIP,
        duration: 1100,
        useNativeDriver: true,
      }).start(({ finished }) => { if (mounted.current && finished) run(); });
    };
    const t = setTimeout(run, 50);
    return () => { mounted.current = false; clearTimeout(t); shimmerX.stopAnimation(); };
  }, [shimmerX, w]);
  return (
    <View style={[{ width: w, height, borderRadius, overflow: "hidden", backgroundColor: colors.themeElevationColor }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, bottom: 0, width: SHIMMER_STRIP, transform: [{ translateX: shimmerX }], backgroundColor: "rgba(255,255,255,0.07)" }}
      />
    </View>
  );
};

// ─── KYC Status card skeleton (only the dynamic top card) ────────────────────
const KycStatusSkeleton = ({ isDark }) => {
  const cardBg = isDark ? colors.themeElevationColor : "#F5F5F5";
  return (
    <View style={[styles.kycSectionCard, { backgroundColor: cardBg }]}>
      {/* Title */}
      <ShimmerCell width={160} height={16} borderRadius={5} style={{ marginBottom: 12 }} />
      {/* Description lines */}
      <ShimmerCell width={CARD_W - 40} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
      <ShimmerCell width={CARD_W * 0.75} height={11} borderRadius={4} style={{ marginBottom: 16 }} />
      {/* Sub-heading */}
      <ShimmerCell width={120} height={13} borderRadius={4} style={{ marginBottom: 10 }} />
      {/* Doc status rows × 3 */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <ShimmerCell width={22} height={22} borderRadius={11} />
          <ShimmerCell width={CARD_W * 0.55} height={11} borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

const getDocStatusDisplay = (status) => {
  switch (status) {
    case "approved": return { icon: "✅", text: "Approved" };
    case "rejected": return { icon: "❌", text: "Rejected" };
    case "resubmit_required": return { icon: "⚠️", text: "Resubmission Required" };
    case "pending":
    default: return { icon: "⏳", text: "Under Review" };
  }
};

const getDocTypeName = (code) => {
  const names = { AADHAAR: "Aadhaar Card", PAN: "PAN Card", TAX_ID: "TAX ID", PASSPORT: "Passport", NATIONAL_ID: "National ID Card", DRIVING_LICENSE: "Driving License", RESIDENCE_PERMIT: "Residence Permit", SSN: "SSN", TIN: "TIN", NIN: "NIN", TFN: "TFN", NRIC: "NRIC", EMIRATES_ID: "Emirates ID", VOTER_ID: "Voter ID" };
  return names[code] || code || "ID Document";
};

const KycPending = ({ theme, idDocStatus, taxDocStatus, selfieStatus, submittedIdDocType, submittedTaxDocType, showResubmitButton, onResubmitPress }) => {
  const idD = getDocStatusDisplay(idDocStatus);
  const taxD = getDocStatusDisplay(taxDocStatus);
  const selfD = getDocStatusDisplay(selfieStatus);
  const isDark = theme === "Dark";
  const cardBg = isDark ? colors.themeElevationColor : "#F5F5F5";
  const textPrimary = isDark ? colors.white : colors.black;
  const textMuted = isDark ? colors.descText : "#666";

  const docItems = [
    { label: submittedIdDocType ? getDocTypeName(submittedIdDocType) : "Identity Document", status: idD.text, icon: idD.icon },
    { label: submittedTaxDocType ? getDocTypeName(submittedTaxDocType) : "Tax Document", status: taxD.text, icon: taxD.icon },
    { label: "Live Selfie", status: selfD.text, icon: selfD.icon },
  ];

  return (
    <View style={[styles.kycSectionCard, { backgroundColor: cardBg }]}>
      <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.kycSectionCardTitle, { color: textPrimary }]}>
        KYC Pending
      </AppText>
      <AppText type={FOURTEEN} weight={NORMAL} style={[styles.kycPendingDesc, { color: textMuted }]}>
        Your KYC application has been submitted and is currently under review. You will be notified once the verification is complete.
      </AppText>
      <View style={styles.kycPendingDocsHeaderRow}>
        <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.kycPendingDocsTitle, { color: textPrimary }]}>
          Documents Submitted
        </AppText>
      </View>
      <View style={styles.kycPendingDocList}>
        <View style={styles.kycPendingDocListContent}>
          {docItems.map((item, index) => (
            <View key={index} style={styles.kycPendingDocRow}>
              <AppText type={FOURTEEN} style={styles.kycPendingDocIconText}>{item.icon}</AppText>
              <AppText type={FOURTEEN} style={{ color: textMuted, flex: 1 }}>
                {item.label} - {item.status}
              </AppText>
            </View>
          ))}
        </View>
        <FastImage source={kyc_verification_vector} resizeMode="contain" style={styles.kycPendingIllustrationSide} />
      </View>
      {showResubmitButton && onResubmitPress ? (
        <Button children="Resubmit Documents" onPress={onResubmitPress} containerStyle={styles.kycPendingResubmitButton} />
      ) : null}
    </View>
  );
};

const KycRejected = ({ onVerifyPress }) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);
  const kyc_reject_reason = userData?.kyc_reject_reason;
  return (
    <View>
      <FastImage
        source={kyc_rejected}
        resizeMode="contain"
        style={styles.icon}
      />
      <AppText
        weight={SEMI_BOLD}
        style={[styles.title, { color: colors.text_one }]}
      >
        Your Zillion Exchange Account KYC is rejected. Please complete your KYC
        again.
      </AppText>
      {kyc_reject_reason ? (
        <View style={styles.reasonContainer}>
          <AppText style={commonStyles.centerText} color={RED}>
            Reason: {kyc_reject_reason}
          </AppText>
        </View>
      ) : null}
      <Button
        children="Verify Again"
        onPress={onVerifyPress}
        containerStyle={styles.button}
      />
    </View>
  );
};

const KycPartialRejection = ({ onResubmitPress, idDocStatus, taxDocStatus, selfieStatus, submittedIdDocType, submittedTaxDocType, getRejectReason }) => {
  const idD = getDocStatusDisplay(idDocStatus);
  const taxD = getDocStatusDisplay(taxDocStatus);
  const selfD = getDocStatusDisplay(selfieStatus);
  return (
    <View>
      <FastImage source={kyc_rejected} resizeMode="contain" style={styles.icon} />
      <AppText weight={SEMI_BOLD} style={[styles.title, { color: colors.text_one }]}>
        Documents Need Resubmission
      </AppText>
      <AppText type={FOURTEEN} style={{ color: colors.text_three, marginTop: 8, marginHorizontal: universalPaddingHorizontalHigh }}>
        Some of your documents require resubmission. Please check the details below and upload the corrected documents.
      </AppText>
      <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.requirementsTitle, { marginTop: 16 }]}>Document Status</AppText>
      <View style={styles.requirementsList}>
        <View style={styles.requirementItem}>
          <AppText type={FOURTEEN}>{idD.icon} {submittedIdDocType ? getDocTypeName(submittedIdDocType) : "Identity Document"} - {idD.text}</AppText>
          {idDocStatus === "resubmit_required" && getRejectReason("id_document") ? (
            <AppText type={TWELVE} color={RED} style={{ marginLeft: 8 }}>Reason: {getRejectReason("id_document")}</AppText>
          ) : null}
        </View>
        <View style={styles.requirementItem}>
          <AppText type={FOURTEEN}>{taxD.icon} {submittedTaxDocType ? getDocTypeName(submittedTaxDocType) : "Tax Document"} - {taxD.text}</AppText>
          {taxDocStatus === "resubmit_required" && getRejectReason("tax_document") ? (
            <AppText type={TWELVE} color={RED}>Reason: {getRejectReason("tax_document")}</AppText>
          ) : null}
        </View>
        <View style={styles.requirementItem}>
          <AppText type={FOURTEEN}>{selfD.icon} Live Selfie - {selfD.text}</AppText>
          {selfieStatus === "rejected" && getRejectReason("selfie") ? (
            <AppText type={TWELVE} color={RED}>Reason: {getRejectReason("selfie")}</AppText>
          ) : null}
        </View>
      </View>
      <Button children="Resubmit Documents" onPress={onResubmitPress} containerStyle={styles.button} />
    </View>
  );
};

const KycDue = ({ theme, onVerifyPress, screenWidth }) => {
  const isDark = theme === "Dark";
  const isSmallScreen = screenWidth < 380;
  const textPrimary = isDark ? colors.white : colors.black;
  const textSecondary = isDark ? colors.descText : "#666";
  const textMuted = isDark ? "#999" : "#666";
  return (
    <View style={[styles.kycCard, { backgroundColor: isDark ? colors.themeElevationColor : "#F5F5F5" }]}>
      <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.kycCardTitle, { color: textPrimary }]}>KYC</AppText>
      <AppText type={TWELVE} weight={NORMAL} style={[styles.kycCardDesc, { color: textSecondary }]}>
        Finish your KYC in just a few minutes and enjoy a seamless experience. Submit your basic details once and get instant access to withdrawals, rewards, and every feature without any delays or limitations.
      </AppText>
      <AppText type={THIRTEEN} weight={SEMI_BOLD} style={[styles.kycRequirementsSubtitle, { color: textPrimary }]}>KYC Verification Requirements</AppText>
      <View style={[styles.kycRequirementsRow, isSmallScreen && styles.kycRequirementsRowColumn]}>
        <View style={styles.kycRequirementsList}>
          <View style={styles.requirementItem}>
            <FastImage source={NEW_STAR} resizeMode="contain" style={styles.starIcon} tintColor={colors.white} />
            <AppText type={THIRTEEN} weight={NORMAL} style={[styles.requirementText, { color: textMuted }]}>ID Document</AppText>
          </View>
          <View style={styles.requirementItem}>
            <FastImage source={NEW_STAR} resizeMode="contain" style={styles.starIcon} tintColor={colors.white} />
            <AppText type={THIRTEEN} weight={NORMAL} style={[styles.requirementText, { color: textMuted }]}>Tax Document</AppText>
          </View>
          <View style={styles.requirementItem}>
            <FastImage source={NEW_STAR} resizeMode="contain" style={styles.starIcon} tintColor={colors.white} />
            <AppText type={THIRTEEN} weight={NORMAL} style={[styles.requirementText, { color: textMuted }]}>Live Selfie (Camera Required)</AppText>
          </View>
        </View>
        {!isSmallScreen && (
          <FastImage source={KYC_THEME} resizeMode="contain" style={styles.kycThemeIcon} />
        )}
      </View>
      <Button children="Verify" onPress={onVerifyPress} containerStyle={styles.verifyButton} />
      {isSmallScreen && (
        <FastImage source={KYC_THEME} resizeMode="contain" style={styles.kycThemeIconSmall} />
      )}
    </View>
  );
};
const YOUR_BENEFITS = [
  "Deposit & Withdraw Without Limit",
  "Spot & Futures Trading Unlock",
  "100% Secure Trading with Verified KYC",
];

const KycCompleted = () => {
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === "Dark";
  const cardBg = isDark ? colors.themeElevationColor : "#F5F5F5";
  const textMuted = isDark ? colors.descText : "#666";
  return (
    <View style={[styles.kycSectionCard, styles.kycCompletedCard, { backgroundColor: cardBg }]}>
      <AppText type={FOURTEEN} style={[styles.kycCompletedCongrats, { color: textMuted }]}>
        Congratulations! Your KYC verification has been approved. You now have full access to all platform features.
      </AppText>
      <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.kycCompletedBenefitsTitle, { color: isDark ? colors.white : colors.black }]}>
        Your Benefits
      </AppText>
      <View style={styles.kycCompletedBenefitsRow}>
        <View style={styles.kycCompletedBenefitsList}>
          {YOUR_BENEFITS.map((text, i) => (
            <View key={i} style={styles.kycCompletedBenefitRow}>
              <FastImage source={checkIc} resizeMode="contain" style={styles.kycCompletedCheck} tintColor={colors.green} />
              <AppText type={FOURTEEN} style={[styles.kycCompletedBenefitText, { color: isDark ? colors.white : colors.black }]} numberOfLines={2}>{text}</AppText>
            </View>
          ))}
        </View>
        <FastImage
          source={kyc_success_vector}
          resizeMode="contain"
          style={styles.kycSuccessVector}
        />
      </View>
    </View>
  );
};

const faqData = [
  { q: "How long does KYC take?", a: "KYC verification usually takes 24-48 hours after submission." },
  { q: "What documents do I need for KYC?", a: "A valid government-issued ID and tax document are required." },
  { q: "Can I use the app without completing KYC?", a: "Limited features are available, but full access requires KYC." },
  { q: "Is my personal information secure in the KYC process?", a: "Your data is encrypted and handled according to strict security standards." },
  { q: "Can I resubmit my KYC if it gets rejected?", a: "Yes, if your KYC is rejected or partially rejected, you can reupload the requested documents and resubmit." },
  { q: "Do I need to upload both front and back of my ID?", a: "Some ID documents require both front and back images. The upload fields will appear based on the selected document type." },
  { q: "Is live selfie mandatory for KYC?", a: "Yes, a live selfie captured through your device camera is required to complete KYC verification." },
];

const KycStatus = () => {
  const theme = useAppSelector(state => state.auth.theme);
  const userData = useAppSelector((state) => state.auth.userData);
  const dispatch = useAppDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const kycVerified = userData?.kycVerified != null ? Number(userData.kycVerified) : 0;

  const [idDocStatus, setIdDocStatus] = useState(null);
  const [taxDocStatus, setTaxDocStatus] = useState(null);
  const [selfieStatus, setSelfieStatus] = useState(null);
  const [submittedIdDocType, setSubmittedIdDocType] = useState(null);
  const [submittedTaxDocType, setSubmittedTaxDocType] = useState(null);
  const [needsResubmission, setNeedsResubmission] = useState(false);
  const [documentsToResubmit, setDocumentsToResubmit] = useState([]);
  const [existingIdDocNumber, setExistingIdDocNumber] = useState("");
  const [existingTaxDocNumber, setExistingTaxDocNumber] = useState("");
  const [existingCountryCode, setExistingCountryCode] = useState("");
  const [existingKycData, setExistingKycData] = useState(null);
  const [resubmitIdNumber, setResubmitIdNumber] = useState("");
  const [resubmitTaxNumber, setResubmitTaxNumber] = useState("");
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
  // Shows skeleton on the KYC status card until API data is ready
  const [contentLoading, setContentLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      dispatch(setLoading(true));
      return () => {
        dispatch(setLoading(false));
      };
    }, [dispatch])
  );

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await dispatch(getKycStatus());
      if (!mounted) return;
      dispatch(setLoading(false));
      setContentLoading(false); // data arrived → hide skeleton
      if (!data) return;
      setIdDocStatus(data.id_document_status ?? null);
      setTaxDocStatus(data.tax_document_status ?? null);
      setSelfieStatus(data.selfie_status ?? null);
      if (data.kyc_data) {
        setExistingKycData(data.kyc_data);
        setSubmittedIdDocType(data.kyc_data.id_document_type ?? null);
        setSubmittedTaxDocType(data.kyc_data.tax_document_type ?? null);
        setExistingCountryCode(data.kyc_data.country_code ?? "");
        if (data.kyc_data.id_document_number) {
          setExistingIdDocNumber(data.kyc_data.id_document_number);
          setResubmitIdNumber(data.kyc_data.id_document_number);
        }
        if (data.kyc_data.tax_document_number) {
          setExistingTaxDocNumber(data.kyc_data.tax_document_number);
          setResubmitTaxNumber(data.kyc_data.tax_document_number);
        }
      } else {
        setExistingKycData(null);
      }
      if (data.needs_resubmission) {
        setNeedsResubmission(true);
        setDocumentsToResubmit(data.documents_needing_resubmission || []);
      } else {
        setNeedsResubmission(false);
        setDocumentsToResubmit([]);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch, userData?.kycVerified]);

  const getRejectReason = (docType) => {
    const doc = documentsToResubmit.find((d) => d.type === docType);
    return doc?.reason || "";
  };



  const openVerifyModal = () => {
    NavigationService.navigate(KYC_STEP_ONE_SCREEN, { resetForm: true });
  };

  // Web-like flow: partial reject (4) → dedicated Resubmit screen (only rejected docs + verification). Full reject (3) → full KYC flow.
  const openResubmitModal = () => {
    setResubmitIdNumber(existingIdDocNumber);
    setResubmitTaxNumber(existingTaxDocNumber);
    NavigationService.navigate(KYC_RESUBMIT_SCREEN, {
      documentsToResubmit: documentsToResubmit || [],
      existingCountryCode: existingCountryCode || "",
      submittedIdDocType: submittedIdDocType || null,
      submittedTaxDocType: submittedTaxDocType || null,
      resubmitIdNumber: existingIdDocNumber || "",
      resubmitTaxNumber: existingTaxDocNumber || "",
    });
  };



  const benefitsTableRows = [
    { level: "KYC Level", unverified: "Unlimited", advanced: "Unlimited" },
    { level: "Crypto Deposit", unverified: "1 BTC per day", advanced: "100 BTC per day*" },
    { level: "Crypto Withdrawal", unverified: null, unverifiedAvailable: false, advanced: "30,000 USD per day*" },
    { level: "Crypto Swap", unverified: null, unverifiedAvailable: false, advanced: null, advancedAvailable: true },
    { level: "Spot/Futures Trading", unverified: null, unverifiedAvailable: false, advanced: null, advancedAvailable: true },
    { level: "Platform Events", unverified: null, unverifiedAvailable: true, advanced: null, advancedAvailable: true },
  ];

  const renderBenefitsTable = (theme) => {
    const isDark = theme === "Dark";
    const textClr = isDark ? colors.white : colors.black;
    const textMuted = isDark ? "#999" : "#666";
    const accentClr = colors.white;
    return (
      <View style={styles.benefitsTableWrap}>
        <View style={styles.benefitsTableHeader}>
          <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.benefitsTableHeaderCell, styles.benefitsColLevel, { color: textClr }]}>Level</AppText>
          <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.benefitsTableHeaderCell, { color: textClr }]}>Unverified</AppText>
          <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.benefitsTableHeaderCell, { color: textClr }]}>Advanced KYC</AppText>
        </View>
        {benefitsTableRows.map((row, i) => (
          <View key={i} style={styles.benefitsTableRow}>
            <View style={styles.benefitsTableLevelCell}>
              <FastImage source={NEW_STAR} resizeMode="contain" style={styles.benefitsStar}  tintColor={accentClr} />
              <AppText type={TWELVE} weight={NORMAL} style={{ color: textMuted, flex: 1 }} numberOfLines={1}>{row.level}</AppText>
            </View>
            <View style={styles.benefitsTableDataCell}>
              {row.unverified != null ? (
                <AppText type={TWELVE} style={{ color: textMuted }}>{row.unverified}</AppText>
              ) : row.unverifiedAvailable ? (
                <FastImage source={checkIc} resizeMode="contain" style={styles.benefitsIconSmall} tintColor={accentClr} />
              ) : (
                <FastImage source={closeIcon} resizeMode="contain" style={styles.benefitsIconSmall} tintColor={colors.red} />
              )}
            </View>
            <View style={styles.benefitsTableDataCell}>
              {row.advanced != null ? (
                <AppText type={TWELVE} style={{ color: textMuted }}>{row.advanced}</AppText>
              ) : row.advancedAvailable ? (
                <FastImage source={checkIc} resizeMode="contain" style={styles.benefitsIconSmall} tintColor={accentClr} />
              ) : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const kycStatus = (theme) => {
    if (kycVerified === 0) return <KycDue theme={theme} onVerifyPress={openVerifyModal} screenWidth={screenWidth} />;
    if (kycVerified === 1) return <KycPending theme={theme} idDocStatus={idDocStatus} taxDocStatus={taxDocStatus} selfieStatus={selfieStatus} submittedIdDocType={submittedIdDocType} submittedTaxDocType={submittedTaxDocType} />;
    if (kycVerified === 2) return <KycCompleted />;
    if (kycVerified === 3) return <KycRejected onVerifyPress={openVerifyModal} />;
    if (kycVerified === 4) return <KycPending theme={theme} idDocStatus={idDocStatus} taxDocStatus={taxDocStatus} selfieStatus={selfieStatus} submittedIdDocType={submittedIdDocType} submittedTaxDocType={submittedTaxDocType} showResubmitButton onResubmitPress={openResubmitModal} />;
    return <KycDue theme={theme} onVerifyPress={openVerifyModal} screenWidth={screenWidth} />;
  };

  const isDark = theme === "Dark";
  const cardBg = isDark ? colors.themeElevationColor : "#F5F5F5";
  const textPrimary = isDark ? colors.white : colors.black;

  return (
    <AppSafeAreaView source={theme !== "Dark" && appBg} style={{ backgroundColor: colors.newThemeColor, flex: 1 }}>
      <KeyBoardAware style={{ flex: 1 }}>
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <KycStepHeader title={kycVerified === 2 ? "KYC Verified" : "KYC Verification"} theme={theme} />

          <View style={styles.sectionWrapper}>
            {/* KYC status card — skeleton while API is loading, real card after */}
            {contentLoading
              ? <KycStatusSkeleton isDark={isDark} />
              : kycStatus(theme)
            }

            <View style={[styles.kycSectionCard, { backgroundColor: cardBg }]}>
              <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.kycSectionCardTitle, { color: textPrimary }]}>Account Benefits</AppText>
              {renderBenefitsTable(theme)}
            </View>

            <View style={[styles.kycSectionCard, { backgroundColor: cardBg }]}>
              <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.kycSectionCardTitle, { color: textPrimary }]}>Faq</AppText>
              <FlatList
                data={faqData}
                keyExtractor={(_, index) => String(index)}
                style={styles.faqListWrap}
                contentContainerStyle={styles.faqScrollContent}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={[styles.faqItemInner, index === faqData.length - 1 && styles.faqItemInnerLast]}>
                    <TouchableOpacity
                      style={styles.faqQuestionRow}
                      onPress={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)}
                      activeOpacity={0.7}
                    >
                      <AppText type={THIRTEEN} weight={SEMI_BOLD} style={[styles.faqQuestion, { color: isDark ? "#999" : "#666" }]}>{item.q}</AppText>
                      <FastImage
                        source={faqActiveIndex === index ? upIcon : downIcon}
                        resizeMode="contain"
                        style={styles.faqArrow}
                        tintColor={isDark ? "#999" : "#666"}
                      />
                    </TouchableOpacity>
                    {faqActiveIndex === index && (
                      <View style={styles.faqAnswer}>
                        <AppText type={TWELVE} style={{ color: isDark ? "#999" : "#666", lineHeight: 18 }}>{item.a}</AppText>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        </ScrollView>

      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default KycStatus;
const styles = StyleSheet.create({
  mainScroll: { flex: 1 },
  mainScrollContent: { paddingBottom: 40, flexGrow: 1 },
  sectionWrapper: { paddingHorizontal: 16, flex: 1 },
  kycCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    overflow: "hidden",
  },
  kycCardTitle: { marginBottom: 10 },
  kycCardDesc: { lineHeight: 18, marginBottom: 14 },
  kycRequirementsSubtitle: { marginBottom: 12 },
  kycRequirementsRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  kycRequirementsRowColumn: { flexDirection: "column" },
  kycRequirementsList: { flex: 1, marginBottom: 16 },
  kycThemeIcon: { width: 100, height: 76, marginLeft: 12 },
  kycThemeIconSmall: { width: 120, height: 90, alignSelf: "center", marginTop: 12 },
  kycSectionCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  kycSectionCardTitle: { marginBottom: 8 },
  benefitsTableWrap: {},
  benefitsTableHeader: { flexDirection: "row", marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(128,128,128,0.2)" },
  benefitsTableHeaderCell: { flex: 1, textAlign: "left" },
  benefitsColLevel: { flex: 1.4 },
  benefitsTableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "rgba(128,128,128,0.15)" },
  benefitsTableLevelCell: { flex: 1.4, flexDirection: "row", alignItems: "center" },
  benefitsTableDataCell: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
  benefitsIconSmall: { width: 14, height: 14 },
  requirementsRowColumn: { flexDirection: "column", alignItems: "flex-start" },
  benefitsScrollContent: { paddingRight: 20 },
  benefitsCardScroll: { marginRight: 0 },
  icon: {
    height: 170,
    width: 200,
    alignSelf: "center",
    marginTop: 50,
  },
  title: {
    textAlign: "center",
    marginHorizontal: universalPaddingHorizontalHigh,
    marginTop: 20,
  },
  title2: {
    textAlign: "center",
    marginHorizontal: universalPaddingHorizontalHigh,
    marginTop: 20,
    color: colors.text_three,
  },
  button: {
    marginTop: 60,
    width: "80%",
    alignSelf: "center"
  },
  reasonContainer: {
    backgroundColor: colors.redBg,
    borderWidth: borderWidth,
    borderColor: colors.red,
    padding: universalPaddingHorizontal,
    borderRadius: 10,
    marginTop: 10,
    width: "80%",
    alignSelf: "center"
  },
  requirementsTitle: { marginBottom: 16, marginTop: 10 },
  requirementItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  kycPendingDesc: { lineHeight: 20, marginTop: 4 },
  kycPendingDocsHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, marginBottom: 8 },
  kycPendingDocsTitle: { flex: 1, marginBottom: 0 },
  kycPendingDocList: { flexDirection: "row", alignItems: "center", marginBottom: 0 },
  kycPendingDocListContent: { flex: 1 },
  kycPendingDocRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  kycPendingDocIconText: { marginRight: 10 },
  kycPendingDocIcon: { width: 24, height: 24, borderRadius: 6, marginRight: 12 },
  kycPendingIllustrationSide: { width: 72, height: 72, marginLeft: 12 },
  kycPendingResubmitButton: { marginTop: 16, width: "100%" },
  starIcon: { width: 14, height: 14, marginRight: 8 },
  requirementText: { flex: 1 },
  verifyButton: { width: "100%", marginTop: 4 },
  benefitsStar: { width: 10, height: 10, marginRight: 6 },
  faqListWrap: {},
  faqScrollContent: { paddingBottom: 8 },
  faqItemInner: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(128,128,128,0.15)" },
  faqItemInnerLast: { borderBottomWidth: 0 },
  faqQuestionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { flex: 1 },
  faqArrow: { width: 10, height: 10, marginLeft: 8 },
  faqAnswer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(128,128,128,0.2)" },
  kycCompletedCard: {},
  kycCompletedCongrats: { marginHorizontal: 0, marginTop: 0, lineHeight: 20 },
  kycCompletedBenefitsTitle: { marginTop: 16, marginBottom: 12 },
  kycCompletedBenefitsRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  kycCompletedBenefitsList: { flex: 1 },
  kycCompletedBenefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  kycCompletedCheck: { width: 18, height: 18, marginRight: 10 },
  kycCompletedBenefitText: { flex: 1 },
  kycSuccessVector: { width: 100, height: 90 },
});
