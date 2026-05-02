import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  AppSafeAreaView,
  AppText,
  Button,
  Input,
  Toolbar,
  SEMI_BOLD,
  FOURTEEN,
  TEN,
  TWELVE,
} from '../../shared';
import { useTheme } from '../../hooks/useTheme';
import FastImage from 'react-native-fast-image';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import { SHARE_NEW_ICON } from '../../helper/ImageAssets';
import {
  sendSecurityOtp,
  changePassword,
} from '../../actions/accountActions';
import { showError } from '../../helper/logger';
import { VerificationOptionsSheet } from '../../shared/components/VerificationOptionsSheet';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';

const maskEmail = (email: string) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  return `${(username || '').substring(0, 3)}***${(username || '').slice(-10)}@${domain}`;
};

const maskPhone = (phone: string | number) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s/g, '');
  if (cleaned.length < 4) return phone;
  return '****' + cleaned.slice(-4);
};

type VerifyMethodOption = { value: string; label: string; description: string };

const ChangePassword = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state: any) => state.auth.userData);
  const isLoading = useAppSelector((state: any) => state.auth.isLoading);
  const { colors: themeColors } = useTheme();

  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const mobileNumber = profileCountryCode && profileMobile ? `${profileCountryCode} ${profileMobile}`.trim() : profileMobile || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyMethod, setVerifyMethod] = useState('');
  const [availableMethods, setAvailableMethods] = useState<VerifyMethodOption[]>([]);
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
  const optionsSheetRef = useRef<any>(null);

  // Available methods setup
  useEffect(() => {
    const methods: VerifyMethodOption[] = [];
    if (userData?.hasPasskey) methods.push({ value: 'passkey', label: 'Passkey', description: 'Use fingerprint or Face ID' });
    if ((userData?.['2fa'] ?? 0) === 2) methods.push({ value: 'totp', label: 'Google Authenticator', description: 'Use your authenticator app' });
    if (emailId) methods.push({ value: 'email', label: 'Email OTP', description: `Send code to ${maskEmail(emailId)}` });
    if (profileMobile) methods.push({ value: 'mobile', label: 'Mobile OTP', description: `Send code to ${maskPhone(mobileNumber)}` });
    setAvailableMethods(methods);

    if (!verifyMethod && methods.length > 0) {
      // Priority: Passkey > TOTP > Email > Mobile
      if (userData?.hasPasskey) setVerifyMethod('passkey');
      else if ((userData?.['2fa'] ?? 0) === 2) setVerifyMethod('totp');
      else if (emailId) setVerifyMethod('email');
      else if (profileMobile) setVerifyMethod('mobile');
    }
  }, [userData, emailId, profileMobile, mobileNumber]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    const target = verifyMethod === 'email' ? 'email' : 'mobile';
    const ok = await dispatch(sendSecurityOtp(target, 'forgot_password')); // Using forgot_password as per web logic
    if (ok) setResendTimer(60);
  };

  const getRequirementStatus = (password: string) => {
    if (!password) return { length: false, complex: false, spaces: false };
    return {
      length: password.length >= 8 && password.length <= 30,
      complex: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password),
      spaces: !/\s/.test(password),
    };
  };

  const requirements = getRequirementStatus(newPassword);

  const handleSubmit = async () => {
    if (verifyMethod !== 'totp' && verifyMethod !== 'passkey' && !otp) {
      showError('Please enter verification code');
      return;
    }
    if (!requirements.length || !requirements.complex || !requirements.spaces) {
      showError('Please meet all password requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    const verifyMethodId = verifyMethod === 'email' ? 1 : (verifyMethod === 'totp' ? 2 : 3);

    const payload = {
      email_or_phone: verifyMethod === 'email' ? emailId : mobileNumber,
      new_password: newPassword,
      confirm_password: confirmPassword,
      verification_code: otp,
      verify_method: verifyMethodId,
    };

    const success = await dispatch(changePassword(payload));
    if (success) {
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResendTimer(0);
    }
  };

  const handleOptionsSelect = (value: string) => {
    setVerifyMethod(value);
    setOtp('');
    setResendTimer(0);
    setOptionsSheetVisible(false);
  };

  const getVerifyTitle = () => {
    if (verifyMethod === 'totp') return 'Enter Google Authenticator Code';
    if (verifyMethod === 'email') return 'Enter Email Verification Code';
    if (verifyMethod === 'mobile') return 'Enter Mobile Verification Code';
    return 'Security Verification';
  };

  const getVerifyDesc = () => {
    if (verifyMethod === 'totp') return 'Enter the 6-digit code from your authenticator app';
    if (verifyMethod === 'email') return `We'll send a verification code to ${maskEmail(emailId)}`;
    if (verifyMethod === 'mobile') return `We'll send a verification code to ${maskPhone(mobileNumber)}`;
    return '';
  };

  return (
    <AppSafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Toolbar
          isSecond
          title="Change Password"
          style={{ width: '100%' }}
          isCommit={false}
          isStake={false}
          isLogin={false}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppText weight={SEMI_BOLD} type={FOURTEEN} style={[styles.sectionTitle, { color: themeColors.text }]}>
            {getVerifyTitle()}
          </AppText>
          <AppText type={TEN} style={[styles.sectionDesc, { color: themeColors.secondaryText }]}>
            {getVerifyDesc()}
          </AppText>

          {verifyMethod !== 'passkey' && (
            <Input
              title="Enter 6-digit Code"
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter code here..."
              keyboardType="number-pad"
              maxLength={6}
              isOtp={true}
              otpText={resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Get OTP'}
              onSendOtp={handleSendOtp}
              mainContainer={{ marginTop: 10 }}
            />
          )}

          {availableMethods.length > 1 && (
            <TouchableOpacityView onPress={() => {
              optionsSheetRef.current?.open();
            }} style={styles.switchWrap}>
              <AppText type={TWELVE} style={{ fontWeight: '500', color: themeColors.button }}>Switch to Another Verification Option</AppText>
              <FastImage source={SHARE_NEW_ICON}
                style={{ width: 14, height: 14, marginLeft: 5 }}
                resizeMode="contain" tintColor={themeColors.button} />
            </TouchableOpacityView>
          )}

          <Input
            title="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={!showNewPassword}
            isSecure={true}
            onFocus={() => { }}
            onPressVisible={() => setShowNewPassword(!showNewPassword)}
            mainContainer={{ marginTop: 10 }}
          />

          <View style={styles.requirementsBox}>
            <View style={styles.reqRow}>
              <View style={[styles.dot, { backgroundColor: requirements.length ? themeColors.green : themeColors.red }]} />
              <AppText type={TEN} style={{ color: requirements.length ? themeColors.green : themeColors.red }}>8-30 characters</AppText>
            </View>
            <View style={styles.reqRow}>
              <View style={[styles.dot, { backgroundColor: requirements.complex ? themeColors.green : themeColors.red }]} />
              <AppText type={TEN} style={{ color: requirements.complex ? themeColors.green : themeColors.red }}>At least one uppercase, lowercase, and number.</AppText>
            </View>
            <View style={styles.reqRow}>
              <View style={[styles.dot, { backgroundColor: requirements.spaces ? themeColors.green : themeColors.red }]} />
              <AppText type={TEN} style={{ color: requirements.spaces ? themeColors.green : themeColors.red }}>Does not contain any spaces.</AppText>
            </View>
          </View>

          <Input
            title="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            isSecure={true}
            onPressVisible={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <Button
            children="Submit"
            onPress={handleSubmit}
            loading={isLoading}
            containerStyle={styles.submitBtn}
            disabled={!otp && verifyMethod !== 'totp' && verifyMethod !== 'passkey'}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <VerificationOptionsSheet
        sheetRef={optionsSheetRef}
        options={availableMethods as any}
        onSelect={handleOptionsSelect}
      />
      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, marginBottom: 5 },
  sectionDesc: { marginBottom: 20, opacity: 0.8 },
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 5,
  },
  requirementsBox: {
    marginBottom: 12,
    marginTop: -8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 30,
    height: 55,
  },
});

export default ChangePassword;
