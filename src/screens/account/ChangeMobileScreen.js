import React, { useState, useEffect, useRef } from 'react';
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
  Input,
  OtpInput6Digit,
} from '../../shared';
import { colors } from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import PickerSelect from '../../shared/components/PickerSelect';
import { back_ic, PHONE, FINGERPRINT, SHARE_NEW_ICON } from '../../helper/ImageAssets';
import { countriesList } from '../../helper/CountriesList';
import {
  sendSecurityOtp,
  initiateMobileChange,
  completeMobileChange,
  verifySecurityPasskey,
  getPasskeyList,
} from '../../actions/accountActions';
import { showError } from '../../helper/logger';
import { VerificationOptionsSheet } from '../../shared/components/VerificationOptionsSheet';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';

const CODE_LENGTH = 6;
const countryCodePickerData = countriesList || [];
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

const ChangeMobileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor === 'otp');
  const theme = useAppSelector((state) => state.auth.theme);
  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const mobileNumber = profileCountryCode && profileMobile ? `${profileCountryCode} ${profileMobile}`.trim() : profileMobile || '';
  const hasEmail = !!emailId;
  const hasMobile = !!profileMobile;
  const hasGoogleAuth = (userData?.['2fa'] ?? 0) === 2;
  const [hasPasskey, setHasPasskey] = useState(!!userData?.hasPasskey);

  const [step, setStep] = useState(0);
  const [verifyMethod, setVerifyMethod] = useState('email');
  const [availableMethods, setAvailableMethods] = useState([]);
  const [passkeyUserId, setPasskeyUserId] = useState(null);
  const [currentCode, setCurrentCode] = useState('');
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+91');
  const [newMobileOtp, setNewMobileOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendTimerNew, setResendTimerNew] = useState(0);
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);

  const optionsSheetRef = useRef(null);
  const isDark = theme === 'Dark';
  const textPrimary = isDark ? colors.white : colors.black;
  const textSecondary = isDark ? '#888' : '#666';
  const borderClr = isDark ? colors.dividerColor : colors.secondBorder;

  // Fetch passkey list to know if user has passkey
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dispatch(getPasskeyList());
      if (!cancelled && res?.data?.passkeys?.length > 0) setHasPasskey(true);
    })();
    return () => { cancelled = true; };
  }, [dispatch]);

  // Web priority: Passkey > Google Auth > Email > Phone (all options like web)
  useEffect(() => {
    const methods = [];
    if (hasPasskey) methods.push({ value: 'passkey', label: 'Passkey', description: 'Use fingerprint or Face ID' });
    if (hasGoogleAuth) methods.push({ value: 'totp', label: 'Google Authenticator', description: 'Use your authenticator app' });
    if (hasEmail) methods.push({ value: 'email', label: 'Email OTP', description: `Send code to ${maskEmail(emailId)}` });
    if (hasMobile) methods.push({ value: 'mobile', label: 'Mobile OTP', description: `Send code to ${maskPhone(mobileNumber)}` });
    setAvailableMethods(methods);
    const def = hasPasskey ? 'passkey' : (hasGoogleAuth ? 'totp' : (hasEmail ? 'email' : 'mobile'));
    setVerifyMethod(def);
  }, [hasEmail, hasMobile, hasGoogleAuth, hasPasskey]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);
  useEffect(() => {
    if (resendTimerNew <= 0) return;
    const t = setTimeout(() => setResendTimerNew((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimerNew]);

  useEffect(() => {
    if (optionsSheetVisible) optionsSheetRef.current?.open();
    else optionsSheetRef.current?.close();
  }, [optionsSheetVisible]);

  const handleProceedFromNotice = () => setStep(1);

  const getVerifyTitle = () => {
    if (verifyMethod === 'passkey') return 'Passkey Verification';
    if (verifyMethod === 'totp') return 'Google Authenticator';
    if (verifyMethod === 'email') return 'Email Verification';
    return 'Mobile Verification';
  };
  const getVerifyDesc = () => {
    if (verifyMethod === 'passkey') return 'Use your fingerprint or Face ID to verify your identity';
    if (verifyMethod === 'totp') return 'Enter the 6-digit code from your authenticator app';
    if (verifyMethod === 'email') return `We'll send a verification code to ${maskEmail(emailId)}`;
    return `We'll send a verification code to ${maskPhone(mobileNumber)}`;
  };

  const getPasskeySignId = () => emailId || mobileNumber || '';

  const handleVerifyPasskey = async () => {
    const signId = getPasskeySignId();
    if (!signId) { showError('Email or mobile required for passkey verification'); return; }
    const userId = await dispatch(verifySecurityPasskey(signId));
    if (userId) setPasskeyUserId(userId);
  };

  const handleSendOtp = async () => {
    if (verifyMethod === 'totp') return;
    const target = verifyMethod === 'email' ? 'email' : 'mobile';
    const ok = await dispatch(sendSecurityOtp(target, 'change_mobile'));
    if (ok) setResendTimer(60);
  };

  const handleStep1Continue = () => {
    if (verifyMethod === 'passkey') {
      if (!passkeyUserId) { showError('Please verify with passkey first'); return; }
      setStep(2);
      return;
    }
    if (!currentCode || currentCode.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit code');
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = async () => {
    if (!newMobileNumber || newMobileNumber.length < 6) {
      showError('Please enter a valid mobile number');
      return;
    }
    const countryCodeStr = typeof newCountryCode === 'string' ? newCountryCode : (newCountryCode?.value ?? '+91');
    const requestData = {
      newMobileNumber: newMobileNumber.replace(/\D/g, ''),
      newCountryCode: countryCodeStr.replace(/\s/g, ''),
    };
    if (verifyMethod === 'passkey') requestData.passkeyUserId = passkeyUserId;
    else if (verifyMethod === 'totp') requestData.tofaCode = currentCode;
    else if (verifyMethod === 'email') requestData.currentEmailOtp = currentCode;
    else if (verifyMethod === 'mobile') requestData.currentMobileOtp = currentCode;
    const success = await dispatch(initiateMobileChange(requestData));
    if (success) setStep(3);
  };

  const handleSendNewMobileOtp = async () => {
    const countryCodeStr = typeof newCountryCode === 'string' ? newCountryCode : (newCountryCode?.value ?? '+91');
    const fullNumber = `${countryCodeStr} ${newMobileNumber}`.trim();
    const ok = await dispatch(sendSecurityOtp('new_mobile', 'change_mobile', fullNumber));
    if (ok) setResendTimerNew(60);
  };

  const handleStep3Complete = async () => {
    if (!newMobileOtp || newMobileOtp.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit OTP');
      return;
    }
    const success = await dispatch(completeMobileChange(newMobileOtp));
    if (success) navigation.goBack();
  };

  const handleOptionsSelect = (value) => {
    setVerifyMethod(value);
    setCurrentCode('');
    setPasskeyUserId(null);
    setResendTimer(0);
    setOptionsSheetVisible(false);
  };

  const countryCodeStr = typeof newCountryCode === 'string' ? newCountryCode : (newCountryCode?.value ?? '+91');

  return (
    <AppSafeAreaView style={{ flex: 1, backgroundColor: colors.newThemeColor }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: borderClr }]}>
          <TouchableOpacity
            onPress={() => (step > 0 ? setStep(step - 1) : navigation.goBack())}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FastImage source={back_ic} style={styles.backIcon} tintColor={textPrimary} resizeMode="contain" />
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: textPrimary }]}>
            {step === 0 ? 'Security Notice' : step === 1 ? getVerifyTitle() : 'Change Mobile Number'}
          </AppText>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <View style={styles.noticeContent}>
              <View style={styles.noticeIconWrap}>
                <FastImage source={PHONE} style={styles.noticeIcon} tintColor={colors.white} resizeMode="contain" />
              </View>
              <AppText style={[styles.title, { color: textPrimary }]}>Security Notice</AppText>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>Please read carefully before proceeding</AppText>
              <AppText style={[styles.bodyText, { color: textPrimary }]}>
                Withdrawals and P2P transactions might be disabled for 24 hours after changing your phone verification to ensure the safety of your assets.
              </AppText>
              <AppText style={[styles.bodyText, { color: textPrimary }]}>
                The old phone number cannot be used to re-register for 30 days after updating it.
              </AppText>
              <Button children="I Understand, Continue" onPress={handleProceedFromNotice} containerStyle={styles.btn} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.formContent}>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>Choose how you want to verify your identity</AppText>
              <AppText style={[styles.bodyText, { color: textPrimary }]}>{getVerifyDesc()}</AppText>
              {verifyMethod === 'passkey' ? (
                <>
                  <View style={{ alignItems: 'center', marginVertical: 24 }}>
                    <FastImage source={FINGERPRINT} style={{ width: 64, height: 64 }} resizeMode="contain" tintColor={colors.buttonBg} />
                  </View>
                  <Button
                    children={passkeyUserId ? 'Verified - Continue' : 'Verify with Passkey'}
                    onPress={passkeyUserId ? handleStep1Continue : handleVerifyPasskey}
                    loading={showButtonLoading}
                    containerStyle={styles.btn}
                  />
                </>
              ) : (
                <>
                  <OtpInput6Digit
                    label={verifyMethod === 'totp' ? 'Authenticator Code' : (verifyMethod === 'email' ? 'Email Verification Code' : 'Mobile Verification Code')}
                    value={currentCode}
                    onChangeText={setCurrentCode}
                    isDark={isDark}
                  />
                  {verifyMethod !== 'totp' && (
                    <View style={styles.resendRow}>
                      {resendTimer > 0 ? (
                        <AppText style={{ color: textSecondary }}>Resend ({resendTimer}s)</AppText>
                      ) : (
                        <TouchableOpacityView onPress={handleSendOtp} disabled={isLoading} style={{alignSelf:"flex-end",}}>
                          <AppText style={{ color: colors.buttonBg, fontWeight: '600' }}>Get OTP</AppText>
                        </TouchableOpacityView>
                      )}
                    </View>
                  )}
                  <Button
                    children="Continue"
                    onPress={handleStep1Continue}
                    loading={showButtonLoading}
                    containerStyle={styles.btn}
                    disabled={isLoading || currentCode.length !== CODE_LENGTH}
                  />
                </>
              )}
              {availableMethods.length > 1 && (
                <TouchableOpacityView onPress={() => setOptionsSheetVisible(true)} style={styles.switchWrap}>
                  <AppText style={{ color: colors.buttonBg, fontWeight: '600' }}>Switch to Another Verification Option</AppText>
                  <FastImage source={SHARE_NEW_ICON} 
                     style={{ width: 14, height: 14,marginLeft: 5 }}
                    resizeMode="contain" tintColor={colors.buttonBg} />
                </TouchableOpacityView>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={styles.formContent}>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>Step 2: Enter new mobile number</AppText>
              <AppText style={[styles.inputLabel, { color: textPrimary }]}>Country Code</AppText>
              <PickerSelect
                data={countryCodePickerData}
                selected={newCountryCode}
                onSelect={(item) => setNewCountryCode(item?.value ?? item ?? '+91')}
                placeholder="Select country code"
                theme={theme}
                style={[styles.picker, { borderColor: borderClr, backgroundColor: colors.themeElevationColor }]}
                flag={true}
              />
              <AppText style={[styles.inputLabel, { color: textPrimary }]}>New Mobile Number</AppText>
              <Input
                value={newMobileNumber}
                onChangeText={(t) => setNewMobileNumber((t || '').replace(/\D/g, ''))}
                placeholder="Enter new mobile number"
                containerStyle={styles.input}
                inputStyle={{ color: textPrimary }}
                keyboardType="phone-pad"
              />
              <Button
                children="Continue"
                onPress={handleStep2Continue}
                loading={showButtonLoading}
                containerStyle={styles.btn}
                disabled={isLoading || !newMobileNumber || newMobileNumber.length < 6}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.formContent}>
              <AppText style={[styles.subtitle, { color: textSecondary }]}>Step 3: Verify new mobile</AppText>
              <AppText style={[styles.bodyText, { color: textPrimary }]}>
                Click "Send OTP" to receive a code on <AppText style={styles.bold}>{countryCodeStr} {newMobileNumber}</AppText>
              </AppText>
              <OtpInput6Digit label="New Mobile Verification Code" value={newMobileOtp} onChangeText={setNewMobileOtp} isDark={isDark} />
              <View style={styles.resendRow}>
                {resendTimerNew > 0 ? (
                  <AppText style={{ color: textSecondary }}>Resend ({resendTimerNew}s)</AppText>
                ) : (
                  <TouchableOpacityView onPress={handleSendNewMobileOtp} disabled={isLoading} style={{alignSelf:"flex-end"}}>
                    <AppText style={{ color: colors.buttonBg, fontWeight: '600' }}>Send OTP</AppText>
                  </TouchableOpacityView>
                )}
              </View>
              <Button
                children="Change Mobile"
                onPress={handleStep3Complete}
                loading={showButtonLoading}
                containerStyle={styles.btn}
                disabled={isLoading || newMobileOtp.length !== CODE_LENGTH}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <VerificationOptionsSheet sheetRef={optionsSheetRef} options={availableMethods} onSelect={handleOptionsSelect} borderClr={borderClr} />
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
  noticeContent: { paddingTop: 24 },
  noticeIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  noticeIcon: { width: 36, height: 36 },
  title: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 14 },
  bodyText: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  bold: { fontWeight: '600' },
  formContent: { paddingTop: 8 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  picker: { marginBottom: 16, borderRadius: 10, borderWidth: 1 },
  input: { marginBottom: 16 },
  btn: { marginTop: 20 },
  resendRow: { marginTop: 14, alignItems: 'flex-end' },
  switchWrap: { marginTop: 18,flexDirection:"row",alignItems:"center",},
});

export default ChangeMobileScreen;
