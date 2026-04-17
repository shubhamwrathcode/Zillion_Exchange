import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  AppSafeAreaView,
  AppText,
  Button,
  EIGHTEEN,
  ELEVEN,
  Header,
  TWELVE,
  WHITE,
  YELLOW,
} from "../../shared";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  Linking,
  Alert,
  ImageBackground,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import HomeSlider from "./HomeSlider";
import HomeSliderSkeleton from "./HomeSliderSkeleton";
import CoinSlider from "./CoinSlider";
import HomeMenuBar from "./HomeMenuBar";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { commonStyles } from "../../theme/commonStyles";
import CoinList from "./CoinList";
import CoinSliderSkeleton from "./CoinSliderSkeleton";
import CoinListSkeleton from "./CoinListSkeleton";
import {
  appBg,
  loginDarkBg,
  HomeBg,
  verificationImage,
  trade_btn,
} from "../../helper/ImageAssets";
import {
  getBannerList,
  getCoinList,
  getFavoriteArray,
  getFavorites,
  getNotificationList,
} from "../../actions/homeActions";
import {
  getAdminBankDetails,
  getTradeHistory,
  getUserArbitrageWallet,
  getUserEarningWallet,
  getUserFuturesWallet,
  getUserMainWallet,
  getUserOptionsWallet,
  getUserPortfolio,
  getUserSpotWallet,
  getUserSwapWallet,
  getUserWallet,
  getWalletHistory,
  getWalletType,
} from "../../actions/walletActions";
import { getVersion } from "react-native-device-info";
import { setLoading } from "../../slices/authSlice";
import HeaderTop from "../../shared/components/HeaderTop";
import FastImage from "react-native-fast-image";
import { KYC_STATUS_SCREEN, WALLET_SCREEN } from "../../navigation/routes";
import NavigationService from "../../navigation/NavigationService";
import { colors } from "../../theme/colors";
import { SocketContext } from "../../SocketProvider";

const Home = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const loading = useAppSelector((state) => state.auth.isLoading);
  const coinPairs = useAppSelector((state) => state.home.coinPairs);
  const userData = useAppSelector((state) => state.auth.userData);
  const { kycVerified } = userData ?? "";
  const [CheckCurrent, setCheckCurrent] = useState(getVersion());

  const socketContextVars = useContext(SocketContext) || {};
  const { subscribeToMarket, unsubscribeFromMarket } = socketContextVars;

  // Subscribe to market as soon as Home mounts so data can start flowing immediately
  useEffect(() => {
    if (subscribeToMarket) subscribeToMarket();
  }, [subscribeToMarket]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setLoading(false));
      if (subscribeToMarket) subscribeToMarket();
      return () => {
        if (unsubscribeFromMarket) unsubscribeFromMarket();
      };
    }, [dispatch, subscribeToMarket, unsubscribeFromMarket])
  );

  const hasMarketData = (coinPairs?.length ?? 0) > 0;
  const [sliderReady, setSliderReady] = useState(false);
  const showCoinSkeleton = !hasMarketData;

  useEffect(() => {
    const t = setTimeout(() => setSliderReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Dispatch Redux actions to initialize data
    // dispatch(getBannerList());
    dispatch(getCoinList());
    dispatch(getWalletType());
    dispatch(getUserWallet(""));
    dispatch(getUserMainWallet("main"));
    dispatch(getUserSpotWallet("spot"));
    dispatch(getUserSwapWallet("swap"));
    dispatch(getUserEarningWallet("earning"));
    dispatch(getUserArbitrageWallet("arbitrage"));
    dispatch(getUserFuturesWallet("futures"));
    dispatch(getUserOptionsWallet("options"));
    dispatch(getFavoriteArray());
    // dispatch(getTradeHistory());
    // dispatch(getWalletHistory());
    // dispatch(getFavorites());
    dispatch(getNotificationList());
  }, []);

  // useEffect(() => {
  //   console.log(CheckCurrent,userData?.version, "version");
  //   if(CheckCurrent != userData?.version) {
  //     // InstallAPK();
  //   }
  // }, [userData?.version]);


  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      <KeyBoardAware style={commonStyles.zeroPadding}>
        <View>
          <HeaderTop theme={theme} />
        </View>

        {(kycVerified === 0 || kycVerified === 3) && (
          <View
            style={{
              backgroundColor: colors.themeElevationColor,
              marginHorizontal: 12,
              height: 160,
              padding: 10,
              borderRadius: 6,
              marginVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <FastImage
                source={verificationImage}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
              <View style={{ width: "70%" }}>
                <AppText style={{ color: colors.buttonBg }} type={EIGHTEEN}>
                  Verification
                </AppText>
                <AppText style={{ color: "#FFFFFFB2" }} type={ELEVEN}>
                  Verify your identity to secure your account and unlock
                  trading access.
                </AppText>
              </View>
            </View>
            <Button
              onPress={() => NavigationService.navigate(KYC_STATUS_SCREEN)}
              children="Verify Now"
              containerStyle={{ width: "90%", height: 40, alignSelf: "center" }}
            />
          </View>
        )}

        <View>
          <HomeMenuBar />
        </View>

        <View>
          {sliderReady ? <HomeSlider theme={theme} /> : <HomeSliderSkeleton />}
        </View>

        <View>
          {showCoinSkeleton ? <CoinSliderSkeleton /> : <CoinSlider />}
        </View>

        <View>
          {showCoinSkeleton ? <CoinListSkeleton /> : <CoinList />}
        </View>
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default Home;
