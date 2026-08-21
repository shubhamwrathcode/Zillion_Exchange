import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Keyboard, ScrollView, RefreshControl, Modal, ActivityIndicator } from "react-native";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  Button,
  DISCLAIMTEXT,
  EIGHT,
  EIGHTEEN,
  ELEVEN,
  FOURTEEN,
  FIFTEEN,
  THIRTEEN,
  Input,
  NINE,
  RED,
  SEMI_BOLD,
  SIXTEEN,
  TEN,
  TWELVE,
  TWENTY,
  YELLOW,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import WithdrawCoinPickerPanel from "./WithdrawCoinPickerPanel";
import Accordion from "react-native-collapsible/Accordion";
import RBSheet from "react-native-raw-bottom-sheet";
import {
  loginDarkBg,
  back_ic,
  BACK_ICON,
  bitcoinIcon,
  copyIcon,
  disclaimerIcon,
  moonIcon,
  moreOption,
  printIcon,
  qrCodeIcon,
  rectangleIcon,
  upIcon,
  downIcon,
  CLOSE_ICON,
  GREEN_CHECK_ICON,
} from "../../helper/ImageAssets";
import NavigationService from "../../navigation/NavigationService";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../../helper/Constants";
import { SETTING_SCREEN_New, SETTINGS_SCREEN, WITHDRAW_SCREEN, NOTIFICATION_SCREEN } from "../../navigation/routes";
import { useAppSelector } from "../../store/hooks";
import {
  getWithdrawActiveCoins,
  getUserMainWallet,
  getAllCoins,
  checkCoboWithdrawalAssetChain,
  createCoboWithdrawalRequest,
  getWithdrawalHistory,
} from "../../actions/walletActions";
import { showError, showSuccess } from "../../helper/logger";
import { copyText } from "../../helper/utility";
import {
  filterActiveCoboChains,
  isCoboChainActive,
  parseNum,
} from "../../helper/walletChainHelpers";
import { getNotificationList } from "../../actions/homeActions";
import moment from "moment";

const WithdrawWallet = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { colors: themeColors, isDark } = useTheme();
  const routeCoin = route?.params?.data;
  const userData = useAppSelector((state) => state.auth.userData);
  const userMainWallet = useAppSelector((state) => state.wallet.userMainWallet);
  const withdrawActiveCoins = useAppSelector((state) => state.wallet.withdrawActiveCoins);

  const [withdrawFlowPhase, setWithdrawFlowPhase] = useState(() =>
    routeCoin && typeof routeCoin === "object" && Object.keys(routeCoin).length > 0
      ? "withdraw"
      : "selectCoin"
  );
  const [selectedCurrency, setSelectedCurrency] = useState(routeCoin || {});
  const [network, setNetwork] = useState("");
  const [selectedNetworkInfo, setSelectedNetworkInfo] = useState(null);
  const [loadingAssetChain, setLoadingAssetChain] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [isValidWalletAddress, setIsValidWalletAddress] = useState(true);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allCoinData, setAllCoinData] = useState([]);
  const [recentWithdrawHistory, setRecentWithdrawHistory] = useState([]);
  const [modalData, setModalData] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [withdrawSuccessData, setWithdrawSuccessData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [faqActiveIndex, setFaqActiveIndex] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncementSections, setActiveAnnouncementSections] = useState([]);
  const notificationList = useAppSelector((state) => state.home.notificationList);

  const fetchChainRequestRef = useRef(0);
  const networkSheetRef = useRef(null);

  const [withdrawCoinsLoading, setWithdrawCoinsLoading] = useState(() => {
    if (routeCoin && typeof routeCoin === "object" && Object.keys(routeCoin).length > 0) return false;
    return !(withdrawActiveCoins && withdrawActiveCoins.length > 0);
  });

  const isFirstLoad = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  const shortenAddress = (address, length = 6) => {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
  };

  const getCoboNetworks = () =>
    filterActiveCoboChains(selectedCurrency?.cobo_chain_list);

  const parseNetworkLimit = (value) => {
    if (value == null || value === "") return null;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : null;
  };

  const getSelectedNetworkFee = () =>
    parseNetworkLimit(selectedNetworkInfo?.withdrawalFee) ?? 0;

  const getSelectedNetworkMinWithdrawal = () =>
    parseNetworkLimit(selectedNetworkInfo?.minWithdrawalLimit) ?? 0;

  const getSelectedNetworkMaxWithdrawal = () =>
    parseNetworkLimit(selectedNetworkInfo?.maxWithdrawalLimit) ?? null;

  const getReceiveAmount = () => {
    const amount = parseFloat(withdrawAmount) || 0;
    const fee = getSelectedNetworkFee();
    const receive = amount - fee;
    return receive > 0 ? receive : 0;
  };

  const fetchWithdrawalAssetChainData = async (asset, depositCoinItem) => {
    if (!asset) return;
    const requestId = ++fetchChainRequestRef.current;
    const activeChains = filterActiveCoboChains(depositCoinItem?.cobo_chain_list);
    setLoadingAssetChain(true);
    try {
      const result = await dispatch(checkCoboWithdrawalAssetChain(asset));
      if (requestId !== fetchChainRequestRef.current) return;

      if (result?.success && result?.data) {
        const withdrawChainMap = {};
        (result.data?.cobo_chain_list || []).forEach((chain) => {
          if (chain?.chainId) withdrawChainMap[chain.chainId] = chain;
        });
        setSelectedCurrency({
          ...depositCoinItem,
          ...result.data,
          cobo_chain_list: activeChains.map((chain) => ({
            ...(withdrawChainMap[chain.chainId] || {}),
            ...chain,
          })),
        });
      } else {
        setSelectedCurrency({
          ...depositCoinItem,
          cobo_chain_list: activeChains,
        });
      }
    } catch (error) {
      if (requestId === fetchChainRequestRef.current) {
        setSelectedCurrency({
          ...depositCoinItem,
          cobo_chain_list: activeChains,
        });
      }
    } finally {
      if (requestId === fetchChainRequestRef.current) {
        setLoadingAssetChain(false);
      }
    }
  };

  const loadRecentWithdrawals = async () => {
    const res = await dispatch(getWithdrawalHistory(0, 5));
    if (res && Array.isArray(res.list)) {
      setRecentWithdrawHistory(res.list);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (withdrawFlowPhase === "selectCoin") {
      await dispatch(getWithdrawActiveCoins());
    } else {
      await Promise.all([
        dispatch(getWithdrawActiveCoins()),
        dispatch(getUserMainWallet('main')),
        getAllCoinsData(),
        loadRecentWithdrawals(),
      ]);
    }
    setRefreshing(false);
  }, [dispatch, withdrawFlowPhase]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const onSelectStep = withdrawFlowPhase === "selectCoin";
      if (onSelectStep && isFirstLoad.current) {
        if (!withdrawActiveCoins || withdrawActiveCoins.length === 0) {
          setWithdrawCoinsLoading(true);
        }
      }
      (async () => {
        await dispatch(getWithdrawActiveCoins());
        if (!cancelled && onSelectStep) {
          setWithdrawCoinsLoading(false);
          isFirstLoad.current = false;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [dispatch, withdrawFlowPhase])
  );

  useEffect(() => {
    if (routeCoin && Object.keys(routeCoin).length > 0) {
      handleSelectCurrency(routeCoin);
    }
    dispatch(getUserMainWallet('main'));
    getAllCoinsData();
    dispatch(getNotificationList());
    loadRecentWithdrawals();
  }, []);

  useEffect(() => {
    if (notificationList?.length > 0) {
      let announcement = notificationList?.filter((item) => item?.type === "announcement");
      if (announcement?.length === 1) {
        setAnnouncements([...announcement, ...announcement]);
      } else if (announcement?.length > 1) {
        setAnnouncements(announcement?.reverse());
      } else {
        setAnnouncements(announcement);
      }
    }
  }, [notificationList]);

  const formattedAnnouncements = announcements?.map((item) => ({
    title: item?.title,
    date: moment(item?.updatedAt).format("DD-MM-YYYY  hh:mm A"),
    content: item?.message || item?.description || item?.title,
    fullData: item
  })) || [];

  const getAllCoinsData = async () => {
    const coins = await dispatch(getAllCoins());
    if (coins) {
      setAllCoinData(coins);
    }
  };

  useEffect(() => {
    if (userMainWallet?.length > 0 && Object.keys(selectedCurrency).length > 0) {
      let filteredData = userMainWallet?.filter((item) => item?.currency_id === selectedCurrency?._id)[0];
      if (filteredData) {
        setAvailableBalance(filteredData?.balance || "0");
      }
    }
  }, [userMainWallet, selectedCurrency]);

  const goToSelectCoinPhase = () => {
    setWithdrawFlowPhase("selectCoin");
    setSelectedCurrency({});
    setNetwork("");
    setSelectedNetworkInfo(null);
    setWithdrawAddress("");
    setWithdrawAmount("");
    setOtp("");
    setIsValidWalletAddress(true);
  };

  const handleHeaderBack = () => {
    if (withdrawFlowPhase === "withdraw") {
      goToSelectCoinPhase();
    } else {
      NavigationService.goBack();
    }
  };

  const handleSelectCurrency = async (coin) => {
    const depositCoinItem = {
      ...coin,
      cobo_chain_list: filterActiveCoboChains(coin?.cobo_chain_list),
    };
    setSelectedCurrency(depositCoinItem);
    setNetwork("");
    setSelectedNetworkInfo(null);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setOtp("");
    setIsValidWalletAddress(true);
    setWithdrawFlowPhase("withdraw");
    dispatch(getUserMainWallet('main'));
    await fetchWithdrawalAssetChainData(coin?.short_name, depositCoinItem);
  };

  const handleSelectNetwork = (netItem) => {
    if (!isCoboChainActive(netItem)) return;
    const chainId = netItem?.chainId || netItem;
    setNetwork(chainId);
    setSelectedNetworkInfo(typeof netItem === "object" ? netItem : null);
    setWithdrawAddress("");
    setIsValidWalletAddress(true);
  };

  const handleWithdrawalAddress = (value) => {
    const address = value.trim();
    setWithdrawAddress(address);
    let isValid = false;
    let regexPattern = /^$/;

    if (network === "TRON") {
      regexPattern = /^T[a-zA-Z0-9]{33}$/;
    } else if (network === "BTC") {
      regexPattern = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
    } else {
      regexPattern = /^0x[a-fA-F0-9]{40}$/;
    }

    isValid = regexPattern.test(address);

    if (!isValid && address.length > 0) {
      setIsValidWalletAddress(false);
    } else {
      setIsValidWalletAddress(true);
    }
  };

  const handleMaxWithdrawal = () => {
    const balance = parseFloat(availableBalance) || 0;
    const maxLimit = getSelectedNetworkMaxWithdrawal();
    const amount = maxLimit != null && maxLimit > 0 ? Math.min(balance, maxLimit) : balance;
    setWithdrawAmount(amount > 0 ? String(amount) : "");
  };

  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;
  const parsedAvailableBalance = parseFloat(availableBalance) || 0;
  const minWithdrawalLimit = getSelectedNetworkMinWithdrawal();
  const maxWithdrawalLimit = getSelectedNetworkMaxWithdrawal();
  const showInsufficientFunds =
    withdrawAmount !== "" && parsedWithdrawAmount > parsedAvailableBalance;
  const showMinWithdrawalError =
    network &&
    minWithdrawalLimit > 0 &&
    withdrawAmount !== "" &&
    parsedWithdrawAmount > 0 &&
    parsedWithdrawAmount < minWithdrawalLimit;

  const handleWithdraw = async () => {
    const fee = getSelectedNetworkFee();
    const amount = parseFloat(withdrawAmount) || 0;
    const receiveAmount = getReceiveAmount();
    const authCode = String(otp || "").trim();

    if (
      !selectedCurrency ||
      Object.keys(selectedCurrency).length === 0 ||
      !withdrawAddress ||
      !network ||
      parsedAvailableBalance < fee ||
      amount > parsedAvailableBalance ||
      !amount ||
      !authCode ||
      !isValidWalletAddress ||
      receiveAmount <= 0 ||
      (minWithdrawalLimit > 0 && amount < minWithdrawalLimit) ||
      (maxWithdrawalLimit != null && maxWithdrawalLimit > 0 && amount > maxWithdrawalLimit)
    ) {
      if (!network) showError("Please select a network");
      else if (!withdrawAddress || !isValidWalletAddress) showError("Please enter a valid withdrawal address");
      else if (showInsufficientFunds) showError("Insufficient funds");
      else if (showMinWithdrawalError) showError(`Minimum withdrawal limit is ${minWithdrawalLimit} ${selectedCurrency?.short_name}`);
      else if (!authCode) showError("Google Authenticator code is required");
      return;
    }

    setSubmitting(true);
    Keyboard.dismiss();
    const res = await dispatch(
      createCoboWithdrawalRequest({
        amount,
        address: withdrawAddress,
        chainId: selectedNetworkInfo?.chainId || network,
        coin: selectedCurrency?.short_name,
        otp: authCode,
      })
    );
    setSubmitting(false);

    if (res?.success) {
      setWithdrawSuccessData({
        coin: selectedCurrency?.short_name,
        amount: receiveAmount,
        withdrawAmount: amount,
        fee,
        address: withdrawAddress,
        chainId: selectedNetworkInfo?.chainId || network,
        network: selectedNetworkInfo?.chainName || network,
        message: res?.message || "Withdrawal request created successfully.",
      });
      setShowSuccessModal(true);
      setWithdrawAddress("");
      setWithdrawAmount("");
      setOtp("");
      dispatch(getUserMainWallet('main'));
      loadRecentWithdrawals();
    } else {
      showError(res?.message || "Failed to create withdrawal request");
    }
  };

  const handleWithdrawModal = (item) => {
    const shortAddress = shortenAddress(item?.from_address);
    const shortToAddress = shortenAddress(item?.to_address);
    const shortTxHash = shortenAddress(item?.transaction_hash || item?.txHash || item?.transaction_number);
    setModalData({ ...item, shortAddress, shortTxHash, shortToAddress });
    setShowDetailsModal(true);
  };

  const _updateAnnouncementSections = (activeSections) => {
    setActiveAnnouncementSections(activeSections);
  };

  const _renderAnnouncementHeader = (section, index, isActive) => {
    return (
      <View style={[styles.faqHeader, {
        backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
        borderColor: isDark ? themeColors.border : "#EEE"
      }]}>
        <View style={{ flex: 1 }}>
          <AppText weight={SEMI_BOLD} type={FOURTEEN} style={{ marginBottom: 3 }}>
            {section.title}
          </AppText>
          <AppText color={DISCLAIMTEXT} type={TEN}>
            {section.date}
          </AppText>
        </View>
        <AppText weight={SEMI_BOLD} color={themeColors.text} type={EIGHTEEN}>
          {isActive ? "−" : "+"}
        </AppText>
      </View>
    );
  };

  const _renderAnnouncementContent = (section) => {
    return (
      <View style={[styles.faqContent, {
        backgroundColor: isDark ? themeColors.background : "#FFFFFF",
        borderColor: isDark ? themeColors.border : "#EEE"
      }]}>
        <AppText color={themeColors.secondaryText} type={TEN} style={styles.faqText}>
          {section.content}
        </AppText>
      </View>
    );
  };

  const faqData = [
    {
      title: "How to Withdraw Crypto?",
      content: "To withdraw crypto, go to the withdrawal section, select your cryptocurrency, enter the recipient wallet address, choose the correct network, and specify the amount. Review the details carefully before confirming the withdrawal. Processing time may vary based on network congestion and withdrawal policies."
    },
    {
      title: "How to Withdraw Crypto Step-by-step Guide",
      content: "• Go to the Withdrawal Section – Navigate to the withdrawal page.\n• Select Your Crypto – Choose the cryptocurrency you want to withdraw.\n• Enter the Wallet Address – Make sure the address is correct and belongs to the selected blockchain network.\n• Choose the Network – Select the correct blockchain network (e.g., BEP20, ERC20, TRC20, Polygon).\n• Enter the Amount – Specify the amount you want to withdraw, ensuring it meets the minimum withdrawal limit.\n• Confirm & Submit – Review all details carefully and confirm the withdrawal.\n• Wait for Processing – Withdrawals are processed based on network congestion and request approval."
    },
    {
      title: "Withdrawal hasn't arrived?",
      content: "• Check Transaction Status – Use a blockchain explorer to track the transaction.\n• Verify the Wallet Address – Ensure the recipient address is correct.\n• Confirm Network Selection – The chosen network should match the recipient's wallet.\n• Check for Pending Processing – Some withdrawals require manual approval."
    }
  ];

  const withdrawFormHeaderTitle =
    selectedCurrency?.short_name != null && String(selectedCurrency.short_name || "").length > 0
      ? `Withdraw ${selectedCurrency.short_name}`
      : "Withdraw";

  if (withdrawFlowPhase === "selectCoin") {
    return (
      <AppSafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <View style={[styles.headerView, { paddingHorizontal: 25 }]}>
          <TouchableOpacity onPress={() => NavigationService.goBack()}>
            <FastImage
              source={BACK_ICON}
              resizeMode="contain"
              style={{ width: 20, height: 20 }}
              tintColor={themeColors.text}
            />
          </TouchableOpacity>
          <AppText color={themeColors.text} weight={SEMI_BOLD} type={EIGHTEEN}>
            Select Coin
          </AppText>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() => NavigationService.navigate("Wallet_History", { tab: "Withdrawal" })}
          >
            <FastImage
              source={printIcon}
              resizeMode="contain"
              style={{ width: 24, height: 20 }}
              tintColor={themeColors.text}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, minHeight: 0 }}>
          <WithdrawCoinPickerPanel
            coins={withdrawActiveCoins || []}
            isDark={isDark}
            onSelect={handleSelectCurrency}
            loading={withdrawCoinsLoading}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      </AppSafeAreaView>
    );
  }

  const coboNetworks = getCoboNetworks();

  return (
    <AppSafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <KeyBoardAware refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />}>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.headerView}>
            <TouchableOpacity onPress={handleHeaderBack}>
              <FastImage
                source={BACK_ICON}
                resizeMode="contain"
                style={{ width: 20, height: 20 }}
                tintColor={themeColors.text}
              />
            </TouchableOpacity>
            <AppText color={themeColors.text} weight={SEMI_BOLD} type={EIGHTEEN}>
              {withdrawFormHeaderTitle}
            </AppText>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              onPress={() => NavigationService.navigate("Wallet_History", { tab: "Withdrawal" })}
            >
              <FastImage
                source={printIcon}
                resizeMode="contain"
                style={{ width: 24, height: 20 }}
                tintColor={themeColors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Selected Coin Card */}
          <View style={{ marginBottom: 20 }}>
            <AppText type={EIGHTEEN} weight={SEMI_BOLD} style={{ marginTop: 20, marginBottom: 10 }}>
              Selected Coin
            </AppText>
            <View style={[styles.nameView, { backgroundColor: themeColors.background, borderColor: isDark ? themeColors.border : "#EEE", borderWidth: 1 }]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <View style={{ borderRadius: 50, overflow: "hidden" }}>
                  <FastImage
                    source={{ uri: BASE_URL + selectedCurrency?.icon_path }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight={SEMI_BOLD} type={SIXTEEN}>
                    {selectedCurrency?.short_name}{" "}
                    <AppText type={TWELVE} color={DISCLAIMTEXT}>
                      {selectedCurrency?.name}
                    </AppText>
                  </AppText>
                  {!!network && (
                    <AppText type={TWELVE} color={themeColors.secondaryText} style={{ marginTop: 4 }}>
                      Network: {selectedNetworkInfo?.chainName || network}
                    </AppText>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={goToSelectCoinPhase} hitSlop={8}>
                <AppText type={FOURTEEN} color={YELLOW} weight={SEMI_BOLD}>
                  Change
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Quick Coin Select */}
            {Object.keys(selectedCurrency).length > 0 && (
              <View style={{ flexDirection: "row", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
                {withdrawActiveCoins?.slice(0, 4)?.map((coin) => (
                  <TouchableOpacity
                    key={coin._id}
                    style={[styles.chainView, {
                      borderColor: selectedCurrency?._id === coin._id ? colors.buttonBg : (isDark ? themeColors.border : "#EEE"),
                      backgroundColor: selectedCurrency?._id === coin._id ? (isDark ? "#2A2A2A" : "#FFF9E6") : "transparent",
                    }]}
                    onPress={() => handleSelectCurrency(coin)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <FastImage
                        source={{ uri: BASE_URL + coin?.icon_path }}
                        style={{ width: 20, height: 20 }}
                        resizeMode="cover"
                      />
                      <AppText weight={SEMI_BOLD} color={themeColors.text}>
                        {coin?.short_name}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Withdraw To (Network selector box) */}
          {Object.keys(selectedCurrency).length > 0 && (
            <>
              <AppText style={{ marginTop: 20, marginBottom: 8 }} type={SIXTEEN} weight={SEMI_BOLD}>
                Withdraw to
              </AppText>
              <TouchableOpacity
                style={[
                  styles.selectNetworkBox,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: isDark ? themeColors.border : "#EEE",
                  },
                ]}
                onPress={() => networkSheetRef.current?.open()}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <AppText
                    weight={SEMI_BOLD}
                    type={FOURTEEN}
                    style={{ color: network ? themeColors.text : (isDark ? colors.white : "#5E6272") }}
                  >
                    {selectedNetworkInfo?.chainName || network || "Select Network"}
                  </AppText>
                  {network ? (
                    <AppText type={TEN} color={DISCLAIMTEXT} style={{ marginTop: 2 }}>
                      {network}
                    </AppText>
                  ) : null}
                </View>
                <FastImage
                  source={downIcon}
                  style={{ width: 10, height: 10 }}
                  tintColor={colors.lightGrey}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </>
          )}

          {/* Network Disclaimer */}
          {network ? (
            <View
              style={{
                marginVertical: 10,
                flexDirection: "row",
                backgroundColor: isDark ? "#1A1A1A" : "#FFF9E6",
                borderColor: isDark ? themeColors.border : colors.buttonBg,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
                gap: 10
              }}
            >
              <FastImage
                source={disclaimerIcon}
                style={{ width: 18, height: 18 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <AppText color={themeColors.secondaryText} type={NINE}>
                  Selected network: <AppText weight={SEMI_BOLD} style={{ color: colors.buttonBg }} type={NINE}>{selectedNetworkInfo?.chainName || network}</AppText>. Please ensure your destination address supports this network.
                </AppText>
              </View>
            </View>
          ) : null}

          {/* Withdraw Address Input */}
          <AppText style={{ marginTop: 15, marginBottom: 8 }} type={SIXTEEN} weight={SEMI_BOLD}>
            Withdrawal Address
          </AppText>
          <Input
            placeholder="Enter Wallet Address"
            value={withdrawAddress}
            onChangeText={handleWithdrawalAddress}
            editable={!!network}
          />
          {!isValidWalletAddress && (
            <AppText weight={SEMI_BOLD} type={TEN} style={{ color: "red", marginTop: 4 }}>
              Invalid wallet address for the selected network!
            </AppText>
          )}

          {/* Withdraw Amount */}
          {Object.keys(selectedCurrency).length > 0 && network && (
            <>
              <AppText style={{ marginTop: 20, marginBottom: 8 }} type={SIXTEEN} weight={SEMI_BOLD}>
                Withdraw Amount
              </AppText>
              <Input
                placeholder={`Minimum ${minWithdrawalLimit} ${selectedCurrency?.short_name || ""}`}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={(value) => {
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setWithdrawAmount(value);
                  }
                }}
                max
                onMax={handleMaxWithdrawal}
              />
              {showInsufficientFunds && (
                <AppText weight={SEMI_BOLD} type={TEN} style={{ color: 'red', marginTop: 4 }}>
                  Insufficient funds
                </AppText>
              )}
              {showMinWithdrawalError && (
                <AppText weight={SEMI_BOLD} type={TEN} style={{ color: 'red', marginTop: 4 }}>
                  Minimum withdrawal limit is {minWithdrawalLimit} {selectedCurrency?.short_name}
                </AppText>
              )}
              {maxWithdrawalLimit != null && withdrawAmount !== "" && parsedWithdrawAmount > maxWithdrawalLimit && (
                <AppText weight={SEMI_BOLD} type={TEN} style={{ color: 'red', marginTop: 4 }}>
                  Amount exceeds maximum withdrawal limit ({maxWithdrawalLimit} {selectedCurrency?.short_name})
                </AppText>
              )}

              {/* Balance and Fee Info Card */}
              <View style={[styles.networkView, { borderColor: isDark ? themeColors.border : "#EEE" }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <AppText weight={SEMI_BOLD} type={TWELVE} color={themeColors.secondaryText}>Available Balance</AppText>
                  <AppText weight={SEMI_BOLD} type={TWELVE}>{availableBalance} {selectedCurrency?.short_name}</AppText>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <AppText weight={SEMI_BOLD} type={TWELVE} color={themeColors.secondaryText}>Withdrawal Fee</AppText>
                  <AppText weight={SEMI_BOLD} type={TWELVE}>
                    {getSelectedNetworkFee()} {selectedCurrency?.short_name}
                  </AppText>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <AppText weight={SEMI_BOLD} type={TWELVE} color={themeColors.secondaryText}>Maximum Withdrawal</AppText>
                  <AppText weight={SEMI_BOLD} type={TWELVE}>
                    {maxWithdrawalLimit != null ? maxWithdrawalLimit : "—"} {selectedCurrency?.short_name}
                  </AppText>
                </View>

                {/* Receive Amount */}
                <View
                  style={{
                    marginTop: 14,
                    paddingTop: 10,
                    borderTopWidth: 0.5,
                    borderTopColor: isDark ? themeColors.border : "#EAEAEA",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <AppText weight={SEMI_BOLD} type={FOURTEEN} style={{ flexShrink: 0, marginTop: 1 }}>
                    Receive Amount
                  </AppText>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <AppText
                      weight={SEMI_BOLD}
                      type={FOURTEEN}
                      color={colors.buttonBg}
                      style={{ textAlign: "right" }}
                    >
                      {withdrawAmount ? getReceiveAmount() : "---"} {selectedCurrency?.short_name}
                    </AppText>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 2FA Google Authenticator Code Input */}
          {Object.keys(selectedCurrency).length > 0 && network && isValidWalletAddress && withdrawAddress && withdrawAmount && (
            <>
              <AppText style={{ marginTop: 20, marginBottom: 8 }} type={SIXTEEN} weight={SEMI_BOLD}>
                Google Authenticator Code
              </AppText>
              <Input
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, "").slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
              />
            </>
          )}

          <Button
            children={submitting ? "Processing..." : "Withdraw"}
            containerStyle={{ marginVertical: 20 }}
            disabled={
              submitting ||
              !network ||
              !withdrawAddress ||
              !isValidWalletAddress ||
              !withdrawAmount ||
              !otp ||
              otp.length < 6 ||
              parsedWithdrawAmount <= 0 ||
              showInsufficientFunds ||
              showMinWithdrawalError ||
              (maxWithdrawalLimit != null && parsedWithdrawAmount > maxWithdrawalLimit)
            }
            onPress={handleWithdraw}
          />

          {/* Recent Withdrawals Section */}
          <View style={{ marginTop: 15, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <AppText type={EIGHTEEN} weight={SEMI_BOLD}>Recent Withdrawals</AppText>
              <TouchableOpacity onPress={() => NavigationService.navigate("Wallet_History", { tab: "Withdrawal" })}>
                <AppText type={FOURTEEN} color={YELLOW}>More &gt;</AppText>
              </TouchableOpacity>
            </View>

            {recentWithdrawHistory?.length > 0 ? (
              recentWithdrawHistory.map((item, idx) => {
                const shortAddr = shortenAddress(item?.to_address || item?.toAddress);
                const shortTx = shortenAddress(item?.transaction_hash || item?.txHash || item?.transaction_number);
                const isSuccess = !item?.status || item?.status?.toUpperCase() === "SUCCESS" || item?.status?.toUpperCase() === "COMPLETED";
                const statusColor = isSuccess ? "#00C087" : item?.status?.toUpperCase() === "PENDING" ? "#FF9800" : "#F44336";

                return (
                  <View
                    key={item?._id || idx}
                    style={[
                      styles.recentCard,
                      {
                        backgroundColor: themeColors.background,
                        borderColor: isDark ? themeColors.border : "#EEE",
                      },
                    ]}
                  >
                    <View style={styles.recentCardHeader}>
                      <AppText weight={SEMI_BOLD} type={FOURTEEN}>
                        {item?.amount} {item?.short_name || item?.currency || item?.coin}
                      </AppText>
                      <AppText weight={SEMI_BOLD} type={TWELVE} style={{ color: statusColor }}>
                        {item?.status || "COMPLETED"}
                      </AppText>
                    </View>

                    <View style={styles.recentCardRow}>
                      <AppText type={TWELVE} color={themeColors.secondaryText}>Date</AppText>
                      <AppText type={TWELVE}>
                        {moment(item?.createdAt || item?.updatedAt).format("DD-MM-YYYY hh:mm A")}
                      </AppText>
                    </View>

                    <View style={styles.recentCardRow}>
                      <AppText type={TWELVE} color={themeColors.secondaryText}>Network</AppText>
                      <AppText type={TWELVE}>{item?.chain || item?.chainId || "---"}</AppText>
                    </View>

                    <View style={styles.recentCardRow}>
                      <AppText type={TWELVE} color={themeColors.secondaryText}>Address</AppText>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <AppText type={TWELVE} style={{ marginRight: 6 }}>{shortAddr || "---"}</AppText>
                        {item?.to_address ? (
                          <TouchableOpacity onPress={() => copyText(item.to_address)}>
                            <FastImage source={copyIcon} style={{ width: 12, height: 12 }} tintColor={themeColors.text} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.recentCardRow}>
                      <AppText type={TWELVE} color={themeColors.secondaryText}>TxID</AppText>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <AppText type={TWELVE} style={{ marginRight: 6 }}>{shortTx || "---"}</AppText>
                        {item?.transaction_hash ? (
                          <TouchableOpacity onPress={() => copyText(item.transaction_hash)}>
                            <FastImage source={copyIcon} style={{ width: 12, height: 12 }} tintColor={themeColors.text} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: isDark ? "#2C2D35" : "#F3F4F6" }]}
                      onPress={() => handleWithdrawModal(item)}
                    >
                      <AppText type={TWELVE} weight={SEMI_BOLD} color={themeColors.text}>
                        View Details
                      </AppText>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyRecentWrap, { borderColor: isDark ? themeColors.border : "#EEE" }]}>
                <AppText type={TWELVE} color={DISCLAIMTEXT} style={{ fontStyle: "italic" }}>
                  No recent withdrawals
                </AppText>
              </View>
            )}
          </View>

          {/* Announcements Section */}
          {formattedAnnouncements?.length > 0 && (
            <View style={{ marginTop: 15, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <AppText type={EIGHTEEN} weight={SEMI_BOLD}>Announcements</AppText>
                <TouchableOpacity onPress={() => NavigationService.navigate(NOTIFICATION_SCREEN)}>
                  <AppText type={FOURTEEN} color={YELLOW}>More &gt;</AppText>
                </TouchableOpacity>
              </View>
              <Accordion
                sections={formattedAnnouncements}
                activeSections={activeAnnouncementSections}
                renderHeader={_renderAnnouncementHeader}
                renderContent={_renderAnnouncementContent}
                onChange={_updateAnnouncementSections}
                underlayColor={colors.transparent}
                containerStyle={{ gap: 10 }}
              />
            </View>
          )}

          {/* FAQ Section */}
          <View style={styles.faqSectionWrap}>
            <View style={[styles.faqSectionCard, { backgroundColor: themeColors.background, borderColor: isDark ? themeColors.border : "#EEE", borderWidth: 1 }]}>
              <AppText type={FIFTEEN} weight={SEMI_BOLD} style={[styles.faqSectionCardTitle, { color: themeColors.text }]}>
                FAQ
              </AppText>
              <FlatList
                data={faqData}
                keyExtractor={(_, index) => String(index)}
                style={styles.faqListWrap}
                contentContainerStyle={styles.faqScrollContent}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View style={[styles.faqItemInner, index === faqData.length - 1 && styles.faqItemInnerLast]}>
                    <TouchableOpacity
                      style={styles.faqQuestionRow}
                      onPress={() => setFaqActiveIndex(faqActiveIndex === index ? null : index)}
                      activeOpacity={0.7}
                    >
                      <AppText type={THIRTEEN} weight={SEMI_BOLD} style={[styles.faqQuestion, { color: themeColors.text }]}>
                        {item.title}
                      </AppText>
                      <FastImage
                        source={faqActiveIndex === index ? upIcon : downIcon}
                        resizeMode="contain"
                        style={styles.faqArrow}
                        tintColor={themeColors.text}
                      />
                    </TouchableOpacity>
                    {faqActiveIndex === index && (
                      <View style={styles.faqAnswer}>
                        {item.content.split("\n").map((line, lineIndex) => (
                          <AppText key={lineIndex} type={TWELVE} style={{ color: themeColors.secondaryText, lineHeight: 18 }}>
                            {line}
                          </AppText>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </KeyBoardAware>

      {/* Network Selection RBSheet */}
      <RBSheet
        ref={networkSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={460}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: themeColors.background,
            paddingHorizontal: 20,
            paddingBottom: 20,
          },
          wrapper: { backgroundColor: "rgba(0,0,0,0.6)" },
          draggableIcon: { backgroundColor: colors.textGray },
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText
            weight={SEMI_BOLD}
            type={SIXTEEN}
            style={{ marginBottom: 15, marginTop: 5, color: themeColors.text }}
          >
            Choose Network
          </AppText>

          {loadingAssetChain ? (
            <View style={{ paddingVertical: 30, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.buttonBg} />
              <AppText type={TWELVE} color={DISCLAIMTEXT} style={{ marginTop: 8 }}>
                Loading networks & limits...
              </AppText>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {coboNetworks.map((netItem) => {
                const chainId = netItem?.chainId || netItem;
                const chainTitle = netItem?.chainName || chainId;
                const isSelected = network === chainId;
                const minWith = parseNetworkLimit(netItem?.minWithdrawalLimit);
                const maxWith = parseNetworkLimit(netItem?.maxWithdrawalLimit);

                return (
                  <TouchableOpacity
                    key={chainId}
                    style={[
                      styles.networkCardInSheet,
                      {
                        borderColor: isSelected ? colors.buttonBg : (isDark ? themeColors.border : "#EEE"),
                        backgroundColor: isSelected ? (isDark ? "#2A2A2A" : "#FFF9E6") : "transparent",
                      },
                    ]}
                    onPress={() => {
                      handleSelectNetwork(netItem);
                      networkSheetRef.current?.close();
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <AppText weight={SEMI_BOLD} type={FOURTEEN} color={themeColors.text}>
                        {chainTitle}
                      </AppText>
                      {isSelected && (
                        <FastImage
                          source={GREEN_CHECK_ICON}
                          style={{ width: 18, height: 18 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                    <AppText type={TWELVE} color={DISCLAIMTEXT} style={{ marginTop: 3 }}>
                      {selectedCurrency?.short_name} · {chainId}
                    </AppText>
                    {(minWith != null || maxWith != null) && (
                      <AppText type={TEN} color={DISCLAIMTEXT} style={{ marginTop: 2 }}>
                        Min: {minWith ?? 0} {selectedCurrency?.short_name}
                        {maxWith != null ? ` • Max: ${maxWith} ${selectedCurrency?.short_name}` : ""}
                      </AppText>
                    )}
                    <AppText type={TEN} color={DISCLAIMTEXT} style={{ marginTop: 2 }}>
                      {netItem?.confirmations ? `${netItem.confirmations} block confirmations` : "1 block confirmation"}
                      {netItem?.requireMemo ? " • Memo required" : " • Est. arrival ≈ 2 mins"}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
              {coboNetworks.length === 0 && !loadingAssetChain && (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <AppText type={TWELVE} color={DISCLAIMTEXT}>
                    No active networks for this coin.
                  </AppText>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.sheetNoticeWrap}>
            <FastImage source={disclaimerIcon} style={{ width: 16, height: 16, marginTop: 2 }} resizeMode="contain" tintColor={colors.textGray} />
            <AppText type={TEN} color={colors.textGray} style={{ flex: 1, lineHeight: 15, marginLeft: 8 }}>
              Please note that only supported networks on our platform are shown; if you withdraw via an unsupported network your assets may be lost.
            </AppText>
          </View>
        </View>
      </RBSheet>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              {
                backgroundColor: themeColors.background,
                borderColor: isDark ? themeColors.border : "#EEE",
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <AppText type={EIGHTEEN} weight={SEMI_BOLD}>Withdrawal Details</AppText>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={{ padding: 4 }}
              >
                <FastImage source={CLOSE_ICON} style={{ width: 18, height: 18 }} tintColor={themeColors.text} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingVertical: 10 }}>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Status</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.detailValue, { color: !modalData?.status || modalData?.status?.toUpperCase() === "COMPLETED" ? "#00C087" : "#FF9800" }]}>
                  {modalData?.status || "COMPLETED"}
                </AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Coin</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{modalData?.short_name || modalData?.currency || modalData?.coin || "---"}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Amount</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{modalData?.amount ?? "---"}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Network</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{modalData?.chain || modalData?.chainId || "---"}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Address</AppText>
                <View style={[styles.detailValue, { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }]}>
                  <AppText type={TWELVE} style={{ marginRight: 6, textAlign: "right" }}>{shortenAddress(modalData?.to_address || modalData?.toAddress || "") || "---"}</AppText>
                  {modalData?.to_address ? (
                    <TouchableOpacity onPress={() => copyText(modalData.to_address)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <FastImage source={copyIcon} style={{ width: 14, height: 14 }} tintColor={themeColors.text} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>TxID</AppText>
                <View style={[styles.detailValue, { flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }]}>
                  <AppText type={TWELVE} style={{ marginRight: 6, textAlign: "right" }}>{shortenAddress(modalData?.transaction_hash || modalData?.txHash || "") || "---"}</AppText>
                  {modalData?.transaction_hash ? (
                    <TouchableOpacity onPress={() => copyText(modalData.transaction_hash)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <FastImage source={copyIcon} style={{ width: 14, height: 14 }} tintColor={themeColors.text} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Date</AppText>
                <AppText type={TWELVE} style={styles.detailValue}>{moment(modalData?.createdAt || modalData?.updatedAt).format("DD-MM-YYYY hh:mm A")}</AppText>
              </View>
            </ScrollView>
            <Button
              children="Close"
              containerStyle={{ marginTop: 15 }}
              onPress={() => setShowDetailsModal(false)}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSuccessModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              {
                backgroundColor: themeColors.background,
                borderColor: isDark ? themeColors.border : "#EEE",
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowSuccessModal(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={{ padding: 4 }}
              >
                <FastImage source={CLOSE_ICON} style={{ width: 18, height: 18 }} tintColor={themeColors.text} resizeMode="contain" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", paddingVertical: 10 }}>
              <FastImage source={GREEN_CHECK_ICON} style={{ width: 48, height: 48, marginBottom: 12 }} resizeMode="contain" />
              <AppText type={SIXTEEN} weight={SEMI_BOLD} style={{ color: "#00C087", textAlign: "center" }}>
                {withdrawSuccessData?.message || "Withdrawal Request Submitted"}
              </AppText>
            </View>

            <View style={{ paddingVertical: 10 }}>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Coin</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{withdrawSuccessData?.coin}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Network</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{withdrawSuccessData?.network}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Withdraw Amount</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{withdrawSuccessData?.withdrawAmount} {withdrawSuccessData?.coin}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Withdrawal Fee</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} style={styles.detailValue}>{withdrawSuccessData?.fee} {withdrawSuccessData?.coin}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Receive Amount</AppText>
                <AppText type={TWELVE} weight={SEMI_BOLD} color={colors.buttonBg} style={styles.detailValue}>{withdrawSuccessData?.amount} {withdrawSuccessData?.coin}</AppText>
              </View>
              <View style={styles.detailRow}>
                <AppText type={TWELVE} color={themeColors.secondaryText} style={styles.detailLabel}>Address</AppText>
                <AppText type={TWELVE} style={styles.detailValue}>{shortenAddress(withdrawSuccessData?.address || "")}</AppText>
              </View>
            </View>

            <Button
              children="Done"
              containerStyle={{ marginTop: 15 }}
              onPress={() => setShowSuccessModal(false)}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AppSafeAreaView>
  );
};

export default WithdrawWallet;

const styles = StyleSheet.create({
  headerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  networkView: {
    borderWidth: 1,
    borderColor: "#EEE",
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
  },
  chainView: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: "hidden"
  },
  networkItemCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  nameView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  recentCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  recentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  viewBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRecentWrap: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  faqSectionWrap: {
    marginTop: 20,
    marginBottom: 20,
  },
  faqSectionCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    overflow: "hidden",
  },
  faqSectionCardTitle: {
    marginBottom: 8,
  },
  faqListWrap: {},
  faqScrollContent: { paddingBottom: 8 },
  faqItemInner: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(128,128,128,0.15)",
  },
  faqItemInnerLast: { borderBottomWidth: 0 },
  faqQuestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: { flex: 1 },
  faqArrow: { width: 10, height: 10, marginLeft: 8 },
  faqAnswer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  faqContent: {
    padding: 15,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 10,
  },
  faqText: {
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(128,128,128,0.15)",
    gap: 12,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
  },
  selectNetworkBox: {
    height: 55,
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  networkCardInSheet: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sheetNoticeWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
});
