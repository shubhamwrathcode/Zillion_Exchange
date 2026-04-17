import React, { useState, useEffect } from "react";
import {
  AppSafeAreaView,
  AppText,
  Button,
  SEMI_BOLD,
  SIXTEEN,
  FOURTEEN,
} from "../../shared";
import { useRoute } from "@react-navigation/native";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import {
  borderWidth,
  universalPaddingHorizontal,
  universalPaddingHorizontalHigh,
  universalPaddingTop,
} from "../../theme/dimens";
import { errorText } from "../../helper/Constants";
import { showError } from "../../helper/logger";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { enableTwoFa } from "../../actions/accountActions";
import { verifyUser, sendLoginOtp } from "../../actions/authActions";
import NavigationService from "../../navigation/NavigationService";
import { appBg, back_ic } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { authStyles } from "../auth/authStyles";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { SpinnerSecond } from "../../shared/components/SpinnerSecond";

const EnterOtp = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const userData = useAppSelector((state) => state.auth.userData);
  const { emailId, mobileNumber, country_code } = userData ?? {};
  const route = useRoute();
  const params = route?.params ?? {};
  const isLogin = params?.isLogin ?? false;
  const authType = params?.authType ?? 1;
  const loginSignId = params?.loginSignId ?? "";
  const availableMethods = params?.availableMethods ?? [];
  const defaultMethod = params?.defaultMethod ?? 1;

  const [code, setCode] = useState("");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState(defaultMethod || authType);
  const [resendTimer, setResendTimer] = useState(0);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor !== 'otp');

  const email_or_phone = params?.data?.email_or_phone ?? emailId ?? mobileNumber ?? loginSignId ?? "";

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const getVerifySignId = () => {
    if (!isLogin) return (emailId || `${country_code || ""} ${mobileNumber || ""}`.trim()) || email_or_phone;
    if (selectedAuthMethod === 3) {
      const m = availableMethods.find((x) => x.type === 3);
      return m?.value ?? loginSignId;
    }
    if (selectedAuthMethod === 1) {
      const m = availableMethods.find((x) => x.type === 1);
      return m?.value ?? loginSignId;
    }
    return loginSignId;
  };

  const handleGetOtp = () => {
    const sendTo = selectedAuthMethod === 3 ? "mobile" : "email";
    setResendTimer(60);
    dispatch(sendLoginOtp(getVerifySignId(), sendTo, setResendTimer));
  };

  const onSubmit = () => {
    if (!code) {
      showError(errorText.otp);
      return;
    }
    if (code.length < 6) {
      showError("Please enter a valid 6-digit code");
      return;
    }
    Keyboard.dismiss();
    if (isLogin) {
      dispatch(verifyUser({ email_or_phone: getVerifySignId(), otp: code, type: selectedAuthMethod }));
    } else {
      const data = {
        email_or_phone:
          authType === 1
            ? emailId
            : authType === 3
            ? `${country_code || ""} ${mobileNumber || ""}`.trim()
            : authType === 0 && userData?.["2fa"] === 1
            ? emailId
            : `${country_code || ""} ${mobileNumber || ""}`.trim(),
        type: authType,
        verification_code: code,
      };
      dispatch(enableTwoFa(data));
    }
    setCode("");
  };

  return (
    <AppSafeAreaView
      source={theme !== "Dark" && appBg}
      style={{ backgroundColor: colors.newThemeColor }}
    >
      <KeyBoardAware containerStyle={{justifyContent: "space-between"}}>
        <View >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "75%",
            marginTop: 20,
            marginHorizontal: 10,
          }}
        >
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <FastImage
              source={back_ic}
              resizeMode="contain"
              style={{ width: 20, height: 20 }}
              tintColor={theme !== "Dark" ? colors.black : colors.white}
            />
          </TouchableOpacity>
          <AppText weight={SEMI_BOLD} type={SIXTEEN}>
            Two Factor Authentication
          </AppText>
        </View>
        <AppText style={{ alignSelf: "center", marginLeft: 25 }}>
          {selectedAuthMethod === 2
            ? "Your Code will be sent to Authenticator App"
            : `Your Code has been sent ${selectedAuthMethod === 1 ? "to Email" : selectedAuthMethod === 3 ? "to Mobile" : ""} `}
        </AppText>
        <View
          style={[
            theme !== "Dark" ? authStyles.card : styles.cardDark,
            { margin: 20 },
          ]}
        >
          <OTPInputView
            style={{
              width: "100%",
              height: 100,
              justifyContent: "flex-start",
            }}
            pinCount={6}
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeChanged={setCode}
            onCodeFilled={(otp) => {
              if (otp?.length === 6) {
                if (isLogin) {
                  dispatch(verifyUser({ email_or_phone: getVerifySignId(), otp, type: selectedAuthMethod }));
                } else {
                  const data = {
                    email_or_phone:
                      authType === 1
                        ? emailId
                        : authType === 3
                        ? `${country_code || ""} ${mobileNumber || ""}`.trim()
                        : authType === 0 && userData?.["2fa"] === 1
                        ? emailId
                        : authType === 0 && userData?.["2fa"] === 3
                        ? `${country_code || ""} ${mobileNumber || ""}`.trim()
                        : emailId || `${country_code || ""} ${mobileNumber || ""}`.trim(),
                    type: authType,
                    verification_code: parseInt(otp, 10),
                  };
                  dispatch(enableTwoFa(data));
                }
              }
            }}
          />
          {isLogin && selectedAuthMethod !== 2 && (
            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <AppText type={FOURTEEN} color={colors.disabledText}>
                  Resend ({resendTimer}s)
                </AppText>
              ) : (
                <TouchableOpacityView onPress={handleGetOtp}>
                  <AppText type={FOURTEEN} color={colors.buttonBg}>
                    Get OTP
                  </AppText>
                </TouchableOpacityView>
              )}
            </View>
          )}
          {isLogin && availableMethods?.length > 1 && (
            <View style={{ marginTop: 12 }}>
              <AppText type={FOURTEEN} color={colors.disabledText} style={{ marginBottom: 6 }}>
                Switch to:
              </AppText>
              {availableMethods
                .filter((m) => m.type !== selectedAuthMethod && m.type !== 4)
                .map((method) => (
                  <TouchableOpacityView
                    key={method.type}
                    onPress={() => {
                      setSelectedAuthMethod(method.type);
                      setCode("");
                      setResendTimer(0);
                    }}
                    style={{ paddingVertical: 4 }}
                  >
                    <AppText type={FOURTEEN}>
                      {method.label || (method.type === 1 ? "Email" : method.type === 2 ? "Authenticator" : "Mobile")}
                    </AppText>
                  </TouchableOpacityView>
                ))}
            </View>
          )}
        </View>
        </View>
        
        <Button
            children="Submit"
            disabled={!code}
            onPress={() => onSubmit()}
            loading={showButtonLoading}
            containerStyle={styles.button}
          />
      </KeyBoardAware>

      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

export default EnterOtp;
const styles = StyleSheet.create({
  container: {
    paddingTop: universalPaddingTop,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    padding: universalPaddingHorizontal,
    borderWidth: borderWidth,
    borderColor: "#D4D4D4",
    borderRadius: 10,
  },
  button: {
    marginVertical: universalPaddingHorizontalHigh,
    width: "80%",
    alignSelf: "center",
    marginBottom: "5%"
  },
  cardDark: {
    padding: 12,
    marginTop: 20,
    borderRadius: 15,
  },
  underlineStyleBase: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.inputBorder,
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  underlineStyleHighLighted: {
    borderColor: colors.disabledText,
  },
  resendRow: {
    marginTop: 12,
    alignItems: "flex-end",
  },
});
