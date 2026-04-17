
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {
  AppSafeAreaView,
  AppText,
  Button,
  Input,
  ELEVEN,
  TEN,
  WHITE,
  FOURTEEN,
  SEMI_BOLD,
  BOLD,
  SIXTEEN,
  TWELVE,
  THIRTEEN,
} from '../../shared';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/colors';
import {
  universalPaddingHorizontal,
  universalPaddingTop,
  borderWidth,
} from '../../theme/dimens';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import { back_ic, copyIcon, DOWN_ARROW, EMAIL, FINGERPRINT, lock_ic, LOCK_ICON, LOCKED, PHONE, PHOTO_ID_MINI_ICON1, UNLOCK_ICON, VERIFY_ICON_SUCCESS } from '../../helper/ImageAssets';
import { ADD_PHONE_NUMBER_SCREEN, ADD_EMAIL_SCREEN, SETUP_TWO_FACTOR_SCREEN, ADD_PASSKEY_SCREEN, CHANGE_EMAIL_SCREEN, CHANGE_MOBILE_SCREEN, VIEW_PASSKEYS_SCREEN, DISABLE_2FA_SCREEN } from '../../navigation/routes';
import {
  getUserProfile,
  getPasskeyList,
} from '../../actions/accountActions';
import { showSuccess, showError } from '../../helper/logger';
import { fontFamily } from '../../theme/typography';
import { Passkey } from 'react-native-passkey';

const CODE_LENGTH = 6;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SHIMMER_STRIP = 180;
const H_PAD = 24; // horizontalPadding(12) * 2
const CARD_W = SCREEN_WIDTH - H_PAD;

// ─── Shimmer cell ────────────────────────────────────────────────────────
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
    <View style={[{ width: w, height, borderRadius, overflow: 'hidden', backgroundColor: 'rgba(128,128,128,0.15)' }, style]}>
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, bottom: 0, width: SHIMMER_STRIP, transform: [{ translateX: shimmerX }], backgroundColor: 'rgba(255,255,255,0.07)' }}
      />
    </View>
  );
};

// ─── 2FA method cards skeleton (4 rows: icon + label + check) ────────────────────
const TwoFaCardsSkeleton = ({ borderClr }) => (
  <View style={{ marginBottom: 24 }}>
    {[1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 14,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: borderClr,
          },
        ]}
      >
        {/* Icon circle */}
        <ShimmerCell width={40} height={40} borderRadius={20} />
        {/* Label */}
        <ShimmerCell width={CARD_W * 0.45} height={13} borderRadius={4} style={{ marginLeft: 12, flex: 1 }} />
        {/* Check icon */}
        <ShimmerCell width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
      </View>
    ))}
  </View>
);

// Same as web: mask email for display
const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const masked = username.substring(0, 2) + '***' + username.slice(-1);
  return `${masked}@${domain}`;
};

// Same as web: mask phone for display
const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s/g, '');
  if (cleaned.length < 4) return phone;
  return '****' + cleaned.slice(-4);
};

const TwoFactor = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const theme = useAppSelector((state) => state.auth.theme);
  const userData = useAppSelector((state) => state.auth.userData);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  // Support both camelCase and snake_case from profile (same as web: country_code, mobileNumber)
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const mobileNumber = profileCountryCode && profileMobile
    ? `${profileCountryCode} ${profileMobile}`.trim()
    : profileMobile || '';
  const current2fa = userData?.['2fa'] ?? 0;
  const hasEmail = !!emailId;
  const hasMobile = !!profileMobile;
  const hasGoogleAuth = current2fa === 2;

  // Passkey state (same as web: passkeySupported, passkeys list, fetchPasskeys)
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeys, setPasskeys] = useState([]);
  const passkeysCount = passkeys.length;
  const hasPasskey = passkeysCount > 0;
  // Skeleton shows until profile + passkeys API calls both complete
  const [contentLoading, setContentLoading] = useState(true);
  const profileDone = useRef(false);
  const passkeysDone = useRef(false);

  const addPasskeyNavigatingBackRef = useRef(false);

  const checkPasskeySupport = () => {
    try {
      const supported = Passkey.isSupported();
      setPasskeySupported(!!supported);
      return !!supported;
    } catch {
      setPasskeySupported(false);
      return false;
    }
  };

  // Fetch passkeys from API (same as web) so enable/disable state is dynamic (e.g. passkey added on website shows as enabled)
  const fetchPasskeys = async () => {
    try {
      const res = await dispatch(getPasskeyList());
      if (res?.success && res?.data) {
        setPasskeys(res.data.passkeys || []);
      }
    } catch (_) {
      // Silent fail
    } finally {
      passkeysDone.current = true;
      if (profileDone.current) setContentLoading(false);
    }
  };

  // On mount: check passkey support
  useEffect(() => {
    checkPasskeySupport();
  }, []);

  // When screen is focused: refresh profile + passkeys from API so all enable/disable states are dynamic (e.g. changes on website reflect here)
  useFocusEffect(
    React.useCallback(() => {
      profileDone.current = false;
      passkeysDone.current = false;
      setContentLoading(true);
      dispatch(getUserProfile()).then(() => {
        profileDone.current = true;
        if (passkeysDone.current) setContentLoading(false);
      });
      fetchPasskeys();
    }, [])
  );

  const getActiveMethodsCount = () => {
    let count = 0;
    if (hasEmail) count++;
    if (hasMobile) count++;
    if (hasGoogleAuth) count++;
    if (hasPasskey) count++;
    return count;
  };

  const getSecurityLevel = () => {
    const count = getActiveMethodsCount();
    if (count >= 3) return { level: 'High', color: '#28a745' };
    if (count === 2) return { level: 'Medium', color: '#ffc107' };
    return { level: 'Low', color: '#dc3545' };
  };

  const canMakeSensitiveChanges = () => getActiveMethodsCount() >= 2;


  const handleDisableGoogleAuthStart = () => {
    if (!canMakeSensitiveChanges()) {
      showError('You need at least 2 security methods to disable Google Authenticator');
      return;
    }
    navigation.navigate(DISABLE_2FA_SCREEN);
  };

  const handleAddPasskeyPress = () => {
    if (!passkeySupported) {
      showError('Passkeys are not supported on this device/browser');
      return;
    }
    if (!hasEmail && !hasMobile && !hasGoogleAuth) {
      showError('You need email, mobile or Google Authenticator to add a passkey');
      return;
    }
    navigation.navigate(ADD_PASSKEY_SCREEN);
  };

  const handleAddMobileStart = () => {
    if (!hasEmail && !hasMobile) {
      showError('You need email or mobile verification to add a mobile number');
      return;
    }
    navigation.navigate(ADD_PHONE_NUMBER_SCREEN);
  };

  const handleChangeMobileStart = () => {
    if (!canMakeSensitiveChanges()) {
      showError('Add another method first to change mobile');
      return;
    }
    navigation.navigate(CHANGE_MOBILE_SCREEN);
  };

  const handleChangeEmailStart = () => {
    if (!canMakeSensitiveChanges()) {
      showError('Add another method first to change email');
      return;
    }
    navigation.navigate(CHANGE_EMAIL_SCREEN);
  };

  const securityLevel = getSecurityLevel();
  const activeCount = getActiveMethodsCount();
  const isDark = theme === 'Dark';
  const cardBg = isDark ? colors.white_fifteen : colors.offWhite;
  const borderClr = isDark ? colors.dividerColor : colors.secondBorder;
  const textPrimary = isDark ? colors.white : colors.black;
  const textSecondary = isDark ? '#888' : '#666';

  const horizontalPadding = 12;
  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      <View style={[styles.securityHeader, { borderBottomColor: borderClr }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.securityBackBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <FastImage source={back_ic} style={{ width: 20, height: 20 }} tintColor={textPrimary} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.securityHeaderTitleWrap} pointerEvents="box-none">
          <AppText type={SIXTEEN} weight={BOLD} style={[styles.securityHeaderTitle, { color: textPrimary }]}>
            Security
          </AppText>
        </View>
        <View style={styles.securityHeaderRight} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: textPrimary }]}>
          Two-Factor  (2FA)
        </AppText>
        <AppText type={FOURTEEN} style={[styles.sectionDesc, { color: textSecondary }]}>
          To protect your account, it is recommended to enable at least two forms of 2FA.
        </AppText>

        <View style={styles.twoFaCardList}>
          {contentLoading ? (
            <TwoFaCardsSkeleton borderClr={borderClr} />
          ) : (
            <>
              {/* Passkeys (Biometrics) - with Recommended */}
              {passkeySupported && (
                <TouchableOpacityView
                  activeOpacity={0.8}
                  onPress={hasPasskey ? () => navigation.navigate(VIEW_PASSKEYS_SCREEN) : handleAddPasskeyPress}
                  style={[styles.methodCard, { borderColor: borderClr }]}
                >
                  <View style={styles.methodCardLeft}>
                    <View style={[styles.methodIconWrap, { backgroundColor: colors.thirdBg }]}>
                      <FastImage source={FINGERPRINT} style={styles.methodIconImg} tintColor={colors.white} resizeMode="contain" />
                    </View>
                    <View style={styles.methodLabelWrap}>
                      <View style={styles.methodLabelRow}>
                        <AppText type={THIRTEEN} weight={SEMI_BOLD} style={{ color: textPrimary }}>
                          Passkeys (Biometrics)
                        </AppText>
                        <View style={styles.recommendedBadge}>
                          <AppText type={TEN} weight={SEMI_BOLD} style={{ color: colors.buttonBg }}>Recommended</AppText>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.methodCheckWrap}>
                    <FastImage source={hasPasskey ? VERIFY_ICON_SUCCESS : UNLOCK_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                  </View>
                </TouchableOpacityView>
              )}

              {/* Authenticator App */}
              <TouchableOpacityView
                activeOpacity={0.8}
                onPress={hasGoogleAuth ? handleDisableGoogleAuthStart : () => { if (!hasEmail && !hasMobile) { showError('You need an email or mobile number to set up Google Authenticator'); return; } navigation.navigate(SETUP_TWO_FACTOR_SCREEN); }}
                style={[styles.methodCard, { borderColor: borderClr }]}
              >
                <View style={styles.methodCardLeft}>
                  <View style={[styles.methodIconWrap, { backgroundColor: colors.thirdBg }]}>
                    <FastImage source={LOCK_ICON} style={styles.methodIconImg} tintColor={colors.white} resizeMode="contain" />
                  </View>
                  <AppText type={THIRTEEN} weight={SEMI_BOLD} style={{ color: textPrimary }}>
                    Authenticator App
                  </AppText>
                </View>
                <View style={styles.methodCheckWrap}>
                  <FastImage source={hasGoogleAuth ? VERIFY_ICON_SUCCESS : UNLOCK_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
              </TouchableOpacityView>

              {/* Email */}
              <TouchableOpacityView
                activeOpacity={0.8}
                onPress={!hasEmail ? () => { if (!hasMobile && !hasGoogleAuth) { showError('No verification method available to add email'); return; } navigation.navigate(ADD_EMAIL_SCREEN); } : (hasEmail && canMakeSensitiveChanges() ? handleChangeEmailStart : undefined)}
                style={[styles.methodCard, { borderColor: borderClr }]}
              >
                <View style={styles.methodCardLeft}>
                  <View style={[styles.methodIconWrap, { backgroundColor: colors.thirdBg }]}>
                    <FastImage source={EMAIL} style={styles.methodIconImg} tintColor={colors.white} resizeMode="contain" />
                  </View>
                  <AppText type={THIRTEEN} weight={SEMI_BOLD} style={{ color: textPrimary }}>
                    Email
                  </AppText>
                </View>
                <View style={styles.methodCheckWrap}>
                  <FastImage source={hasEmail ? VERIFY_ICON_SUCCESS : UNLOCK_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
              </TouchableOpacityView>

              {/* Phone */}
              <TouchableOpacityView
                activeOpacity={0.8}
                onPress={!hasMobile ? handleAddMobileStart : (canMakeSensitiveChanges() ? handleChangeMobileStart : undefined)}
                style={[styles.methodCard, { borderColor: borderClr }]}
              >
                <View style={styles.methodCardLeft}>
                  <View style={[styles.methodIconWrap, { backgroundColor: colors.thirdBg }]}>
                    <FastImage source={PHONE} style={styles.methodIconImg} tintColor={colors.white} resizeMode="contain" />
                  </View>
                  <AppText type={THIRTEEN} weight={SEMI_BOLD} style={{ color: textPrimary }}>
                    Phone
                  </AppText>
                </View>
                <View style={styles.methodCheckWrap}>
                  <FastImage source={hasMobile ? VERIFY_ICON_SUCCESS : UNLOCK_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
              </TouchableOpacityView>
            </>
          )}
        </View>

      </ScrollView>
    </AppSafeAreaView>
  );
};

export default TwoFactor;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: universalPaddingTop * 2,
    paddingHorizontal: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
    opacity: 0.9,
  },
  securityLevelBox: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: borderWidth,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  securityBackBtn: { padding: 4, marginRight: 8 },
  securityHeaderTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityHeaderTitle: { textAlign: 'center' },
  securityHeaderRight: { width: 32 },
  sectionTitle: { marginBottom: 6 },
  sectionDesc: { marginBottom: 16, lineHeight: 20 },
  twoFaCardList: { marginBottom: 24 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  methodCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodIconImg: { width: 22, height: 22 },
  securityNoticeIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  securityNoticeIconImg: { width: 36, height: 36 },
  methodLabelWrap: { flex: 1, justifyContent: 'center' },
  methodLabelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  recommendedBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  methodCheckWrap: { marginLeft: 8 },
  chevronDownWrap: { alignItems: 'center', paddingVertical: 6 },
  otherSection: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  otherRowRight: { flexDirection: 'row', alignItems: 'center' },
  otherRowValue: { marginRight: 8 },
  securityLevelText: {
    fontSize: 13,
    lineHeight: 20,
  },
  securityLevelValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  methodsCount: {
    fontSize: 13,
  },
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: borderWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardLeft: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 22, height: 22, marginRight: 10 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  cardRight: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  viewLinkWrap: { marginLeft: 6 },
  viewLink: { fontSize: 14, fontWeight: '600' },
  hintText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  outlineButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    marginTop: 16,
    marginBottom: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: borderWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  tipsList: { marginTop: 10 },
  tipItem: {
    fontSize: 13,
    lineHeight: 22,
    marginTop: 4,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',

  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  modalBodyText: {
    fontSize: 14,
    marginTop: 14,
    lineHeight: 21,
  },
  bold: { fontWeight: '600' },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 2,
  },
  otpContainer: {
    width: '100%',
    height: 52,
    marginTop: 8,
  },
  otpInputWrap: {
    width: '100%',
    marginTop: 8,
    position: 'relative',
  },
  otpBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  otpBox: {
    width: 42,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxDark: {
    borderColor: colors.inputBorder,
  },
  otpBoxHighlight: {
    borderColor: colors.buttonBg,
  },
  otpHiddenInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.001,
    fontSize: 1,
    padding: 0,
  },
  otpInput: {
    width: 42,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    color: colors.black,
    fontSize: 14,
  },
  otpInputDark: {
    width: 42,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    color: colors.white,
    fontSize: 14,
  },
  otpInputHighlight: {
    borderColor: colors.buttonBg,
  },
  resendRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendDisabled: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: 24,
  },
  switchOptionWrap: { marginTop: 18, },
  switchOptionText: { fontSize: 14, fontWeight: '500' },
  sheetBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetBackBtn: { padding: 4, marginRight: 8 },
  methodOptionRow: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  methodOptionLabel: { fontSize: 15, fontWeight: '600' },
  methodOptionDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  methodOptionGroup: { marginBottom: 12 },
  methodRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  methodChip: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 10 },
  methodChipActive: { borderColor: colors.buttonBg },
  methodChipText: { fontSize: 14, fontWeight: '600' },
  passkeyNameInput: { marginTop: 10 },
  countryCodePicker: { marginTop: 8, marginBottom: 4, minHeight: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center' },
  addPasskeyModalScroll: { flex: 1, width: '100%' },
  addPasskeyModalContent: { paddingBottom: 28, flexGrow: 1 },
  passkeyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#00c853',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  passkeyIconCircleIcon: { width: 36, height: 36 },
  passkeyBulletList: { marginBottom: 20 },
  passkeyBulletItem: { fontSize: 13, marginTop: 6, lineHeight: 20 },
  viewPasskeysModalContent: { maxHeight: '80%' },
  passkeyList: { maxHeight: 280, marginTop: 14, flexGrow: 0 },
  passkeyItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  passkeyItemLeft: {},
  passkeyName: { fontSize: 14, fontWeight: '600' },
  passkeyDevice: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  passkeyDate: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  passkeyEmpty: { paddingVertical: 28, alignItems: 'center' },
  passkeyEmptyText: { fontSize: 14 },
  qrCodeContainer: { marginVertical: 12, alignItems: 'center' },
  qrImage: { height: 200, width: 200 },
  qrAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    backgroundColor: colors.inputBackground,
  },
  qrAddressText: { flex: 1, fontSize: 13 },
  qrCopyWrap: { padding: 8, marginLeft: 8 },
  qrCopyIcon: { width: 20, height: 20 },
});
