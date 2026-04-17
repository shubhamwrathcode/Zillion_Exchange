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
  Input,
  OtpInput6Digit,
} from '../../shared';
import { colors } from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import { back_ic, PHONE_VERIFY } from '../../helper/ImageAssets';
import {
  sendSecurityOtp,
  verifySecurityOtp,
  verifySecurityTotp,
  addMobileToAccount,
  getUserProfile,
} from '../../actions/accountActions';
import { showSuccess, showError } from '../../helper/logger';
import PickerSelect from '../../shared/components/PickerSelect';
import { countriesList } from '../../helper/CountriesList';
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

const AddPhoneNumberScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor === 'otp');
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === 'Dark';

  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const mobileNumber = profileCountryCode && profileMobile ? `${profileCountryCode} ${profileMobile}`.trim() : profileMobile || '';
  const hasEmail = !!emailId;
  const hasMobile = !!profileMobile;
  const hasGoogleAuth = (userData?.['2fa'] ?? 0) === 2;

  const [step, setStep] = useState(0);
  const [verifyMethod, setVerifyMethod] = useState('email');
  const [googleCode, setGoogleCode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [newCountryCode, setNewCountryCode] = useState(profileCountryCode || '+91');
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [newMobileOtp, setNewMobileOtp] = useState('');
  const [resendTimerAddMobile, setResendTimerAddMobile] = useState(0);
  const [resendTimerNewMobile, setResendTimerNewMobile] = useState(0);

  const borderClr = isDark ? colors.inputBorder : '#DDDDDD';
  const textPrimary = isDark ? colors.white : '#222';
  const textSecondary = isDark ? colors.descText : '#666';

  useEffect(() => {
    if (resendTimerAddMobile <= 0) return;
    const t = setTimeout(() => setResendTimerAddMobile((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimerAddMobile]);
  useEffect(() => {
    if (resendTimerNewMobile <= 0) return;
    const t = setTimeout(() => setResendTimerNewMobile((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimerNewMobile]);

  const firstStep = hasGoogleAuth ? 1 : 2;

  const handleVerifyIdentity = async () => {
    if (step === 1 && hasGoogleAuth) {
      if (!googleCode || googleCode.length !== CODE_LENGTH) {
        showError('Please enter a valid 6-digit code');
        return;
      }
      const verified = await dispatch(verifySecurityTotp(googleCode, 'add_mobile'));
      if (verified) setStep(2);
    } else if (step === 2) {
      if (!emailOtp || emailOtp.length !== CODE_LENGTH) {
        showError('Please enter a valid 6-digit OTP');
        return;
      }
      const verified = await dispatch(verifySecurityOtp(verifyMethod, emailOtp, 'add_mobile'));
      if (verified) {
        showSuccess('Verified!');
        setStep(3);
      }
    }
  };

  const handleSendOtpIdentity = async () => {
    const ok = await dispatch(sendSecurityOtp(verifyMethod, 'add_mobile'));
    if (ok) setResendTimerAddMobile(60);
  };

  const handleNextToOtp = () => {
    if (!newMobileNumber || newMobileNumber.length < 6) {
      showError('Please enter a valid mobile number');
      return;
    }
    setStep(4);
  };

  const handleSendOtpNewMobile = async () => {
    const countryCodeStr = typeof newCountryCode === 'string' ? newCountryCode : (newCountryCode?.value ?? '+91');
    const fullNumber = `${countryCodeStr} ${newMobileNumber}`.trim();
    const ok = await dispatch(sendSecurityOtp('new_mobile', 'add_mobile', fullNumber));
    if (ok) setResendTimerNewMobile(60);
  };

  const handleComplete = async () => {
    if (!newMobileOtp || newMobileOtp.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit OTP');
      return;
    }
    const countryCodeStr = typeof newCountryCode === 'string' ? newCountryCode : (newCountryCode?.value ?? '+91');
    const mobileNumberDigits = String(newMobileNumber ?? '').replace(/\D/g, '').trim();
    if (!mobileNumberDigits || mobileNumberDigits.length < 6) {
      showError('Please enter a valid mobile number');
      return;
    }
    const success = await dispatch(addMobileToAccount(mobileNumberDigits, countryCodeStr.trim(), newMobileOtp));
    if (success) {
      await dispatch(getUserProfile());
      navigation.goBack();
    }
  };

  return (
    <AppSafeAreaView style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step === 0) navigation.goBack();
              else if (step > firstStep) setStep(step - 1);
              else setStep(0); // step === firstStep: go back to intro (step 0), don't exit screen
            }}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FastImage source={back_ic} style={styles.backIcon} tintColor={colors.white} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={step === 0 ? styles.scrollContentStep0 : styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, step === 0 && styles.contentStep0]}>
            {step === 0 && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>Phone Number Verification</AppText>
                <View style={styles.imageWrap}>
                  <FastImage source={PHONE_VERIFY} style={styles.phoneVerifyImage} resizeMode="contain" />
                </View>
                <AppText style={[styles.desc, { color: textSecondary }]}>
                  Phone number verification adds another layer of security to your withdrawals and account.
                </AppText>
              </>
            )}

            {step === 1 && hasGoogleAuth && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>Add Mobile Number</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>Step 1: Verify Google Authenticator</AppText>
                <OtpInput6Digit label="Google Authenticator Code" value={googleCode} onChangeText={setGoogleCode} isDark={isDark} />
                <Button
                  children="Continue"
                  onPress={handleVerifyIdentity}
                  loading={showButtonLoading}
                  containerStyle={styles.btn}
                  disabled={isLoading || googleCode.length !== CODE_LENGTH}
                />
              </>
            )}

            {step === 2 && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>Add Mobile Number</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>
                  {hasEmail && hasMobile ? 'Step 2: Verify your email or mobile' : hasEmail ? 'Step 2: Verify your email' : 'Step 2: Verify your mobile'}
                </AppText>
                {hasEmail && hasMobile && (
                  <View style={styles.methodGroup}>
                    <AppText style={[styles.inputLabel, { color: textPrimary }]}>Verify using</AppText>
                    <View style={styles.methodRow}>
                      <TouchableOpacity
                        onPress={() => { setVerifyMethod('email'); setEmailOtp(''); setResendTimerAddMobile(0); }}
                        style={[styles.methodChip, verifyMethod === 'email' && styles.methodChipActive, { borderColor: borderClr }]}
                      >
                        <AppText style={{ color: verifyMethod === 'email' ? colors.buttonBg : textPrimary }}>Email</AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => { setVerifyMethod('mobile'); setEmailOtp(''); setResendTimerAddMobile(0); }}
                        style={[styles.methodChip, verifyMethod === 'mobile' && styles.methodChipActive, { borderColor: borderClr }]}
                      >
                        <AppText style={{ color: verifyMethod === 'mobile' ? colors.buttonBg : textPrimary }}>Mobile</AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                <AppText style={[styles.bodyText, { color: textPrimary }]}>
                  Click "Send OTP" to receive a code on <AppText style={styles.bold}>{verifyMethod === 'email' ? maskEmail(emailId) : maskPhone(mobileNumber)}</AppText>
                </AppText>
                <OtpInput6Digit
                  label={verifyMethod === 'email' ? 'Email Verification Code' : 'Mobile Verification Code'}
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                  isDark={isDark}
                />
                <View style={styles.resendRow}>
                  {resendTimerAddMobile > 0 ? (
                    <AppText style={{ color: textSecondary }}>Resend ({resendTimerAddMobile}s)</AppText>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtpIdentity} disabled={isLoading}>
                      <AppText style={{
                        color: colors.buttonBg,
                        fontSize: 14,
                        fontWeight: '600',
                      }}>Send OTP</AppText>
                    </TouchableOpacity>
                  )}
                </View>
                <Button
                  children="Continue"
                  onPress={handleVerifyIdentity}
                  loading={showButtonLoading}
                  containerStyle={styles.btn}
                  disabled={isLoading || emailOtp.length !== CODE_LENGTH}
                />
              </>
            )}

            {step === 3 && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>Add Mobile Number</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>Step 3: Enter your mobile number</AppText>
                <AppText style={[styles.inputLabel, { color: textPrimary }]}>Country Code</AppText>
                <PickerSelect
                  data={countryCodePickerData}
                  selected={newCountryCode}
                  onSelect={(item) => setNewCountryCode(item?.value ?? item ?? '+91')}
                  placeholder="Select country code"
                  theme={theme}
                  style={[styles.picker, { borderColor: borderClr, backgroundColor: isDark ? colors.white_fifteen : '#F5F5F5' }]}
                  flag={true}
                />
                <AppText style={[styles.inputLabel, { color: textPrimary }]}>Mobile Number</AppText>
                <Input
                  value={newMobileNumber}
                  onChangeText={(t) => setNewMobileNumber((t || '').replace(/\D/g, ''))}
                  placeholder="Enter mobile number"
                  containerStyle={styles.inputWrap}
                  inputStyle={{ color: textPrimary }}
                  keyboardType="phone-pad"
                />
                <Button
                  children="Continue"
                  onPress={handleNextToOtp}
                  containerStyle={styles.btn}
                  disabled={!newMobileNumber || newMobileNumber.length < 6}
                />
              </>
            )}

            {step === 4 && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>Add Mobile Number</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>Step 4: Verify your mobile number</AppText>
                <AppText style={[styles.bodyText, { color: textPrimary }]}>
                  Click "Send OTP" to receive a code on <AppText style={styles.bold}>{newCountryCode} {newMobileNumber}</AppText>
                </AppText>
                <OtpInput6Digit
                  label="Mobile Verification Code"
                  value={newMobileOtp}
                  onChangeText={setNewMobileOtp}
                  isDark={isDark}
                />
                <View style={styles.resendRow}>
                  {resendTimerNewMobile > 0 ? (
                    <AppText style={{ color: textSecondary }}>Resend ({resendTimerNewMobile}s)</AppText>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtpNewMobile} disabled={isLoading}>
                      <AppText style={{
                        color: colors.buttonBg,
                        fontSize: 14,
                        fontWeight: '600',

                      }}>Send OTP</AppText>
                    </TouchableOpacity>
                  )}
                </View>
                <Button
                  children="Add Mobile Number"
                  onPress={handleComplete}
                  loading={showButtonLoading}
                  containerStyle={styles.btn}
                  disabled={isLoading || newMobileOtp.length !== CODE_LENGTH}
                />
              </>
            )}
          </View>
        </ScrollView>
        {step === 0 && (
          <View style={styles.bottomBtnWrap}>
            <Button
              children="Add Phone Number"
              onPress={() => setStep(firstStep)}
              containerStyle={styles.bottomBtn}
            />
          </View>
        )}
      </KeyboardAvoidingView>
      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { width: 20, height: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  scrollContentStep0: { padding: 20, paddingTop: 12 },
  bottomBtnWrap: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: colors.newThemeColor,
  },
  bottomBtn: {},
  content: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginHorizontal: 2
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneVerifyImage: { width: 120, height: 120 },
  desc: {
    fontSize: 13,
    lineHeight: 21,
    marginHorizontal: 2
  },
  btn: { marginTop: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 2,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  inputWrap: { marginTop: 8 },
  bodyText: { fontSize: 14, marginTop: 14, lineHeight: 21 },
  bold: { fontWeight: '600' },
  methodGroup: { marginTop: 8 },
  methodRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  methodChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  methodChipActive: { borderColor: colors.buttonBg },
  resendRow: { marginTop: 12, alignItems: 'flex-end' },
});

export default AddPhoneNumberScreen;
