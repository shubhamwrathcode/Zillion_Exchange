import React from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AppText, BLACK, ELEVEN, TEN, THIRTEEN, TWELVE } from "../../shared";
import { colors } from "../../theme/colors";
import { universalPaddingHorizontalHigh } from "../../theme/dimens";
const Width = Dimensions.get("window").width;
import {
  arbitary,
  buyCrypto,
  convertIcon,
  depositIcon,
  earningMenuDarkIcon,
  earningMenuIcon,
  memexDarkIcon,
  memexIcon,
  moreOption,
  rewardHubIcon,
  swap,
  walletIcon,
  withdrawIcon,
} from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import {
  ACCOUNT_SCREEN,
  ARBITORY_SCREEN,
  CONVERT_SCREEN,
  EARING_SCREEN,
  INVITE_AND_EARN_SCREEN,
  MARKET_SCREEN,
  MORE_MENU_SCREEN,
  QUICK_BUY_SELL,
  STAKING,
  WALLET_SCREEN,
} from "../../navigation/routes";
import { useAppSelector } from "../../store/hooks";
import { checkValue } from "../../helper/utility";
import { showError } from "../../helper/logger";

// ✅ Separate component for menu item to use hooks properly
const MenuItem = React.memo(({ item, index }: any) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(400).delay(index * 100)}
      style={animatedStyle}
    >
      <TouchableOpacityView
        onPress={item?.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.singleItem}
        key={item?.id}
        activeOpacity={0.8}
      >
        <FastImage
          resizeMode="contain"
          source={item.icon}
          tintColor={item?.id === "6" ? colors.white : undefined}
          style={item?.id === '6' ? styles.iconMore : styles.icon}
        />

        <AppText color={BLACK} type={ELEVEN}>
          {item?.title}
        </AppText>
      </TouchableOpacityView>
    </Animated.View>
  );
});

const HomeMenuBar = () => {
  const theme = useAppSelector((state) => state.auth.theme);
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });
  const Data = [
    {
      id: "1",
      title: checkValue(languages?.memex),
      icon: theme === "Dark" ? memexDarkIcon : memexIcon,
      onPress: () =>
        NavigationService.navigate(MARKET_SCREEN, {
          from: "home",
          tab: "MemeX",
        }),
    },
    {
      id: "2",
      title: "Staking",
      icon: theme === "Dark" ? earningMenuDarkIcon : earningMenuIcon,
      onPress: () =>
        NavigationService.navigate(ACCOUNT_SCREEN, { from: "home" }),
    },
    // {
    //   id: '3',
    //   title: 'FIT Bot',
    //   icon: arbitary,
    //   onPress: () => NavigationService.navigate(ARBITORY_SCREEN, {from: "home"}),
    // },
    {
      id: "4",
      title: checkValue("Swap"),
      icon: convertIcon,
      onPress: () => {
        NavigationService.navigate(CONVERT_SCREEN);
      },
    },
    {
      id: "5",
      title: checkValue(languages?.reward),
      icon: rewardHubIcon,
      onPress: () => NavigationService.navigate(INVITE_AND_EARN_SCREEN),
    },
    {
      id: "6",
      title: checkValue(languages?.more),
      icon: moreOption,
      onPress: () => NavigationService.navigate(MORE_MENU_SCREEN),
    },
  ];

  const renderItem = ({ item, index }: any) => {
    return <MenuItem item={item} index={index} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Data}
        renderItem={renderItem}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
      />
    
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.menuColor,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: 'space-around',
    paddingVertical: 10,
    marginBottom: 10,
    // marginTop: 10,
    // paddingHorizontal: 5,
  },
  icon: {
    height: 35,
    width: 35,
    marginBottom: 10,
  },
  iconMore: {
    height: 28,
    width: 28,
    marginBottom: 16,
  },
  singleItem: {
    // width: '20%',
    width: Width / 4.7,
    // alignSelf: 'center',
    alignItems: "center",
    // backgroundColor: "red",
    // justifyContent: "space-evenly"
  },
});
export default HomeMenuBar;
