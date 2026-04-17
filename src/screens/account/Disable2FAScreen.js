import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  AppSafeAreaView,
  AppText,
  Button,
  OtpInput6Digit,
} from '../../shared';
import { colors } from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import { back_ic, EMAIL, PHONE, KEY_ICON } from '../../helper/ImageAssets';
import { disable2fa, sendSecurityOtp } from '../../actions/accountActions';
import { showError } from '../../helper/logger';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';

const CODE_LENGTH = 6;
const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  return `${(username || '').substring(0, 2)}***${(username || '').slice(-1)}@${domain}`;
};
const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s/g, '');
  if (cleaned.length < 4) return phone;
  return '****' + cleaned.slice(-4);
};

const Disable2FAScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor !== 'otp');
  const theme = useAppSelector((state) => state.auth.theme);
  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const mobileNumber = profileCountryCode && profileMobile ? `${profileCountryCode} ${profileMobile}`.trim() : profileMobile || '';
  const hasEmail = !!emailId;
  const hasMobile = !!profileMobile;

  const [authMethod, setAuthMethod] = useState(null); // 1=email, 2=totp, 3=mobile
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const isDark = theme === 'Dark';
  const textPrimary = isDark ? colors.white : colors.black;
  const textSecondary = isDark ? '#888' : '#666';
  const borderClr = isDark ? colors.dividerColor : colors.secondBorder;

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const getTitle = () => {
    if (authMethod === 2) return 'Enter Google Authenticator Code';
    if (authMethod === 1) return 'Enter Email Verification Code';
    if (authMethod === 3) return 'Enter Mobile Verification Code';
    return 'Disable Google Authenticator';
  };
  const getDesc = () => {
    if (authMethod === 2) return 'Enter the 6-digit code from your authenticator app';
    if (authMethod === 1) return `We'll send a verification code to ${maskEmail(emailId)}`;
    if (authMethod === 3) return `We'll send a verification code to ${maskPhone(mobileNumber)}`;
    return 'Choose how you want to verify your identity';
  };

  const handleSendOtp = async () => {
    if (authMethod !== 1 && authMethod !== 3) return;
    const target = authMethod === 1 ? 'email' : 'mobile';
    const ok = await dispatch(sendSecurityOtp(target, '2fa_disable'));
    if (ok) setResendTimer(60);
  };

  const handleDisable = async () => {
    if (!code || code.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit code');
      return;
    }
    if (authMethod === 2) {
      const success = await dispatch(disable2fa(code));
      if (success) navigation.goBack();
    } else if (authMethod === 1 || authMethod === 3) {
      const verifyMethod = authMethod === 1 ? 'email' : 'mobile';
      const success = await dispatch(disable2fa(null, code, verifyMethod));
      if (success) navigation.goBack();
    }
  };

  return (
    <AppSafeAreaView style={{ flex: 1, backgroundColor: colors.newThemeColor }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: borderClr }]}>
          <TouchableOpacity
            onPress={() => (authMethod ? setAuthMethod(null) : navigation.goBack())}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FastImage source={back_ic} style={styles.backIcon} tintColor={textPrimary} resizeMode="contain" />
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: textPrimary }]}>{getTitle()}</AppText>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!authMethod ? (
            <View style={styles.formContent}>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>{getDesc()}</AppText>
              {hasEmail && (
                <TouchableOpacityView
                  onPress={() => { setAuthMethod(1); setCode(''); setResendTimer(0); }}
                  style={[styles.methodRow, { borderColor: borderClr }]}
                >
                  <FastImage source={EMAIL} style={styles.methodIcon} tintColor={colors.white} resizeMode="contain" />
                  <View style={styles.methodTextWrap}>
                    <AppText style={[styles.methodLabel, { color: textPrimary }]}>Email Verification</AppText>
                    <AppText style={[styles.methodDesc, { color: textSecondary }]}>{`Send code to ${maskEmail(emailId)}`}</AppText>
                  </View>
                </TouchableOpacityView>
              )}
              {hasMobile && (
                <TouchableOpacityView
                  onPress={() => { setAuthMethod(3); setCode(''); setResendTimer(0); }}
                  style={[styles.methodRow, { borderColor: borderClr }]}
                >
                  <FastImage source={PHONE} style={styles.methodIcon} tintColor={colors.white} resizeMode="contain" />
                  <View style={styles.methodTextWrap}>
                    <AppText style={[styles.methodLabel, { color: textPrimary }]}>Mobile Verification</AppText>
                    <AppText style={[styles.methodDesc, { color: textSecondary }]}>{`Send code to ${maskPhone(mobileNumber)}`}</AppText>
                  </View>
                </TouchableOpacityView>
              )}
              <TouchableOpacityView
                onPress={() => { setAuthMethod(2); setCode(''); }}
                style={[styles.methodRow, { borderColor: borderClr }]}
              >
                <FastImage source={KEY_ICON} style={styles.methodIcon} tintColor={colors.white} resizeMode="contain" />
                <View style={styles.methodTextWrap}>
                  <AppText style={[styles.methodLabel, { color: textPrimary }]}>Google Authenticator</AppText>
                  <AppText style={[styles.methodDesc, { color: textSecondary }]}>Use your authenticator app</AppText>
                </View>
              </TouchableOpacityView>
            </View>
          ) : (
            <View style={styles.formContent}>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>{getDesc()}</AppText>
              {(authMethod === 1 || authMethod === 3) && (
                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <AppText style={{ color: textSecondary }}>Resend ({resendTimer}s)</AppText>
                  ) : (
                    <TouchableOpacityView onPress={handleSendOtp} disabled={isLoading}>
                      <AppText style={{ color: colors.buttonBg, fontWeight: '600' }}>Send OTP</AppText>
                    </TouchableOpacityView>
                  )}
                </View>
              )}
              <OtpInput6Digit
                label={authMethod === 2 ? 'Authenticator Code' : 'Verification Code'}
                value={code}
                onChangeText={setCode}
                isDark={isDark}
              />
              <Button
                children="Disable"
                onPress={handleDisable}
                loading={showButtonLoading}
                containerStyle={styles.btn}
                disabled={isLoading || code.length !== CODE_LENGTH}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  backIcon: { width: 24, height: 24 },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formContent: { paddingTop: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: { width: 20, height: 20 },
  methodTextWrap: { marginLeft: 12 },
  methodLabel: { fontSize: 15, fontWeight: '600' },
  methodDesc: { fontSize: 13, marginTop: 2 },
  resendRow: { marginBottom: 14, alignItems: 'center' },
  btn: { marginTop: 24 },
});

export default Disable2FAScreen;
