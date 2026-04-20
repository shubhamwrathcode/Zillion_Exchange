import React from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AppText, ELEVEN } from "../../shared";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
const Width = Dimensions.get("window").width;
import {
  convertIcon,
  convertIconDark,
  earningMenuDarkIcon,
  earningMenuIcon,
  memexDarkIcon,
  memexIcon,
  moreOption,
  rewardHubDarkIcon,
  rewardHubIcon,
} from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import {
  ACCOUNT_SCREEN,
  CONVERT_SCREEN,
  INVITE_AND_EARN_SCREEN,
  MARKET_SCREEN,
  MORE_MENU_SCREEN,
} from "../../navigation/routes";
import { useAppSelector } from "../../store/hooks";
import { checkValue } from "../../helper/utility";

// ✅ Separate component for menu item to use hooks properly
const MenuItem = React.memo(({ item, index }: any) => {
  const { colors: themeColors } = useTheme();
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
          tintColor={item?.id === "6" ? themeColors.text : undefined}
          style={item?.id === '6' ? styles.iconMore : styles.icon}
        />

        <AppText style={{ color: themeColors.text }} type={ELEVEN}>
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
      icon: theme !== "Dark" ? memexDarkIcon : memexIcon,
      onPress: () =>
        NavigationService.navigate(MARKET_SCREEN, {
          from: "home",
          tab: "MemeX",
        }),
    },
    {
      id: "2",
      title: "Staking",
      icon: theme !== "Dark" ? earningMenuDarkIcon : earningMenuIcon,
      onPress: () =>
        NavigationService.navigate(ACCOUNT_SCREEN, { from: "home" }),
    },
    {
      id: "4",
      title: checkValue("Swap"),
      icon: theme !== "Dark" ? convertIconDark : convertIcon,
      onPress: () => {
        NavigationService.navigate(CONVERT_SCREEN);
      },
    },
    {
      id: "5",
      title: checkValue(languages?.reward),
      icon: theme !== "Dark" ? rewardHubDarkIcon : rewardHubIcon,
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
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
    width: Width / 4.7,
    alignItems: "center",
  },
});
export default HomeMenuBar;
