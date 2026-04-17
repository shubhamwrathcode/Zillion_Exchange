/**
 * Reusable verification options sheet - ONLY verification options (Email OTP, Mobile OTP, Google Authenticator).
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import FastImage from 'react-native-fast-image';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { back_ic, EMAIL, PHONE, KEY_ICON } from '../helper/ImageAssets';
import { fontFamily, fontFamilyBold } from '../theme/typography';

const getMethodIcon = (value) => {
  switch (value) {
    case 'email': return EMAIL;
    case 'mobile': return PHONE;
    case 'totp': return KEY_ICON;
    default: return EMAIL;
  }
};

export const VerificationOptionsSheet = ({
  sheetRef,
  options = [],
  onSelect,
  borderClr = colors.inputBorder,
}) => (
  <RBSheet
    ref={sheetRef}
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
        onPress={() => sheetRef.current?.close()}
        style={styles.sheetBackBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <FastImage source={back_ic} style={styles.sheetBackIcon} tintColor={colors.white} resizeMode="contain" />
      </TouchableOpacity>
      <AppText style={styles.sheetTitle}>Verification Options</AppText>
    </View>
    <View style={[styles.sheetHeaderDivider, { backgroundColor: borderClr }]} />
    <View style={styles.sheetOptions}>
      {options.map((m, index) => (
        <View key={m.value}>
          <TouchableOpacity
            onPress={() => {
              onSelect?.(m.value);
              sheetRef.current?.close();
            }}
            style={styles.sheetOptionRow}
            activeOpacity={0.7}
          >
            <View style={styles.sheetOptionLeft}>
              <FastImage
                source={getMethodIcon(m.value)}
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
          {index < options.length - 1 && <View style={[styles.sheetOptionDivider, { backgroundColor: borderClr }]} />}
        </View>
      ))}
    </View>
  </RBSheet>
);

const styles = StyleSheet.create({
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sheetBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackIcon: { width: 22, height: 22 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.white, marginLeft: 14 },
  sheetHeaderDivider: { height: 1, marginHorizontal: 20 },
  sheetOptions: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  sheetOptionRow: { paddingVertical: 14 },
  sheetOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  sheetOptionIcon: { width: 20, height: 20 },
  sheetOptionTextWrap: { marginLeft: 12 },
  sheetOptionLabel: { fontSize: 14, fontFamily: fontFamilyBold },
  sheetOptionDesc: { fontSize: 13, marginTop: 2 },
  sheetOptionDivider: { height: 1 },
});
