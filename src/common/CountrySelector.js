import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import RNPickerSelect from 'react-native-picker-select';
import { fontFamily } from '../theme/typography';
import {
  borderWidth,
  inputHeight,
  universalPaddingVertical,
} from '../theme/dimens';
import { downArrowIcon, downIcon } from '../helper/ImageAssets';
import CountryPicker from 'react-native-country-picker-modal';

import { colors } from '../theme/colors';
const CountrySelector = ({ visible, onSelectCountry, onCountry, country, style, countryCode }) => {

  return (
    <View style={[styles.dropdownWrapper, style]}>
      <CountryPicker
        onSelect={(country) => {
          // console.log(country, "country");
          onCountry(country.cca2)
          onSelectCountry(country.callingCode);
        }}
        withFilter
        containerButtonStyle={styles.inputPhoneF}
        withCallingCode
        countryCode={country}
        visible={visible}
      />
      <FastImage
        source={downIcon}
        resizeMode="contain"
        style={styles.downArrowStyle}
        tintColor={colors.disabledText}
      />
    </View>
  );
};

export { CountrySelector };
const styles = StyleSheet.create({
  dropdownWrapper: {
    borderRadius: 10,
    height: inputHeight,
    paddingHorizontal: Platform.OS === 'ios' ? universalPaddingVertical : 5,
    alignItems: 'center',
    borderWidth: borderWidth,
    borderColor: colors.white,
    flexDirection: 'row',
    bottom: 5,
    backgroundColor: colors.newThemeColor,
  },

  downArrowStyle: {
    height: 10,
    width: 10,
  },
  inputPhoneF: {},
});
