import { useEffect, useState, useCallback, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { AppSafeAreaView, AppText, BLACK, Button, DISCLAIMTEXT, FOURTEEN, MEDIUM, SEMI_BOLD, SIXTEEN, TEN, TWENTY, WHITE } from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import FastImage from "react-native-fast-image";
import { back_ic, BACK_ICON, bitcoin_ic, moreOption, printIcon, sideIcon } from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { useDispatch } from "react-redux";
import { getParticularCoinBalance, getUserMainWallet, getWalletType, handleTranferCoin } from "../../actions/walletActions";
import WalletTypeModal from "../../shared/components/WalletTypeModal";
import CoinListModal from "../../shared/components/CoinListModal";
import { BASE_URL } from "../../helper/Constants";
import { DEPOSIT_COIN_SCREEN, DEPOSIT_SCREEN, DEPOSIT_WALLET_SCREEN } from "../../navigation/routes";
import DepositWallet from "./DepositWallet";
import TransferModal from "../../shared/components/TransferModal";
import { useFocusEffect } from "@react-navigation/native";
import TransferSkeleton from "./TransferSkeleton";

const Height = Dimensions.get('window').height;
const Transfer = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector(state => state.auth.theme);
  const WalletTypes = useAppSelector(state => state.wallet.walletTypes);
  const userWallet = useAppSelector(state => state.wallet.userMainWallet);
  const [coin, setCoin] = useState(userWallet[0]);
  const particularCoinBalance = useAppSelector(state => state.wallet.particularCoinBalance);
  const [fromWallet, setFromWallet] = useState(WalletTypes[0]);
  const [toWallet, setToWallet] = useState(WalletTypes[1]);
  const [modalVisible, setModalVisible] = useState(false);
  const [coinModal, setCoinModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isFirstMount = useRef(true);

  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        // Only show skeleton on the very first load
        setIsInitialLoad(true);
        isFirstMount.current = false;
      }
      dispatch(getWalletType());
      dispatch(getUserMainWallet(fromWallet?.toLowerCase()));
      return () => { };
    }, [dispatch, fromWallet])
  );

  useEffect(() => {
    let data = {
      fromWallet: fromWallet,
      toWallet: toWallet,
      currencyId: coin?.currency_id
    }
    if (Object.keys(coin)?.length > 0 && fromWallet && fromWallet !== "" && toWallet && toWallet !== "") {
      dispatch(getParticularCoinBalance(data));
    }

  }, [coin, fromWallet, toWallet, visible]);

  const handleSelect = (item) => {
    type === "from" ? setFromWallet(item) : setToWallet(item);
    // Sheet closes via onClose after its own animation
  };

  const handleSelectCoin = (item) => {
    setCoin(item);
    setCoinModal(false);
  };

  const handleTransfer = () => {
    let data = {
      fromWallet: fromWallet,
      toWallet: toWallet,
      amount: amount,
      currencyId: coin?.currency_id
    }
    dispatch(handleTranferCoin(data, setVisible, setAmount));
  }

  const openModal = (type) => {
    setType(type);
    setModalVisible(true);
  };

  useEffect(() => {
    if (particularCoinBalance != null) {
      setIsInitialLoad(false);
    }
  }, [particularCoinBalance]);

  const handlePopup = (theme) => {
    setVisible(false);
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }} isfrom>
      {/* Static header - no skeleton */}
      <View style={[styles.headerSection, { paddingHorizontal: 20, backgroundColor: colors.newThemeColor }]}>
        <View style={styles.headerView}>
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <FastImage
              source={BACK_ICON}
              resizeMode="contain"
              tintColor={colors.white}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 10 }} onPress={() => NavigationService.navigate('Interanl_Trade_History')}>
            <FastImage
              tintColor={colors.white}
              source={printIcon}
              resizeMode="contain"
              style={{ width: 24, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <AppText color={colors.white} weight={SEMI_BOLD} type={TWENTY} style={{ marginVertical: 10 }}>Transfer</AppText>
      </View>

      <KeyBoardAware style={{ flex: 1, }}>
        {isInitialLoad ? (
          <TransferSkeleton contentOnly />
        ) : (
          <>
            <View style={styles.fromToCard}>
              <FastImage source={sideIcon} resizeMode="contain" style={{ width: 50, height: 80 }} />
              <View style={{ gap: 20 }}>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "90%" }} onPress={() => openModal('from')}>
                  <AppText color={BLACK} weight={MEDIUM} type={FOURTEEN}>From</AppText>
                  <AppText color={BLACK} weight={MEDIUM} type={FOURTEEN}>{fromWallet?.toUpperCase()}</AppText>

                  <FastImage
                    source={back_ic}
                    resizeMode="contain"
                    style={{
                      width: 15,
                      height: 15,
                      transform: [{ rotateX: "180deg" }, { rotateZ: "3.2rad" }],
                    }}
                    tintColor={theme !== "Dark" ? colors.black : colors.white}
                  />


                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "90%" }} onPress={() => openModal('to')}>
                  <AppText color={BLACK} weight={MEDIUM} type={FOURTEEN}>To </AppText>
                  <AppText color={BLACK} weight={MEDIUM} type={FOURTEEN}>{toWallet?.toUpperCase()}</AppText>

                  <FastImage
                    source={back_ic}
                    resizeMode="contain"
                    style={{
                      width: 15,
                      height: 15,
                      transform: [{ rotateX: "180deg" }, { rotateZ: "3.2rad" }],
                    }}
                    tintColor={theme !== "Dark" ? colors.black : colors.white}
                  />

                </TouchableOpacity>
              </View>


            </View>
            <TouchableOpacity style={{
              flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, borderBottomColor: "#A2A2A2",
              borderBottomWidth: 0.5, paddingBottom: 15, alignItems: "center", marginTop: 15
            }} onPress={() => setCoinModal(true)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ borderRadius: 50, overflow: "hidden" }}>
                  <FastImage
                    source={{ uri: BASE_URL + coin?.icon_path }}
                    resizeMode="contain"
                    style={{ width: 30, height: 30 }}
                  />
                </View>

                <AppText color={BLACK} weight={SEMI_BOLD} type={SIXTEEN}>{coin?.short_name}</AppText>
              </View>

              <FastImage
                source={back_ic}
                resizeMode="contain"
                style={{
                  width: 15,
                  height: 15,
                  transform: [{ rotateX: "180deg" }, { rotateZ: "3.2rad" }],
                }}
                tintColor={theme !== "Dark" ? colors.black : colors.white}
              />

            </TouchableOpacity>
            <View style={{ marginHorizontal: 20 }}>
              <AppText color={BLACK} weight={SEMI_BOLD} type={SIXTEEN} style={{ marginVertical: 10 }}>Transfer Amount</AppText>
            </View>
            <View style={styles.inputContainer}>
              <TextInput placeholder="Enter the amount" placeholderTextColor={theme !== "Dark" ? '#5E6272' : "#FFFFFF80"} style={{ marginLeft: 20, width: '55%', color: theme === "Dark" && "#fff" }} value={amount} onChangeText={(value) => setAmount(value)} keyboardType="numeric" />
              <View style={{ flexDirection: "row", gap: 25, alignItems: "center", paddingHorizontal: 20 }}>
                <AppText style={{ color: theme !== "Dark" ? '#5E6272' : "#FFFFFF80" }} type={FOURTEEN}>{coin?.short_name}</AppText>
                <AppText style={{ color: theme !== "Dark" ? '#F3BB2B' : '#F3BB2B' }} type={FOURTEEN} onPress={() => setAmount(String(particularCoinBalance?.fromWallet?.balance) || 0)}>MAX</AppText>
              </View>

            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginVertical: 10 }}>
              <AppText color={DISCLAIMTEXT}> Available Balance</AppText>
              <AppText color={DISCLAIMTEXT} > {particularCoinBalance?.fromWallet?.balance} {coin?.short_name}</AppText>
            </View>
            {/* <TouchableOpacity style={styles.disView} onPress={() => NavigationService.navigate(DEPOSIT_WALLET_SCREEN)}>
            <AppText style={{color: theme !== "Dark" ? "#5E6272" : colors.disclaimDarText,width:"85%",fontSize:11}} >You do not have any BTC in your Spot Wallet, Please
            deposit first</AppText>
            <FastImage
              source={back_ic}
              resizeMode="contain"
              style={{
                  width: 15,
                  height: 15,
                transform: [{ rotateX: "180deg" }, { rotateZ: "3.2rad" }],
              }}
              tintColor={"#5E6272"} />
          </TouchableOpacity> */}
          </>
        )}
      </KeyBoardAware>

      {/* Static button - no skeleton */}
      <Button children="Confirm" containerStyle={{ margin: 20 }} disabled={!fromWallet || !toWallet || !amount || !coin} onPress={handleTransfer} />
      <WalletTypeModal visible={modalVisible} onClose={() => setModalVisible(false)} data={WalletTypes} onSelect={handleSelect} theme={theme} />
      <CoinListModal visible={coinModal} onClose={() => setCoinModal(false)} data={userWallet} onSelect={handleSelectCoin} theme={theme} />
      <TransferModal visible={visible} handleVisiblity={handlePopup} type={'transfer'} />
    </AppSafeAreaView>
  );
};

export default Transfer;

const styles = StyleSheet.create({
  headerSection: {
    minHeight: Height * 0.12,
    paddingBottom: 4,
  },
  headerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  fromToCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    width: "90%",
    alignSelf: "center",
    backgroundColor: colors.themeElevationColor,
    borderRadius: 10,
    padding: 12,
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: colors.themeElevationColor,
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 10,
    height: 50,
    justifyContent: "space-between",
    alignItems: "center"
  },
  disView: {
    backgroundColor: colors.themeElevationColor,
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14
  }
});
