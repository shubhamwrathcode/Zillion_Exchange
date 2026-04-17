import { Linking, TouchableOpacity, View } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  SEMI_BOLD,
  FOURTEEN,
  THIRTEEN,
  ELEVEN,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import FastImage from "react-native-fast-image";
import {
  appBg,
  arbitary,
  back_ic,
  bell_ic,
  blogIcon,
  cardCoinIcon,
  contact_ic,
  convertIcon,
  depositIcon,
  kycixon,
  lock,
  memexDarkIcon,
  memexIcon,
  myHelpIcon,
  newContactICon,
  newDepositDarkIcon,
  newDepositIcon,
  newHelpIcon,
  newHubIcon,
  newReferalIcon,
  newWalletIcon,
  newWidthrawDarkIcon,
  newWidthrawIcon,
  referralIcon,
  spotDarkIcon,
  spotIcon,
  stakCalculatorIcon,
  swap,
  transferDarkIcon,
  transferIcon,
  walletIcon,
} from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import NavigationService from "../../navigation/NavigationService";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import {
  ACCOUNT_SCREEN,
  ARBITORY_SCREEN,
  CONVERT_SCREEN,
  CURRENCY_PREFERENCE_SCREEN,
  DEPOSIT_COIN_SCREEN,
  EARING_SCREEN,
  INVITE_AND_EARN_SCREEN,
  KYC_STATUS_SCREEN,
  MARKET_SCREEN,
  NOTIFICATION_SCREEN,
  OPTIONS_SCREEN,
  SETTING_SCREEN_New,
  TRANSFER_SCREEN,
  TWO_FACTOR_AUTHENTICATION,
  WALLET_SCREEN,
  WALLET_WITHDRAW_SCREEN,
  WITHDRAW_Coin_SCREEN,
} from "../../navigation/routes";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL, SITE_URL } from "../../helper/Constants";
import WebLink from "../account/WebLink";

const MoreMenu = () => {
  const theme = useAppSelector((state) => state.auth.theme);

  const openWenView = (url, name) => {
    NavigationService.navigate("WebLink", { data: url, title: name });
  };

  return (
    <AppSafeAreaView
      source={theme !== "Dark" && appBg}
      style={{ backgroundColor: colors.newThemeColor }}
    >
      <KeyBoardAware style={{ paddingHorizontal: 20, paddingTop: "4%" }}>
        <TouchableOpacity onPress={() => NavigationService.goBack()}>
          <FastImage
            source={back_ic}
            resizeMode="contain"
            style={{ width: 20, height: 20 }}
            tintColor={theme !== "Dark" ? colors.black : colors.white}
          />
        </TouchableOpacity>
        <View style={{ marginTop: 30 }}>
          <AppText color={BLACK} weight={SEMI_BOLD} type={ELEVEN}>
            Assets
          </AppText>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
              // gap:25
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(DEPOSIT_COIN_SCREEN)}
            >
              <FastImage
                source={theme !== "Dark" ? newDepositIcon : newDepositDarkIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Deposit
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(WALLET_WITHDRAW_SCREEN)}
            >
              <FastImage
                source={
                  theme !== "Dark" ? newWidthrawIcon : newWidthrawDarkIcon
                }
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Withdraw
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(EARING_SCREEN)}
            >
              <FastImage
                source={newWalletIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Wallet
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(TRANSFER_SCREEN)}
            >
              <FastImage
                source={theme !== "Dark" ? transferIcon : transferDarkIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Transfer
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 30 }}>
          <AppText color={BLACK} weight={SEMI_BOLD} type={ELEVEN}>
            Trade
          </AppText>
          <View
            style={{
              flexDirection: "row",
              // justifyContent: "space-around",
              marginTop: 10,
              gap: 60,
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() =>
                NavigationService.navigate(MARKET_SCREEN, { tab: "memex" })
              }
            >
              <FastImage
                source={memexDarkIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                MemeX
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(WALLET_SCREEN)}
            >
              <FastImage
                source={theme !== "Dark" ? spotIcon : spotDarkIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
              />
              <AppText
                color={BLACK}
                style={{ marginTop: 5, textAlign: "center" }}
                type={ELEVEN}
              >
                Spot Trading
              </AppText>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(OPTIONS_SCREEN)}
            >
              <FastImage
                source={arbitary}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Options
              </AppText>
            </TouchableOpacity> */}
            <TouchableOpacityView
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(CONVERT_SCREEN)}
            >
              <FastImage
                source={convertIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                // tintColor={theme !== "Dark" ? colors.black : colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Swap
              </AppText>
            </TouchableOpacityView>
          </View>
        </View>
        <View style={{ marginTop: 30 }}>
          <AppText color={BLACK} weight={SEMI_BOLD} type={ELEVEN}>
            Earn
          </AppText>
          <View style={{ flexDirection: "row", marginTop: 10, gap: 70 }}>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(ACCOUNT_SCREEN)}
            >
              <FastImage
                source={newReferalIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Staking
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(INVITE_AND_EARN_SCREEN)}
            >
              <FastImage
                source={newHubIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Referral{"\n"}Reward
              </AppText>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  backgroundColor: colors.overlayColor,
                  height: 35,
                  width: 35,
                  borderRadius: 40,
                  justifyContent: "center",
                }}
                onPress={() => NavigationService.navigate("Launchpad")}
              >
                <FastImage
                  source={arbitary}
                  resizeMode="contain"
                  style={{ width: 24, height: 24 }}
                  //tintColor={colors.buttonBg}
                />
              </TouchableOpacity>
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Launchpad
              </AppText>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 30 }}>
          <AppText color={BLACK} weight={SEMI_BOLD} type={ELEVEN}>
            Personalized
          </AppText>
          <View style={{ flexDirection: "row", marginTop: 10, gap: 67 }}>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(SETTING_SCREEN_New)}
            >
              <FastImage
                source={cardCoinIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText
                color={BLACK}
                style={{ marginTop: 5, textAlign: "center" }}
                type={ELEVEN}
              >
                Profile
              </AppText>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <FastImage
                source={stakCalculatorIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText
                color={BLACK}
                style={{ marginTop: 5, textAlign: "center" }}
                type={ELEVEN}
                onPress={() =>
                  NavigationService.navigate(CURRENCY_PREFERENCE_SCREEN)
                }
              >
                Currency{"\n"} Preference
              </AppText>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 30 }}>
          <AppText color={BLACK} weight={SEMI_BOLD} type={ELEVEN}>
            Learn & Support
          </AppText>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
              // gap:25
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(NOTIFICATION_SCREEN)}
            >
              <FastImage
                source={bell_ic}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Notification
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() => NavigationService.navigate(KYC_STATUS_SCREEN)}
            >
              <FastImage
                source={myHelpIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                // tintColor={colors.white}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                KYC
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={() =>
                NavigationService.navigate(TWO_FACTOR_AUTHENTICATION)
              }
            >
              <FastImage
                source={blogIcon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                // tintColor={colors.white}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Security
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => NavigationService.navigate("Support")}
              style={{ alignItems: "center" }}
            >
              <FastImage
                source={newContactICon}
                resizeMode="contain"
                style={{ width: 34, height: 34 }}
                //tintColor={colors.buttonBg}
              />
              <AppText color={BLACK} style={{ marginTop: 5 }} type={ELEVEN}>
                Contact Us
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default MoreMenu;
