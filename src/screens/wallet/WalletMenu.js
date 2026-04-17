import { TouchableOpacity, View } from "react-native";
import { AppText, BLACK, FOURTEEN, SEMI_BOLD } from "../../shared";
import FastImage from "react-native-fast-image";
import {
  arbitary,
  buySellDarkIcon,
  buySellIcon,
  convertIcon,
  newDepositDarkIcon,
  newDepositIcon,
  newWidthrawDarkIcon,
  newWidthrawIcon,
  transferDarkIcon,
  transferIcon,
  walletIcon,
} from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import {
  ARBITORY_SCREEN,
  CONVERT_SCREEN,
  DEPOSIT_WALLET_SCREEN,
  TRANSFER_SCREEN,
  WALLET_WITHDRAW_SCREEN,
  WITHDRAW_Coin_SCREEN,
} from "../../navigation/routes";
import { useRef } from "react";
import DepositSheet from "../../shared/components/DepositSheet";
import RBSheet from "react-native-raw-bottom-sheet";
import { colors } from "../../theme/colors";
import WithdrawSheet from "../../shared/components/WithdrawSheet";

const WalletMenu = ({theme, onDeposit, onWithdraw}) => {

  return (
    <View
      style={{
        marginTop: 8,
        backgroundColor: theme !== "Dark" ? "#FAF9F6" : "transparent",
        // elevation: 1,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          // justifyContent: "space-around",
          justifyContent: "space-between",
          // gap: 20,
          marginTop: 10,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={onDeposit}
        >
          <FastImage
            source={theme !== 'Dark' ? newDepositIcon : newDepositDarkIcon}
            resizeMode="contain"
            style={{ width: 30, height: 30 }}
          />
          <AppText color={BLACK} style={{ marginTop: 5 }}>
            Deposit
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={onWithdraw}
        >
          <FastImage
            source={theme !== 'Dark' ? newWidthrawIcon : newWidthrawDarkIcon}
            resizeMode="contain"
            style={{ width: 30, height: 30 }}
          />
          <AppText color={BLACK} style={{ marginTop: 5 }}>
            Withdraw
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => NavigationService.navigate(CONVERT_SCREEN)}
        >
          <FastImage
            source={theme !== 'Dark' ? buySellIcon : convertIcon}
            resizeMode="contain"
            style={{ width: 30, height: 30 }}
            // tintColor={colors.white}
          />
          <AppText color={BLACK} style={{ marginTop: 5 }}>
            Swap
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => NavigationService.navigate(TRANSFER_SCREEN)}
        >
          <FastImage
            source={theme !== 'Dark' ? transferIcon : transferDarkIcon}
            // resizeMode="contain"
            style={{ width: 30, height: 30 }}
          />
          <AppText color={BLACK} style={{ marginTop: 5 }}>
            Transfer
          </AppText>
        </TouchableOpacity>
      </View>
     
    </View>
  );
};

export default WalletMenu;
