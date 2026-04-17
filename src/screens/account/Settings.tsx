import React, { useState } from 'react';
import {
  AppSafeAreaView,
  AppText,
  Button,
  CommonModal,
  SEMI_BOLD,
  Toolbar,
} from '../../shared';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import {
  borderWidth,
  universalPaddingHorizontal,
  universalPaddingHorizontalHigh,
  universalPaddingTop,
} from '../../theme/dimens';
import KeyBoardAware from '../../shared/components/KeyboardAware';
import TouchableOpacityView from '../../shared/components/TouchableOpacityView';
import FastImage from 'react-native-fast-image';
import {
  currency_pref_ic,
  HomeBg,
  languageIcon,
  lock_ic,
  right_ic,
} from '../../helper/ImageAssets';
import NavigationService from '../../navigation/NavigationService';
import {
  CHANGE_PASSWORD_SCREEN,
  CURRENCY_PREFERENCE_SCREEN,
  ANTI_PHISHING_CODE_SCREEN,
  LANGUAGE_PREFERENCE_SCREEN,
} from '../../navigation/routes';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteAccount } from '../../actions/accountActions';
import { checkValue } from '../../helper/utility';

export const SingleBox = ({ item }) => {
  return (
    <TouchableOpacityView onPress={item.onPress} style={styles.singleBox}>
      <View style={styles.singleBoxSecond}>
        <FastImage
          source={item?.icon}
          resizeMode="contain"
          style={styles.icon}
        />
        <AppText weight={SEMI_BOLD}>{item?.title}</AppText>
      </View>
      <FastImage
        source={right_ic}
        resizeMode="contain"
        style={styles.rightIc}
      />
    </TouchableOpacityView>
  );
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const [isDelete, setIsDelete] = useState(false);
  const languages = useAppSelector(state => {
    return state.account.languages;
  });
  const DATA = [
    {
      id: '1',
      title: checkValue(languages?.setting_one),
      icon: lock_ic,
      onPress: () => NavigationService.navigate(CHANGE_PASSWORD_SCREEN),
    },
    {
      id: '2',
      title: checkValue(languages?.setting_two),
      icon: currency_pref_ic,
      onPress: () => NavigationService.navigate(CURRENCY_PREFERENCE_SCREEN),
    },
    {
      id: '3',
      title: 'Anti-Phishing Code',
      icon: lock_ic,
      onPress: () => NavigationService.navigate(ANTI_PHISHING_CODE_SCREEN),
    },
  ];

  const onDelete = () => {
    setIsDelete(true);
  };
  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }} source={null}>
      {/* <Toolbar isSecond title={checkValue(languages?.setting_three)} /> */}
      {/* <KeyBoardAware style={styles.container}> */}
      <View style={styles.container}>
        {DATA?.map(e => {
          return <SingleBox key={e.id} item={e} />;
        })}
      </View>

      {/* </KeyBoardAware> */}
      {/* <Button
        children={checkValue(languages?.setting_four)}
        onPress={() => onDelete()}
        containerStyle={styles.button}
        titleStyle={styles.buttonTitle}
      /> */}
      <CommonModal
        isVisible={isDelete}
        onBackButtonPress={() => setIsDelete(false)}
        title={`${checkValue(languages?.setting_five)}\n${checkValue(
          languages?.setting_six,
        )}`}
        subtitle={checkValue(languages?.setting_seven)}
        onPressNo={() => setIsDelete(false)}
        onPressYes={() => {
          dispatch(deleteAccount());
          setIsDelete(false);
        }}
      />
    </AppSafeAreaView>
  );
};

export default Settings;
const styles = StyleSheet.create({
  singleBox: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: universalPaddingHorizontalHigh,
    marginVertical: 5,
    paddingVertical: universalPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: borderWidth,
    borderColor: colors.inputBorder,
    borderRadius: 10,
  },
  container: {
    paddingTop: universalPaddingTop,
    paddingHorizontal: 10
  },
  icon: {
    height: 22,
    width: 22,
    marginEnd: 10,
  },
  rightIc: {
    height: 15,
    width: 15,
  },
  singleBoxSecond: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.red,
    margin: universalPaddingHorizontalHigh,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 12,
  },
});
