/**
 * App equivalent of web TwofactorPage (index.js) – Google Authenticator setup flow only.
 * Web: googleAuthQrModal (Step 2) + googleAuthVerifyModal (Step 3) + handleGoogleAuthConfirm + copyCode.
 * APIs: AuthService.security2faSetup() → qr_code, secret.base32; AuthService.security2faConfirm(authenticatorCode).
 */

import React, { useState, useEffect } from 'react';
import {
  AppSafeAreaView,
  AppText,
  Button,
  Toolbar,
} from '../../shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import KeyBoardAware from '../../shared/components/KeyboardAware';
import { StyleSheet, View, Keyboard } from 'react-native';
import { colors } from '../../theme/colors';
import {
  borderWidth,
  inputHeight,
  universalPaddingHorizontal,
  universalPaddingHorizontalHigh,
  universalPaddingTop,
} from '../../theme/dimens';
import FastImage from 'react-native-fast-image';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import Clipboard from '@react-native-community/clipboard';
import { copyIcon } from '../../helper/ImageAssets';
import { showError, showSuccess } from '../../helper/logger';
import { confirm2fa } from '../../actions/accountActions';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import NavigationService from '../../navigation/NavigationService';

const CODE_LENGTH = 6;

const TwoFactorQr = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.auth.theme);
  const twoFaQrData = useAppSelector(state => state.home.twoFaQrData);
  const isLoading = useAppSelector(state => state.auth.isLoading);

  // Same as web: googleQr, googleCode from security2faSetup result (result.data?.qr_code, result.data?.secret?.base32)
  const data = twoFaQrData ?? {};
  const googleQr = data?.qr_code ?? '';
  const googleCode = data?.secret?.base32 ?? '';

  // Same as web: authenticatorCode state for Step 3
  const [authenticatorCode, setAuthenticatorCode] = useState('');

  useEffect(() => {
    if (!twoFaQrData && !googleQr && !googleCode) {
      const t = setTimeout(() => {
        showError('Setup data missing. Please start from Two-Factor Authentication.');
        NavigationService.goBack();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [twoFaQrData, googleQr, googleCode]);

  // Same as web copyCode()
  const copyCode = () => {
    if (googleCode) {
      Clipboard.setString(googleCode);
      showSuccess('Code copied to clipboard!');
    }
  };

  // Same as web handleGoogleAuthConfirm()
  const handleGoogleAuthConfirm = async () => {
    if (!authenticatorCode || authenticatorCode.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit code');
      return;
    }
    Keyboard.dismiss();
    const success = await dispatch(confirm2fa(authenticatorCode));
    if (success) NavigationService.goBack();
  };

  const canSubmit =
    authenticatorCode.length === CODE_LENGTH && !isLoading && !!googleCode;

  return (
    <AppSafeAreaView
      style={{ backgroundColor: colors.newThemeColor }}
    >
      {/* Same as web googleAuthQrModal header: "Scan QR Code", "Step 2: Scan with Google Authenticator app" */}
      <Toolbar
        isSecond
        title="Scan QR Code"
        style={{ width: '68%' }}
        isCommit={false}
        isStake={false}
        isLogin={false}
      />
      <KeyBoardAware>
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                theme === 'Dark' ? colors.white_fifteen : colors.offWhite,
            },
          ]}
        >
          {/* Step 2: QR Code Display – same as web googleAuthQrModal modal-body */}
          <AppText
            style={theme === 'Dark' ? styles.stepHeadingDark : styles.stepHeading}
          >
            Step 2: Scan with Google Authenticator app
          </AppText>
          <View style={styles.qrCodeContainer}>
            {googleQr ? (
              <FastImage
                source={{ uri: googleQr }}
                resizeMode="contain"
                style={styles.qrImage}
              />
            ) : null}
          </View>
          <AppText
            style={theme === 'Dark' ? styles.scanHintDark : styles.scanHint}
          >
            Scan this QR code with Google Authenticator
          </AppText>

          <AppText
            style={theme === 'Dark' ? styles.manualLabelDark : styles.manualLabel}
          >
            Or enter this code manually:
          </AppText>
          <View style={styles.addressContainer}>
            <AppText
              ellipsizeMode="middle"
              numberOfLines={1}
              style={theme === 'Dark' ? styles.addressDark : styles.address}
            >
              {googleCode || 'Loading...'}
            </AppText>
            <View style={styles.divider} />
            <TouchableOpacityView
              onPress={copyCode}
              style={styles.copyIconContainer}
              disabled={!googleCode}
            >
              <FastImage
                source={copyIcon}
                resizeMode="contain"
                style={styles.copyIcon}
              />
            </TouchableOpacityView>
          </View>

          {/* Step 3: Verify Authenticator Code – same as web googleAuthVerifyModal */}
          <AppText
            style={theme === 'Dark' ? styles.stepHeadingDark : styles.stepHeading}
          >
            Verify Setup
          </AppText>
          <AppText
            style={theme === 'Dark' ? styles.stepSubheadingDark : styles.stepSubheading}
          >
            Step 3: Enter the code from your authenticator app
          </AppText>
          <AppText
            style={theme === 'Dark' ? styles.authenticatorLabelDark : styles.authenticatorLabel}
          >
            Enter the 6-digit code displayed in your authenticator app
          </AppText>
          <AppText
            style={theme === 'Dark' ? styles.inputLabelDark : styles.inputLabel}
          >
            Authenticator Code
          </AppText>
          <OTPInputView
            style={styles.otpContainer}
            pinCount={CODE_LENGTH}
            codeInputFieldStyle={
              theme === 'Dark' ? styles.otpInputDark : styles.otpInput
            }
            codeInputHighlightStyle={styles.otpInputHighlight}
            onCodeChanged={setAuthenticatorCode}
            onCodeFilled={setAuthenticatorCode}
          />
        </View>
      </KeyBoardAware>
      {/* Same as web: button disabled={isLoading || authenticatorCode.length !== 6} onClick={handleGoogleAuthConfirm} */}
      <Button
        children={isLoading ? 'Enabling...' : 'Enable Google Authenticator'}
        onPress={handleGoogleAuthConfirm}
        containerStyle={styles.button}
        disabled={!canSubmit}
      />
      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

export default TwoFactorQr;

const styles = StyleSheet.create({
  container: {
    marginTop: universalPaddingTop,
    margin: universalPaddingHorizontal,
    borderWidth: borderWidth,
    borderColor: colors.inputBorder,
    borderRadius: 10,
  },
  stepHeading: {
    marginTop: 16,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  stepHeadingDark: {
    marginTop: 16,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  scanHint: {
    marginTop: 8,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.disabledText,
  },
  scanHintDark: {
    marginTop: 8,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.white,
  },
  manualLabel: {
    marginTop: 16,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.black,
  },
  manualLabelDark: {
    marginTop: 16,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.white,
  },
  address: {
    flex: 1,
  },
  addressDark: {
    flex: 1,
    color: colors.white,
  },
  stepSubheading: {
    marginTop: 4,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.disabledText,
  },
  stepSubheadingDark: {
    marginTop: 4,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.white,
  },
  authenticatorLabel: {
    marginTop: 8,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.black,
  },
  authenticatorLabelDark: {
    marginTop: 8,
    marginHorizontal: 10,
    fontSize: 14,
    color: colors.white,
  },
  inputLabel: {
    marginTop: 12,
    marginHorizontal: 10,
    fontSize: 14,
    marginBottom: 4,
    color: colors.black,
  },
  inputLabelDark: {
    marginTop: 12,
    marginHorizontal: 10,
    fontSize: 14,
    marginBottom: 4,
    color: colors.white,
  },
  qrCodeContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  qrImage: {
    height: 250,
    width: 200,
  },
  addressContainer: {
    marginTop: 8,
    height: inputHeight,
    borderWidth: borderWidth,
    borderColor: colors.inputBorder,
    borderRadius: 25,
    paddingHorizontal: universalPaddingHorizontal,
    backgroundColor: colors.inputBackground,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  divider: {
    width: 1,
    height: inputHeight - 10,
    backgroundColor: colors.secondaryText,
    marginHorizontal: 5,
  },
  copyIcon: {
    height: 20,
    width: 20,
  },
  copyIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpContainer: {
    width: '100%',
    height: 80,
    marginTop: 4,
    marginBottom: 16,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.inputBorder,
    color: colors.black,
    fontSize: 18,
  },
  otpInputDark: {
    borderColor: colors.inputBorder,
    color: colors.white,
  },
  otpInputHighlight: {
    borderColor: colors.buttonBg,
  },
  button: {
    margin: universalPaddingHorizontalHigh,
  },
});
