import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
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
import { back_ic, FINGERPRINT, PASSKEY_VERIFY, SHARE_NEW_ICON, EMAIL, PHONE, KEY_ICON } from '../../helper/ImageAssets';
import {
  sendSecurityOtp,
  verifySecurityOtp,
  verifySecurityTotp,
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  getPasskeyList,
} from '../../actions/accountActions';
import { showSuccess, showError } from '../../helper/logger';
import { Passkey } from 'react-native-passkey';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL, PASSKEY_RP_ID } from '../../helper/Constants';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';

const CODE_LENGTH = 6;

const trunc = (s, max = 40) => (s == null ? '' : String(s).length <= max ? String(s) : String(s).slice(0, max) + '...');

const getRpIdFromBaseUrl = () => {
  try {
    const u = BASE_URL?.trim?.();
    if (!u) return null;
    const url = u.startsWith('http') ? u : `https://${u}`;
    const host = new URL(url).hostname;
    return host || null;
  } catch {
    return null;
  }
};

const getEffectiveRpIdOverride = () => {
  const fromConstant = typeof PASSKEY_RP_ID === 'string' && PASSKEY_RP_ID.trim().length > 0 ? PASSKEY_RP_ID.trim() : null;
  if (fromConstant) return fromConstant;
  return getRpIdFromBaseUrl();
};

const toBase64URL = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Convert id/rawId/attestationObject/clientDataJSON to base64url for API (match web format) */
const toBase64URLForCredential = (val) => {
  if (val == null) return val;
  if (typeof val === 'string') return toBase64URL(val);
  if (val instanceof ArrayBuffer) return bytesToBase64URL(new Uint8Array(val));
  if (val instanceof Uint8Array) return bytesToBase64URL(val);
  if (Array.isArray(val) && val.length > 0) return bytesToBase64URL(new Uint8Array(val));
  return val;
};

const base64ToBytes = (str) => {
  if (!str || typeof str !== 'string') return null;
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
};

const bytesToBase64URL = (bytes) => {
  if (!bytes || !bytes.length) return '';
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const hexToBytes = (str) => {
  if (!str || typeof str !== 'string' || str.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(str)) return null;
  const bytes = new Uint8Array(str.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(str.substring(i * 2, i * 2 + 2), 16);
  return bytes;
};

const normalizeUserId = (id) => {
  if (id == null) return '';
  if (Array.isArray(id) && id.length > 0 && id.length <= 64) return bytesToBase64URL(new Uint8Array(id));
  const str = typeof id === 'string' ? id.trim() : String(id);
  if (!str) return '';
  let bytes = base64ToBytes(str);
  if (!bytes) bytes = hexToBytes(str);
  if (!bytes || bytes.length === 0 || bytes.length > 64) return toBase64URL(str);
  return bytesToBase64URL(bytes);
};

const normalizePasskeyOptions = (options) => {
  if (!options || !options.user) return options;
  const normalized = { ...options };
  if (normalized.challenge && typeof normalized.challenge === 'string') {
    const challengeBytes = base64ToBytes(normalized.challenge);
    normalized.challenge = challengeBytes ? bytesToBase64URL(challengeBytes) : toBase64URL(normalized.challenge);
  }
  const rawId = normalized.user.id;
  const idStr = normalizeUserId(rawId);
  normalized.user = {
    ...normalized.user,
    id: idStr || bytesToBase64URL(new Uint8Array([0])),
    name: normalized.user.name ?? normalized.user.displayName ?? '',
    displayName: normalized.user.displayName ?? normalized.user.name ?? '',
  };
  const effectiveRpId = getEffectiveRpIdOverride();
  const backendRpId = normalized.rp?.id != null ? String(normalized.rp.id).trim() : '';
  const isLocalhostOrIp = backendRpId.toLowerCase() === 'localhost' || backendRpId === getRpIdFromBaseUrl();
  if (effectiveRpId && (isLocalhostOrIp || backendRpId !== effectiveRpId)) {
    normalized.rp = { ...normalized.rp, id: effectiveRpId };
  }
  return normalized;
};

const buildPasskeyCreateRequest = (options) => {
  if (!options?.user) return options;
  return {
    challenge: options.challenge,
    rp: options.rp,
    user: options.user,
    pubKeyCredParams: options.pubKeyCredParams,
    timeout: options.timeout,
    excludeCredentials: options.excludeCredentials,
    authenticatorSelection: options.authenticatorSelection,
    attestation: options.attestation,
    extensions: options.extensions,
  };
};

/**
 * Normalize credential to match web's @simplewebauthn/browser startRegistration output.
 * Web sends credential as-is; backend expects that format.
 */
const normalizeCredentialForVerify = (credential) => {
  if (!credential) return credential;
  const resp = credential.response || {};
  // Match web/SimpleWebAuthn RegistrationResponseJSON: id, rawId, response.attestationObject, response.clientDataJSON
  const normalized = {
    id: toBase64URLForCredential(credential.id),
    rawId: toBase64URLForCredential(credential.rawId),
    type: credential.type || 'public-key',
    response: {
      attestationObject: toBase64URLForCredential(resp.attestationObject),
      clientDataJSON: toBase64URLForCredential(resp.clientDataJSON),
      ...(resp.transports && { transports: resp.transports }),
      ...(resp.publicKey && { publicKey: toBase64URLForCredential(resp.publicKey) }),
      ...(resp.authenticatorData && { authenticatorData: toBase64URLForCredential(resp.authenticatorData) }),
    },
    clientExtensionResults: credential.clientExtensionResults ?? credential.extensions?.clientExtensionResults ?? {},
  };
  if (credential.authenticatorAttachment) {
    normalized.authenticatorAttachment = credential.authenticatorAttachment;
  }
  return normalized;
};

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

const getMethodIcon = (id) => {
  switch (id) {
    case 'email': return EMAIL;
    case 'mobile': return PHONE;
    case 'totp': return KEY_ICON;
    default: return EMAIL;
  }
};

const AddPasskeyScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor === 'otp');
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === 'Dark';

  const emailId = userData?.emailId ?? userData?.email_id ?? '';
  const profileMobile = userData?.mobileNumber ?? userData?.mobile_number ?? '';
  const profileCountryCode = userData?.country_code ?? userData?.countryCode ?? '';
  const mobileNumber = profileCountryCode && profileMobile ? `${profileCountryCode} ${profileMobile}`.trim() : profileMobile || '';
  const hasEmail = !!emailId;
  const hasMobile = !!profileMobile;
  const hasGoogleAuth = (userData?.['2fa'] ?? 0) === 2;

  const [passkeySupported, setPasskeySupported] = useState(false);
  const [step, setStep] = useState(0);
  const [verifyMethod, setVerifyMethod] = useState('email');
  const [availableMethods, setAvailableMethods] = useState([]);
  const [otpCode, setOtpCode] = useState('');
  const [passkeyName, setPasskeyName] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const verifyOptionsSheetRef = useRef(null);

  const borderClr = isDark ? colors.inputBorder : '#DDDDDD';
  const textPrimary = isDark ? colors.white : '#222';
  const textSecondary = isDark ? colors.descText : '#666';

  useEffect(() => {
    try {
      setPasskeySupported(!!Passkey.isSupported());
    } catch {
      setPasskeySupported(false);
    }
  }, []);

  // Web priority: Google Auth > Email > Phone (all options like web)
  useEffect(() => {
    const methods = [];
    if (hasGoogleAuth) methods.push({ id: 'totp', label: 'Google Authenticator', description: 'Use your authenticator app' });
    if (hasEmail) methods.push({ id: 'email', label: 'Email OTP', description: `Send code to ${maskEmail(emailId)}` });
    if (hasMobile) methods.push({ id: 'mobile', label: 'Mobile OTP', description: `Send code to ${maskPhone(mobileNumber)}` });
    setAvailableMethods(methods);
    if (hasGoogleAuth) setVerifyMethod('totp');
    else if (hasEmail) setVerifyMethod('email');
    else if (hasMobile) setVerifyMethod('mobile');
  }, [hasEmail, hasMobile, hasGoogleAuth]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const getVerificationTitle = () => {
    if (verifyMethod === 'email') return 'Email Verification';
    if (verifyMethod === 'mobile') return 'Mobile Verification';
    if (verifyMethod === 'totp') return 'Google Authenticator';
    return 'Verification';
  };

  const getVerificationDescription = () => {
    if (verifyMethod === 'email') return `Enter the 6-digit code sent to ${maskEmail(emailId)}`;
    if (verifyMethod === 'mobile') return `Enter the 6-digit code sent to ${maskPhone(mobileNumber)}`;
    if (verifyMethod === 'totp') return 'Enter the 6-digit code from your authenticator app';
    return 'Enter your verification code';
  };

  const handleSendOtp = async () => {
    if (verifyMethod === 'totp') return;
    const target = verifyMethod === 'email' ? 'email' : 'mobile';
    const ok = await dispatch(sendSecurityOtp(target, 'add_passkey'));
    if (ok) setResendTimer(60);
  };

  const handleVerify = async () => {
    if (!otpCode || otpCode.length !== CODE_LENGTH) {
      showError(verifyMethod === 'totp' ? 'Please enter a valid 6-digit code' : 'Please enter a valid 6-digit OTP');
      return;
    }
    if (verifyMethod === 'totp') {
      const verified = await dispatch(verifySecurityTotp(otpCode, 'add_passkey'));
      if (verified) {
        showSuccess('Verified!');
        setOtpCode('');
        setStep(2);
      }
    } else {
      const target = verifyMethod === 'email' ? 'email' : 'mobile';
      const verified = await dispatch(verifySecurityOtp(target, otpCode, 'add_passkey'));
      if (verified) {
        showSuccess('Verified!');
        setOtpCode('');
        setStep(2);
      }
    }
  };

  const handleRegisterPasskey = async () => {
    const effectiveName = (passkeyName || defaultName).trim();
    if (!effectiveName) {
      showError('Please enter a name for your passkey');
      return;
    }
    console.log('[Passkey] handleRegisterPasskey started, name:', effectiveName);
    try {
      let options = await dispatch(getPasskeyRegistrationOptions());
      console.log('[Passkey] getPasskeyRegistrationOptions response:', JSON.stringify(options, null, 2));
      if (!options?.user) {
        console.log('[Passkey] No user in options, invalid response');
        showError('Invalid registration options from server. Please try again.');
        return;
      }
      options = normalizePasskeyOptions(options);
      const request = buildPasskeyCreateRequest(options);
      console.log('[Passkey] Normalized request rp.id:', request?.rp?.id);
      let credential = null;
      try {
        credential = await Passkey.create(request);
        console.log('[Passkey] Passkey.create success, credential keys:', credential ? Object.keys(credential) : null);
      } catch (createErr) {
        console.log('[Passkey] Passkey.create error:', createErr?.name, createErr?.message, createErr?.error, createErr);
        const createMsg = String(createErr?.message ?? createErr?.error ?? '').toLowerCase();
        if (createMsg.includes('no create options') && Platform.OS === 'android') {
          console.log('[Passkey] Trying createPlatformKey fallback...');
          credential = await Passkey.createPlatformKey(request);
          console.log('[Passkey] createPlatformKey success:', !!credential);
        } else {
          throw createErr;
        }
      }
      if (!credential) {
        console.log('[Passkey] No credential after create');
        showError('Passkey creation was cancelled');
        return;
      }
      const nameToUse = effectiveName;
      const credentialForVerify = normalizeCredentialForVerify(credential);
      console.log('[Passkey] Calling verifyPasskeyRegistration with name:', nameToUse);
      const success = await dispatch(verifyPasskeyRegistration(credentialForVerify, nameToUse));
      console.log('[Passkey] verifyPasskeyRegistration success:', success);
      if (success) {
        await dispatch(getPasskeyList());
        navigation.goBack();
      }
    } catch (error) {
      console.log('[Passkey] handleRegisterPasskey catch - full error:', error);
      console.log('[Passkey] error.name:', error?.name, 'error.message:', error?.message, 'error.error:', error?.error);
      const msg = String(error?.message ?? error?.error ?? '');
      const msgLower = msg.toLowerCase();
      if (error?.name === 'NotAllowedError' || msgLower.includes('cancelled')) {
        showError('Registration was cancelled or timed out. Please try again.');
      } else if (error?.name === 'InvalidStateError' || msgLower.includes('already registered')) {
        showError('This passkey is already registered on this device.');
      } else if (msgLower.includes('rp id') || msgLower.includes('rp id cannot be validated')) {
        showError('Passkey domain not set up. Use a server domain (not localhost/IP) and ensure assetlinks.json is configured.');
      } else if (msgLower.includes('no create options') || msgLower.includes('no create options available')) {
        const isEmulator = typeof DeviceInfo.isEmulator === 'function' && DeviceInfo.isEmulator();
        if (isEmulator) {
          showError('Passkey creation is not supported on simulator/emulator. Please test on a real device.');
        } else {
          showError('Passkey setup failed. Ensure assetlinks.json is configured for your app.');
        }
      } else if (error?.error === 'InvalidUserId' || msgLower.includes('userid') || msgLower.includes('user id')) {
        showError('Server user id format is invalid. Please try again or contact support.');
      } else {
        showError(msg || 'Failed to create passkey. Please try again.');
      }
    }
  };

  const defaultName = (() => {
    const projectName = 'Exchange';
    const masked = emailId ? maskEmail(emailId) : (mobileNumber ? maskPhone(mobileNumber) : '');
    return masked ? `${projectName} - ${masked}` : `${projectName} Passkey`;
  })();

  if (!passkeySupported && step === 0) {
    return (
      <AppSafeAreaView style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <FastImage source={back_ic} style={styles.backIcon} tintColor={colors.white} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <AppText style={[styles.title, { color: textPrimary }]}>Passkeys Not Supported</AppText>
          <AppText style={[styles.desc, { color: textSecondary }]}>Passkeys are not supported on this device.</AppText>
        </View>
      </AppSafeAreaView>
    );
  }

  if (availableMethods.length === 0 && step === 1) {
    return (
      <AppSafeAreaView style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <FastImage source={back_ic} style={styles.backIcon} tintColor={colors.white} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <AppText style={[styles.title, { color: textPrimary }]}>Verification Required</AppText>
          <AppText style={[styles.desc, { color: textSecondary }]}>You need email, mobile or Google Authenticator to add a passkey.</AppText>
        </View>
      </AppSafeAreaView>
    );
  }

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
              else setStep(step - 1);
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

                <AppText style={[styles.title, { color: textPrimary }]}>Add Passkey</AppText>

                <View style={styles.imageWrap}>
                  <FastImage source={PASSKEY_VERIFY} style={styles.emailImage} resizeMode="contain" />
                </View>
                <AppText style={[styles.desc, { color: textSecondary }]}>
                  Passkeys provide secure, passwordless authentication using your device's built-in security (Face ID, Touch ID, etc.).
                </AppText>
              </>
            )}

            {step === 1 && (
              <>
                <AppText style={[styles.title, { color: textPrimary }]}>{getVerificationTitle()}</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>{getVerificationDescription()}</AppText>

                <OtpInput6Digit
                  label={verifyMethod === 'totp' ? 'Authenticator Code' : 'Verification Code'}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  isDark={isDark}
                />
                {verifyMethod !== 'totp' && (
                  <View style={styles.resendRow}>
                    {resendTimer > 0 ? (
                      <AppText style={{ color: textSecondary }}>Resend ({resendTimer}s)</AppText>
                    ) : (
                      <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
                        <AppText style={{ color: colors.buttonBg, fontSize: 14, fontWeight: '600' }}>Get OTP</AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <Button
                  children="Verify & Continue"
                  onPress={handleVerify}
                  loading={showButtonLoading}
                  containerStyle={styles.btn}
                  disabled={isLoading || otpCode.length !== CODE_LENGTH}
                />

                {availableMethods.length > 1 && (
                  <TouchableOpacity
                    onPress={() => verifyOptionsSheetRef.current?.open()}
                    style={styles.switchOptionWrap}
                    activeOpacity={0.7}
                  >
                    <AppText style={[styles.switchOptionText, { color: colors.buttonBg }]}>
                      Switch to Another Verification Option
                    </AppText>
                    
                    <FastImage source={SHARE_NEW_ICON} 
                     style={{ width: 14, height: 14,marginLeft: 5 }}
                    resizeMode="contain" tintColor={colors.buttonBg} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.iconWrap}>
                  <FastImage source={FINGERPRINT} style={styles.iconImg} resizeMode="contain" tintColor={colors.white} />
                </View>
                <AppText style={[styles.title, { color: textPrimary }]}>Create Passkey</AppText>
                <AppText style={[styles.subtitle, { color: textSecondary }]}>Give your passkey a name to identify this device</AppText>
                <AppText style={[styles.inputLabel, { color: textPrimary }]}>Passkey Name</AppText>
                <Input
                  value={passkeyName || defaultName}
                  onChangeText={(t) => setPasskeyName((t || '').slice(0, 50))}
                  placeholder="e.g., My iPhone"
                  containerStyle={styles.inputWrap}
                  inputStyle={{ color: textPrimary }}
                />
                <Button
                  children="Create Passkey"
                  onPress={handleRegisterPasskey}
                  loading={showButtonLoading}
                  containerStyle={styles.btn}
                  disabled={isLoading || !(passkeyName || defaultName).trim()}
                />
              </>
            )}
          </View>
        </ScrollView>
        {step === 0 && (
          <View style={styles.bottomBtnWrap}>
            <Button
              children="Add Passkey"
              onPress={() => setStep(1)}
              containerStyle={styles.bottomBtn}
            />
          </View>
        )}
      </KeyboardAvoidingView>
      <RBSheet
        ref={verifyOptionsSheetRef}
        height={300}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: colors.sheetColor,
            paddingBottom: 24,
          },
          wrapper: { backgroundColor: 'rgba(0,0,0,0.6)' },
          draggableIcon: { backgroundColor: 'transparent' },
        }}
      >
        <View style={styles.sheetHeader}>
          <TouchableOpacity
            onPress={() => verifyOptionsSheetRef.current?.close()}
            style={styles.sheetBackBtn}
          >
            <FastImage source={back_ic} style={{
              width: 20,
              height: 20,
            }} tintColor={colors.white} resizeMode="contain" />
          </TouchableOpacity>
          <AppText style={styles.sheetTitle}>Verification Options</AppText>
        </View>
        <View style={styles.sheetHeaderDivider} />
        <View style={styles.sheetOptions}>
          {availableMethods.map((m, index) => (
            <View key={m.id}>
              <TouchableOpacity
                onPress={() => {
                  setVerifyMethod(m.id);
                  setOtpCode('');
                  setResendTimer(0);
                  verifyOptionsSheetRef.current?.close();
                }}
                style={styles.sheetOptionRow}
                activeOpacity={0.7}
              >
                <View style={styles.sheetOptionLeft}>
                  <FastImage
                    source={getMethodIcon(m.id)}
                    style={styles.sheetOptionIcon}
                    resizeMode="contain"
                    tintColor={colors.white}
                  />
                  <View style={styles.sheetOptionTextWrap}>
                    <AppText style={[styles.sheetOptionLabel, { color: colors.white }]}>{m.label}</AppText>
                    <AppText style={[styles.sheetOptionDesc, { color: colors.descText }]}>{m.description}</AppText>
                  </View>
                </View>
              </TouchableOpacity>
              {index < availableMethods.length - 1 && <View style={styles.sheetOptionDivider} />}
            </View>
          ))}
        </View>
      </RBSheet>
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
  centered: { flex: 1, justifyContent: 'center', padding: 24 },
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
  content: { borderRadius: 16, overflow: 'hidden' },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2, marginHorizontal: 2 },
  subtitle: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  desc: { fontSize: 13, lineHeight: 21, marginHorizontal: 2 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.thirdBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconImg: { width: 36, height: 36 },
  btn: { marginTop: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginTop: 18, marginBottom: 2 },
  inputWrap: { marginTop: 8 },
  switchOptionWrap: { marginTop: 16, marginBottom: 4,flexDirection:"row",alignItems:"center" },
  switchOptionText: { fontSize: 14, fontWeight: '600' },
  resendRow: { marginTop: 12, alignItems: 'flex-end' },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:5,
    paddingTop: 20,
  },
  sheetBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.white, marginLeft: 14 },
  sheetHeaderDivider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginHorizontal: 20,
  },
  sheetOptions: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  sheetOptionRow: {
    paddingVertical: 14,
  },
  sheetOptionLeft: {
    flexDirection: 'row',
  },
  sheetOptionIcon: {
    width: 20,
    height: 20,
  },
  sheetOptionTextWrap: {
    marginLeft: 12,
  },
  sheetOptionDivider: {
    height: 1,
    backgroundColor: colors.inputBorder,
    marginLeft: 0,
  },
  sheetOptionLabel: { fontSize: 14, fontWeight: '600' },
  sheetOptionDesc: { fontSize: 13, marginTop: 2 },
  imageWrap: { alignItems: 'center', justifyContent: 'center' },
  emailImage: { width: 200, height: 200 },
});

export default AddPasskeyScreen;
