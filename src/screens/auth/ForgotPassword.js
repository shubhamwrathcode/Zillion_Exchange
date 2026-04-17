import React, { useEffect, useState } from "react";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  BOLD,
  Button,
  FOURTEEN,
  Input,
  MEDIUM,
  SEMI_BOLD,
  TWENTY,
  TWENTY_SIX,
  Toolbar,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { ImageBackground, Keyboard, View } from "react-native";
import { authStyles } from "./authStyles";
import { showError } from "../../helper/logger";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { forgotOtp, forgotPassword, sendOtp } from "../../actions/authActions";
import { SpinnerSecond } from "../../shared/components/SpinnerSecond";
import {
  appBg,
  loginDarkBg,
  MAINHOME_BG,
  back_ic,
} from "../../helper/ImageAssets";
import { PickerSelect } from "../../shared/components/PickerSelect";
import { countryCodes } from "../../helper/dummydata";
import {
  checkValue,
  validateEmail,
  validatePassword,
} from "../../helper/utility";
import { HOME_BG } from "../../helper/ImageAssets";
import { Screen } from "../../theme/dimens";
import FastImage from "react-native-fast-image";
import NavigationService from "../../navigation/NavigationService";
import { LOGIN_SCREEN } from "../../navigation/routes";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { CountrySelector } from "../../shared/components/CountrySelector";
import { isValidPhoneNumber } from "libphonenumber-js";
import { colors } from "../../theme/colors";

const RenderTabBarAuth = (props) => {
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });
  const routes = [
    { key: "first", title: checkValue(languages?.mobile) },
    { key: "second", title: checkValue(languages?.email) },
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
            style={
              i === props?.index
                ? authStyles.tabBarActive
                : authStyles.tabBarInActive
            }
          >
            <AppText
              type={FOURTEEN}
              weight={SEMI_BOLD}
              style={{ color: i === props?.index ? colors.white : '#707a8a' }}
            >
              {route.title}
            </AppText>
          </TouchableOpacityView>
        );
      })}
    </View>
  );
};

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });

  const [userName, setUserName] = useState("");
  const [index, setIndex] = useState(1);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const [otpText, setOtpText] = useState(checkValue(languages?.register_nine));
  const [countryCode, setCountryCode] = useState(["91"]);
  const [country, setCountry] = useState("IN");

  useEffect(() => {
    setUserName("");
  }, [index]);

  const onGetOtp = () => {
    // if (index === 0 && !userName) {
    //   showError(checkValue(languages?.error_email));
    //   return;
    // }
    // if (index === 1 && !validateEmail(userName)) {
    //   showError(checkValue(languages?.error_email));
    //   return;
    // }
    let data;
    if (index === 0) {
      data = {
        email_or_phone: `+${countryCode} ${userName}`,
        resend: true,
        type: "forgot",
      };
    } else {
      data = {
        email_or_phone: userName,
        resend: true,
        type: "forgot",
      };
    }

    Keyboard.dismiss();
    dispatch(forgotOtp(data, true));
  };

  const onLogin = () => {
    NavigationService.navigate(LOGIN_SCREEN);
  };

  const onSubmit = () => {
    if (index === 1) {
      console.log(!validateEmail(userName), "validateEmail");
      if (!validateEmail(userName)) {
        showError(checkValue(languages?.error_email));
        return;
      }
    } else if (index === 0) {
      let phone = Number(userName);
      if (!isValidPhoneNumber(`+${countryCode}${phone}`)) {
        showError(checkValue(languages?.error_userName));
        return;
      }
    }
    if (!validatePassword(password)) {
      showError(checkValue(languages?.error_passwordRegex));
      return;
    }
    let data;
    if (index === 0) {
      data = {
        email_or_phone: `+${countryCode} ${userName}`,
        new_password: password,
        verification_code: +otp,
      };
    } else {
      data = {
        email_or_phone: userName,
        new_password: password,
        verification_code: +otp,
      };
    }
    // let _data = {
    //   email_or_phone: userName,
    //   new_password: password,
    //   verification_code: +otp,
    // };
    dispatch(forgotPassword(data));
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      {/* <ImageBackground
        source={theme !== 'Dark' ? appBg: loginDarkBg}
        style={{ height: Screen.Height, width: Screen.Width }}
      > */}
      <View style={{ marginVertical: 20, marginHorizontal: 20 }}>
        <TouchableOpacityView
          onPress={() => NavigationService.navigate(LOGIN_SCREEN)}
        >
          <FastImage
            source={back_ic}
            resizeMode="contain"
            style={{ width: 15, height: 15 }}
          />
        </TouchableOpacityView>
      </View>
      <KeyBoardAware>
        <AppText
          color={BLACK}
          weight={BOLD}
          type={TWENTY_SIX}
          style={{ marginHorizontal: 20 }}
        >
          Forgot Password
        </AppText>
        <View style={authStyles.forgotContainer}>
          <View style={[authStyles.card, { marginTop: "10%" }]}>
            <RenderTabBarAuth index={index} setIndex={setIndex} />
            <View style={authStyles.mobileContainer}>
              {index === 0 && (
                <CountrySelector
                  onSelectCountry={setCountryCode}
                  onCountry={setCountry}
                  country={country}
                />
              )}
              <Input
                placeholder={
                  index === 0
                    ? checkValue(languages?.place_userName)
                    : checkValue(languages?.place_email)
                }
                value={userName}
                onChangeText={(text) => setUserName(text)}
                keyboardType={index === 0 ? "numeric" : "email-address"}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => onGetOtp()}
                mainContainer={authStyles.mobileInput}
                isOtp
                onSendOtp={() => onGetOtp(userName)}
                otpText={otpText}
              />
            </View>
            <Input
              placeholder={checkValue(languages?.place_otp)}
              value={otp}
              onChangeText={(text) => setOtp(text)}
              keyboardType="numeric"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInput?.current?.focus()}
              // assignRef={input => {
              //   otpInput.current = input;
              // }}
            />
            <Input
              placeholder={checkValue(languages?.place_signUpPassword)}
              value={password}
              onChangeText={(text) => setPassword(text)}
              autoCapitalize="none"
              secureTextEntry={isPasswordVisible}
              // assignRef={input => {
              //   passwordInput.current = input;
              // }}
              returnKeyType="next"
              isSecure
              // onSubmitEditing={() => confirmPasswordInput?.current?.focus()}
              onPressVisible={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            <Button
              children={"Forgot Password"}
              onPress={() => onSubmit()}
              disabled={!otp || !userName || !password}
              containerStyle={authStyles.marginTop}
            />
            <AppText
              weight={MEDIUM}
              style={authStyles.bottomTextLogin}
              color={BLACK}
            >
              {"Back to  "}
              <AppText
                weight={SEMI_BOLD}
                color={YELLOW}
                style={authStyles.termsText}
                onPress={() => onLogin()}
              >
                {checkValue(languages?.register_eight)}
              </AppText>
            </AppText>
          </View>
        </View>
      </KeyBoardAware>
      <SpinnerSecond />
      {/* </ImageBackground> */}
    </AppSafeAreaView>
  );
};

export default ForgotPassword;
