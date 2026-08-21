import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  BOLD,
  Button,
  FOURTEEN,
  Input,
  LIGHTGREY,
  MEDIUM,
  NORMAL,
  RED,
  SEMI_BOLD,
  TEN,
  THIRTEEN,
  TWENTY_SIX,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { Keyboard, StyleSheet, View } from "react-native";
import { authStyles } from "./authStyles";
import { BASE_URL } from "../../helper/Constants";
import { showError } from "../../helper/logger";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { googleRegister, register, registerWithPhone } from "../../actions/authActions";
import {
  appBg,
  loginDarkBg,
  captchaIcon,
  MAINHOME_BG,
  back_ic,
  downIcon,
  upIcon,
  googleIcon,
} from "../../helper/ImageAssets";
import {
  checkValue,
  validateEmail,
  validatePasswordStrict,
  validateAllowedEmail,
  isAllowedEmailDomain,
  checkEmailDomainState,
} from "../../helper/utility";
import EmailDomainSuggestions from "../../shared/components/EmailDomainSuggestions";
import NavigationService from "../../navigation/NavigationService";
import { CMS_SCREEN, LOGIN_SCREEN } from "../../navigation/routes";
import Checkbox from "../../shared/components/Checkbox";
import FastImage from "react-native-fast-image";
import { useRoute } from "@react-navigation/native";
import { colors } from "../../theme/colors";
import { CountrySelector } from "../../shared/components/CountrySelector";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { isValidPhoneNumber } from "libphonenumber-js";
import { setLoading } from "../../slices/authSlice";
import { useTheme } from "../../hooks/useTheme";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { ensureGoogleSigninConfigured } from "../../helper/googleSignIn";
// import {PickerSelect} from '../../shared/components/PickerSelect';
// import {countryCodes} from '../../helper/dummydata';
// import Recaptcha from 'react-native-recaptcha-that-works';

/** Matches AppOperation.send(): only `api/*` skips the `v1/` prefix. */
const guestPostUrl = (path) => {
  if (path.startsWith("api/")) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}v1/${path}`;
};

const logRegisterPayload = (label, path, data) => {
  const safe =
    data && typeof data === "object"
      ? {
        ...data,
        password: data.password != null ? "[redacted]" : undefined,
        Token: data.Token != null ? "[redacted]" : undefined,
      }
      : data;

};

const RenderTabBarAuth = (props) => {
  const { colors: themeColors, isDark } = useTheme();
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });
  // Web order: Email first, Mobile second
  const routes = [
    { key: "email", title: checkValue(languages?.email) || "Email" },
    // { key: "mobile", title: checkValue(languages?.mobile) || "Mobile" },
  ];
  return (
    <View style={authStyles.tabBarMain}>
      {routes.map((route, i) => {
        return (
          <TouchableOpacityView
            key={i}
            onPress={() => {
              props?.setIndex(i);
            }}
            style={[
              i === props?.index
                ? [authStyles.tabBarActive, { borderBottomColor: themeColors.button, borderBottomWidth: 2 }]
                : authStyles.tabBarInActive
            ]}
          >
            <AppText
              type={FOURTEEN}
              weight={SEMI_BOLD}
              style={{ color: i === props?.index ? (isDark ? colors.white : themeColors.button) : themeColors.secondaryText }}
            >
              {route.title}
            </AppText>
          </TouchableOpacityView>
        );
      })}
    </View>
  );
};

const Register = () => {
  const route = useRoute();
  const dispatch = useAppDispatch();
  const passwordInput = useRef(null);
  const theme = useAppSelector((state) => state.auth.theme);
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor !== 'otp');
  const [signUpId, setSignUpId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showRefer, setShowRefer] = useState(false);
  const refFromParams = route?.params?.reffcode || route?.params?.referCode || route?.params?.emailId || "";
  const [referCode, setReferCode] = useState(refFromParams);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [countryCode, setCountryCode] = useState(["91"]);
  const [country, setCountry] = useState("IN");
  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] = useState(false);
  const [checkTermsEmail, setCheckTermsEmail] = useState(false);
  const [checkTermsPhone, setCheckTermsPhone] = useState(false);
  const { colors: themeColors, isDark } = useTheme();

  const emailDomainStatus = useMemo(() => {
    return checkEmailDomainState(index === 0 ? signUpId : emailId);
  }, [index, signUpId, emailId]);

  useEffect(() => {
    setSignUpId("");
    setPassword("");
    setReferCode(refFromParams || "");
    setFirstName("");
    setLastName("");
    setMobileNumber("");
    setEmailId("");
  }, [index]);

  const handleClearCaptcha = () => { };

  useEffect(() => {
    try {
      ensureGoogleSigninConfigured();
    } catch (e) {
      console.warn("GoogleSignin.configure error", e);
    }

    // Cleanup function to handle component unmounting
    return () => {
      // Reset Google Sign-In state when component unmounts
      setIsGoogleSignInInProgress(false);
    };
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const onSubmit = (token) => {
    if (index === 0) {
      const emailTrimmed = signUpId.trim().toLowerCase();
      if (!emailTrimmed) {
        showError("Please enter your email");
        return;
      }
      if (!validateEmail(emailTrimmed)) {
        showError(checkValue(languages?.error_email) || "Please enter a valid email address");
        return;
      }
      if (!isAllowedEmailDomain(emailTrimmed)) {
        showError("Only Gmail, Yahoo, Outlook, and iCloud email addresses are allowed");
        return;
      }
      if (!firstName.trim()) {
        showError("Please enter your first name");
        return;
      }
      if (!lastName.trim()) {
        showError("Please enter your last name");
        return;
      }
      if (!mobileNumber.trim()) {
        showError("Please enter your mobile number");
        return;
      }
      const fullPhone = `${countryCode[0] ? `+${countryCode[0]}` : "+91"}${mobileNumber.trim()}`;
      if (!isValidPhoneNumber(fullPhone)) {
        showError("Please enter a valid mobile number for the selected country");
        return;
      }
    } else if (index === 1) {
      const fullPhone = `${countryCode[0] ? `+${countryCode[0]}` : "+91"}${signUpId.trim()}`;
      if (!isValidPhoneNumber(fullPhone)) {
        showError(checkValue(languages?.error_userName) || "Please enter a valid phone number for the selected country");
        return;
      }
      if (!firstName.trim()) {
        showError("Please enter your first name");
        return;
      }
      if (!lastName.trim()) {
        showError("Please enter your last name");
        return;
      }
      const emailIdTrimmed = String(emailId).trim().toLowerCase();
      if (!emailIdTrimmed) {
        showError("Please enter your email");
        return;
      }
      if (!validateEmail(emailIdTrimmed)) {
        showError("Please enter a valid email address");
        return;
      }
      if (!isAllowedEmailDomain(emailIdTrimmed)) {
        showError("Only Gmail, Yahoo, Outlook, and iCloud email addresses are allowed");
        return;
      }
    }
    if (!password) {
      showError("Please enter your password");
      return;
    }
    if (!validatePasswordStrict(password)) {
      showError("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }
    if (index === 0 && !checkTermsEmail) {
      showError("Please agree to Zillion Terms and Use");
      return;
    }
    if (index === 1 && !checkTermsPhone) {
      showError("Please agree to Zillion Terms and Use");
      return;
    }
    onRegister(token);
  };

  const signupWithGoogle = async () => {
    // Prevent multiple simultaneous calls
    if (isGoogleSignInInProgress) {
      console.log(
        "Google Sign-In already in progress, ignoring duplicate call"
      );
      return;
    }

    try {
      console.log("Starting Google Sign-In...");
      setIsGoogleSignInInProgress(true);
      dispatch(setLoading(true));
      // Prefer native Google sign-in (no external browser)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const account = await GoogleSignin.signIn();
      console.log("Native Google account:", account);

      // Fetch short-lived OAuth access token (Android only; iOS returns null)
      const tokens = await GoogleSignin.getTokens();
      console.log("Google tokens:", tokens);

      const idFromAccount =
        account?.data?.idToken || account?.idToken || account?.data?.id_token;
      let data = {
        // Same as web AuthService.signupwithGoogle: Token = OAuth access_token (not idToken JWT).
        // iOS may omit accessToken; then fall back to idToken from getTokens() / account.
        Token: tokens?.accessToken || tokens?.idToken || idFromAccount,
        type: 'google',
        referral_code: referCode || '',
      };

      logRegisterPayload("Google signup", "user/third-party-signup", data);
      dispatch(googleRegister(data, () => { }, () => { }, handleClearCaptcha));
      // await api.post('/login', userData);
    } catch (error) {
      console.error("Google Sign In Error:", error);

      // Handle specific error types
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes("User cancelled flow")
      ) {
        showError("Google Sign-In was cancelled");
      } else if (error.message && error.message.includes("Network error")) {
        showError("Network error. Please check your internet connection.");
      } else if (error.message && error.message.includes("Invalid client")) {
        showError(
          "Google Sign-In configuration error. Please contact support."
        );
      } else if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        showError("Google Sign-In was cancelled");
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        showError("Google Sign-In already in progress");
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        showError("Google Play Services not available or outdated");
      } else {
        const fallbackMessage =
          (typeof error === "string" && error) ||
          error?.message ||
          error?.error ||
          error?.error_description ||
          "Google Sign-In failed. Please try again.";
        showError(fallbackMessage);
      }
    } finally {
      setIsGoogleSignInInProgress(false);
      dispatch(setLoading(false));
    }
  };

  const onRegister = (token) => {
    let data;
    if (index === 0) {
      data = {
        email: signUpId.trim(),
        password: password,
        referral_code: referCode || "",
        token: token || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim(),
        country_code: countryCode[0] ? `+${countryCode[0]}` : "+91",
      };
      logRegisterPayload("Email register", "user/register-email", data);
      dispatch(register(data, () => { }, () => { }, handleClearCaptcha));
    } else {
      data = {
        country_code: countryCode[0] ? `+${countryCode[0]}` : "+91",
        phone: +signUpId,
        password: password,
        referral_code: referCode || "",
        token: token || "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailId: emailId.trim().toLowerCase(),
      };
      logRegisterPayload("Phone register", "user/register-phone", data);
      dispatch(registerWithPhone(data, () => { }, () => { }, handleClearCaptcha));
    }
  };
  // Captcha commented out – flow matches web: Create Account → register (OTP sent by backend) → verify OTP
  // const onVerify = (token) => {
  //   if (!verifyToken && token) {
  //     setCaptchaToken(token);
  //     onSubmit(token);
  //   } else if (verifyToken && token) {
  //     setCaptchaToken(token);
  //     handleVerifyOtp(token);
  //   } else {
  //     showError("something went wrong please try again!");
  //   }
  // };

  const send = () => {
    onSubmit("");
  };


  return (
    <AppSafeAreaView style={{ backgroundColor: themeColors.background }}>
      {/* <Toolbar /> */}
      <KeyBoardAware style={{ paddingHorizontal: 20 }}>
        <View style={{ marginVertical: 20 }}>
          <TouchableOpacityView onPress={() => NavigationService.goBack()}>
            <FastImage
              source={back_ic}
              resizeMode="contain"
              style={{ width: 15, height: 15 }}
              tintColor={themeColors.text}
            />
          </TouchableOpacityView>
        </View>
        <AppText
          style={{ marginHorizontal: 10, color: themeColors.text }}
          weight={BOLD}
          type={TWENTY_SIX}
        >
          Sign Up
        </AppText>

        <View
          style={theme !== "Dark" ? authStyles.card : authStyles.cardDark}
        >
          <RenderTabBarAuth index={index} setIndex={setIndex} />

          {index === 0 && (
            <>
              <Input
                placeholder={checkValue(languages?.place_login_userName) || "Please enter your email"}
                value={signUpId}
                onChangeText={(text) => setSignUpId(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                mainContainer={{ marginBottom: emailDomainStatus.isInvalid ? 4 : signUpId.includes("@") ? 6 : 15 }}
                containerStyle={
                  emailDomainStatus.isInvalid
                    ? { borderColor: colors.red, borderWidth: 1.5 }
                    : undefined
                }
              />
              {emailDomainStatus.isInvalid && (
                <AppText
                  type={TEN}
                  color={RED}
                  style={{ marginTop: 2, marginBottom: 8, marginHorizontal: 4 }}
                >
                  {emailDomainStatus.message || "Only Gmail, Yahoo, Outlook, and iCloud email addresses are allowed"}
                </AppText>
              )}
              <EmailDomainSuggestions
                value={signUpId}
                onSelect={(val) => setSignUpId(val)}
                containerStyle={{ marginBottom: 12, marginTop: -2 }}
              />
            </>
          )}

          <Input
            placeholder="Please enter your first name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
            autoCapitalize="words"
            returnKeyType="next"
            mainContainer={{ marginBottom: 15 }}
          />

          <Input
            placeholder="Please enter your last name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
            autoCapitalize="words"
            returnKeyType="next"
            mainContainer={{ marginBottom: 15 }}
          />

          <View style={[authStyles.mobileContainer, { marginBottom: 15 }]}>
            <CountrySelector
              onSelectCountry={setCountryCode}
              onCountry={setCountry}
              country={country}
            />
            <Input
              placeholder={index === 0 ? "Enter mobile number" : (checkValue(languages?.place_userName) || "Enter mobile number")}
              value={index === 0 ? mobileNumber : signUpId}
              onChangeText={(text) => index === 0 ? setMobileNumber(text) : setSignUpId(text)}
              keyboardType="numeric"
              autoCapitalize="none"
              returnKeyType="next"
              mainContainer={authStyles.mobileInput}
              maxLength={15}
            />
          </View>

          {index === 1 && (
            <>
              <Input
                placeholder="Please enter your email"
                value={emailId}
                onChangeText={(text) => setEmailId(text)}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                mainContainer={{ marginBottom: emailDomainStatus.isInvalid ? 4 : emailId.includes("@") ? 6 : 15 }}
                containerStyle={
                  emailDomainStatus.isInvalid
                    ? { borderColor: colors.red, borderWidth: 1.5 }
                    : undefined
                }
              />
              {emailDomainStatus.isInvalid && (
                <AppText
                  type={TEN}
                  color={RED}
                  style={{ marginTop: 2, marginBottom: 8, marginHorizontal: 4 }}
                >
                  {emailDomainStatus.message || "Only Gmail, Yahoo, Outlook, and iCloud email addresses are allowed"}
                </AppText>
              )}
              <EmailDomainSuggestions
                value={emailId}
                onSelect={(val) => setEmailId(val)}
                containerStyle={{ marginBottom: 12, marginTop: -2 }}
              />
            </>
          )}

          <Input
            placeholder={checkValue(languages?.place_signUpPassword)}
            value={password}
            onChangeText={(text) => setPassword(text)}
            autoCapitalize="none"
            secureTextEntry={isPasswordVisible}
            assignRef={(input) => {
              passwordInput.current = input;
            }}
            returnKeyType="next"
            isSecure
            onPressVisible={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          <TouchableOpacityView
            style={{
              marginTop: 15,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
            onPress={() => setShowRefer(!showRefer)}
          >
            <AppText style={{ color: themeColors.text }}>Invitation Code (Optional)</AppText>
            <FastImage
              source={!showRefer ? downIcon : upIcon}
              resizeMode="contain"
              style={{ width: 10, height: 10 }}
              tintColor={themeColors.text}
            />
          </TouchableOpacityView>

          {showRefer && (
            <Input
              placeholder={"Invite Code (Optional)"}
              value={referCode}
              onChangeText={(text) => setReferCode(text)}
              autoCapitalize="none"
              returnKeyType="next"
              editable={!refFromParams}
            />
          )}

          <TouchableOpacityView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 12,
              gap: 10,
            }}
            onPress={() => {
              if (index === 0) setCheckTermsEmail((c) => !c);
              else setCheckTermsPhone((c) => !c);
            }}
          >
            <Checkbox
              value={index === 0 ? checkTermsEmail : checkTermsPhone}
              onPress={() => {
                if (index === 0) setCheckTermsEmail((c) => !c);
                else setCheckTermsPhone((c) => !c);
              }}
            />
            <AppText type={THIRTEEN} style={{ color: themeColors.text }}>
              I agree to Zillion{" "}
              <AppText
                type={THIRTEEN}
                style={{ color: colors.buttonBg }}
                onPress={() =>
                  NavigationService.navigate(CMS_SCREEN, {
                    id: "hhttps://zillionexchange.com/TermsofUse",
                  })
                }
              >
                Terms and Use
              </AppText>
            </AppText>
          </TouchableOpacityView>


          <Button
            children={"Register"}
            disabled={
              (index === 0
                ? !signUpId.trim() || !validateAllowedEmail(signUpId.trim()) || !mobileNumber.trim()
                : !signUpId.trim() || !emailId.trim() || !validateAllowedEmail(emailId.trim())) ||
              !firstName.trim() ||
              !lastName.trim() ||
              !password ||
              !validatePasswordStrict(password) ||
              (index === 0 ? !checkTermsEmail : !checkTermsPhone)
            }
            onPress={() => send()}
            loading={showButtonLoading}
            containerStyle={{ marginTop: 20 }}
          />
        </View>

        <View
          style={{
            alignSelf: "center",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <View
              style={{
                backgroundColor: colors.lightGrey,
                width: 100,
                height: StyleSheet.hairlineWidth,
              }}
            ></View>
            <AppText color={LIGHTGREY} type={TEN}>
              Or sign up with
            </AppText>
            <View
              style={{
                backgroundColor: colors.lightGrey,
                width: 100,
                height: StyleSheet.hairlineWidth,
              }}
            ></View>
          </View>
          <TouchableOpacityView
            style={{
              borderWidth: 1,
              borderColor: themeColors.border,
              borderRadius: 40,
              padding: 3,
            }}
            onPress={signupWithGoogle}
          >
            <FastImage
              source={googleIcon}
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacityView>
          <AppText type={TEN} style={{ color: themeColors.secondaryText }}>
            By signing up, I agree to Zillion Exchange user{" "}
            <AppText style={{ color: colors.buttonBg, textDecorationLine: 'underline' }} type={TEN} onPress={() => {
              NavigationService.navigate(CMS_SCREEN, {
                id: 'https://zillionexchange.com/TermsofUse',
              });
            }}>
              Terms and Conditions
            </AppText>
          </AppText>
        </View>
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default Register;
