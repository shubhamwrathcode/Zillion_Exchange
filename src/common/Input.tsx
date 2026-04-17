import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {
  borderWidth,
  inputHeight,
  smallButtonHeight,
  universalPaddingHorizontal,
} from "../theme/dimens";
import { fontFamily, fontFamilyMedium } from "../theme/typography";
import { colors } from "../theme/colors";
import { eye_close_icon, eye_open_icon } from "../helper/ImageAssets";
import TouchableOpacityView from "./TouchableOpacityView";
import FastImage from "react-native-fast-image";
import { Button } from "./Button";
import { AppText, BLACK, FOURTEEN, SECOND, SEMI_BOLD, WHITE } from "./AppText";
import { useAppSelector } from "../store/hooks";

interface InputProps extends TextInputProps {
  value?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isSecure?: boolean;
  onPressVisible?: () => void;
  isOtp?: boolean;
  onSendOtp?: () => void;
  otpText?: string;
  title?: string;
  mainContainer?: ViewStyle;
  currency?: string;
  onfocus?: any;
  assignRef?: any;
  max?: any;
  onMax?: () => void;
  isOtpDisabled?: boolean;
}

const Input = ({
  value,
  placeholder,
  onChangeText,
  onEndEditing,
  keyboardType,
  assignRef,
  onSubmitEditing,
  multiline,
  containerStyle,
  inputStyle,
  onPressVisible,
  secureTextEntry,
  isSecure,
  isOtp,
  onSendOtp,
  otpText,
  title,
  mainContainer,
  currency,
  onfocus,
  onBlur,
  max,
  onMax,
  isOtpDisabled,
  ...props
}: InputProps) => {
  const theme = useAppSelector(state => state.auth.theme);
  return (
    <View style={[styles.inputWrapper, mainContainer]}>
      {title && <AppText style={styles.title} weight={SEMI_BOLD}>{title}</AppText>}
      <View
        style={[
          styles.container,
          title ? { marginTop: 0 } : null,
          containerStyle && typeof containerStyle === "object" ? containerStyle : undefined,
        ]}
      >
        <TextInput
          {...props}
          placeholder={placeholder}
          placeholderTextColor={theme === "Dark" ? colors.disabledText : colors.placeholderColor}
          autoCorrect={false}
          style={[styles.inputF, inputStyle, { color: theme === "Dark" ? colors.white : colors.black }]}
          value={value}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          onSubmitEditing={onSubmitEditing}
          keyboardType={keyboardType}
          ref={(component) => {
            assignRef && assignRef(component);
          }}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          onFocus={onfocus}
          onBlur={onBlur}
        />
        {isSecure && (
          <TouchableOpacityView
            style={styles.eyeIconContainer}
            onPress={onPressVisible}
          >
            <FastImage
              source={secureTextEntry ? eye_close_icon : eye_open_icon}
              style={styles.eyeIcon}
              resizeMode="contain"
              tintColor={colors.disabledText}
            />
          </TouchableOpacityView>
        )}
        {max && (
          <AppText
            style={{ color: colors.secondaryText, marginHorizontal: 10, fontSize: 14 }}
            weight={SEMI_BOLD}
            onPress={onMax}
          >
            MAX
          </AppText>
        )}
        {isOtp && (
          <Button
            children={otpText}
            titleStyle={[styles.titleStyle,{color: colors.black}]}
            containerStyle={[styles.containerStyle,{backgroundColor: colors.white}]}
            onPress={onSendOtp}
            disabled={isOtpDisabled}
          />
        )}
        {currency && (
          <AppText
            // style={styles.eyeIconContainer}
            type={FOURTEEN}
            color={BLACK}
          >
            {currency}
          </AppText>
        )}
      </View>
    </View>
  );
};

export { Input };
const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 14,
  },
  inputF: {
    fontFamily: fontFamily,
    fontSize: 14,
    // color: colors.black,
    height: inputHeight,
    flex: 1,
  },

  container: {
    marginTop: 4,
    height: inputHeight,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 9,
    paddingHorizontal: universalPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.newThemeColor,
  },
  eyeIcon: {
    height: 20,
    width: 20,
  },
  eyeIconContainer: {
    height: inputHeight,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  otpContainer: {
    height: smallButtonHeight,
  },
  titleStyle: {
    fontSize: 12,
    fontFamily: fontFamilyMedium,
    fontWeight: "500",
  },
  containerStyle: {
    height: smallButtonHeight,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  title: {
    marginBottom: 6,
  },
});
