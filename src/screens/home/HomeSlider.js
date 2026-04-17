import React, { useState } from "react";
import {
  View,
  Dimensions,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import CustomDots from "./CustomDots";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL } from "../../helper/Constants";
import { Screen, universalPaddingHorizontalHigh } from "../../theme/dimens";
import { BannerListProps } from "../../helper/types";
import {
  BACK_ICON,
  banner1,
  BANNER_IMG,
  bannerDark1,
  homeImage1,
  homeImage2,
  homeImage3,
  homeImage4,
  languageIcon,
  upDownIc,
} from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { AppText, TWELVE, WHITE } from "../../shared";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import {
  ACCOUNT_SCREEN,
  CONTACT_US_SCREEN,
  DEPOSIT_COIN_SCREEN,
  DEPOSIT_WALLET_SCREEN,
  KYC_STEP_ONE_SCREEN,
  SPOT_MARKET_SCREEN,
  WALLET_SCREEN,
} from "../../navigation/routes";
const width = Dimensions.get("screen").width;
const baseOptions = {
  vertical: false,
  width: Screen.Width,
  height: 110,
};
// interface BannerListRenderItemProps {
//   item: BannerListProps;
//   index: number;
// }

const HomeSlider = ({ theme }) => {
  // const bannerList = useAppSelector(state => state.home.bannerList);
  const [activeIndex, setActiveIndex] = useState(0);
  const bannerList = [
    {
      index: 0,
      banner_path: homeImage1,
      title: `Complete your KYC verification to unlock all account features and ensure a seamless trading experience.`,
      onPress: () => NavigationService.navigate(KYC_STEP_ONE_SCREEN),
    },
    {
      index: 1,
      banner_path: homeImage2,
      title: `Start trading directly—buy and sell with full market access, real-time prices, and a smooth trading experience.`,
      onPress: () => NavigationService.navigate(WALLET_SCREEN),
    },
    {
      index: 2,
      banner_path: homeImage3,
      title: `Add funds to your wallet quickly and securely to begin trading without any delays.`,
      onPress: () => NavigationService.navigate(DEPOSIT_COIN_SCREEN),
    },
    {
      index: 3,
      banner_path: homeImage4,
      title: `Have a question or need help? Get quick assistance from our support team for any queries or concerns.`,
      onPress: () => NavigationService.navigate('Support'),
    },

  ];

  const renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
          onPress={item?.onPress}
          activeOpacity={0.9}
        >
          <FastImage
            source={item?.banner_path}
            style={{
              width: item?.index === 0 ? 80 : 70,
              height: item?.index === 0 ? 80 : 70,
            }}
            resizeMode="contain"
          />
          <AppText style={{ width: "50%", right: 20 }} type={TWELVE}>
            {item?.title}
          </AppText>
          <FastImage
            source={BACK_ICON}
            style={{
              width: 16,
              height: 16,
              transform: "rotateX(45deg) rotateZ(3.1rad)",
            }}
            resizeMode="contain"
            tintColor={colors.white}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          borderTopWidth: 0.5,
          borderTopColor: "#302F2F",
          borderBottomWidth: 1,
          borderBottomColor: "#302F2F",
          marginBottom: 5,
          height: 110,
        }}
      >
        <View
          style={{
            width: "100%",
            alignSelf: "center",
            // alignItems: 'center',
            justifyContent: "center",
            marginHorizontal: 20,
          }}
        >
          <Carousel
            {...baseOptions}
            data={bannerList}
            renderItem={renderItem}
            onSnapToItem={(index) => setActiveIndex(index)}
            autoPlay={true}
            pagingEnabled={true}
            autoPlayInterval={2500}
          />
        </View>
      </View>
      <View style={styles.dotContainer}>
        {bannerList?.map((data, index) => {
          return (
            <CustomDots
              key={data?._id}
              index={index}
              activeIndex={activeIndex}
            />
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  dotContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  bannerContainer: {
    height: 100,
    // marginEnd: universalPaddingHorizontalHigh,
    width: "100%",
    // width:Screen.Width - 35,
    // backgroundColor:"red",
  },
  container: {
    // paddingHorizontal: universalPaddingHorizontalHigh,
  },
});

export default HomeSlider;
