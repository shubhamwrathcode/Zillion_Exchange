import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText, BLACK, DISCLAIMTEXT, FOURTEEN, SEMI_BOLD, TEN, TWELVE, YELLOW } from "../../shared";
import { bitcoin_ic, coinActive, externalLinkIcon, NO_NOTIFICATION_ICON, NO_NOTIFICATION_ICON_LIGHT, searchIcon } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL } from "../../helper/Constants";
import { useEffect, useMemo, useRef, useState } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import DepositSheet from "../../shared/components/DepositSheet";

const amount = (value) => parseFloat(value) || 0;

const coinTotal = (item, includeBonus) =>
  amount(item?.balance) +
  (includeBonus ? amount(item?.bonus) : 0) +
  amount(item?.locked_balance);

const safeRound = (value) => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return "0.00";
  return String(parseFloat(num.toFixed(8)));
};

const WalletList = ({ userWallet, theme, onSheetOpen, activeTab = "Overview" }) => {
  const [hideAssets, setHideAssets] = useState(false);
  const depsoitSheet = useRef(null);

  const handleSheetOpen = () => {
    depsoitSheet.current?.open();
  };
  // const [filteredCoinList, setFilteredCoinList] = useState([]);

  const handleCheckboxChange = (type) => {
    if (type === "balance") {
      setHideAssets(!hideAssets);
    } else {
      setHideAssets(false);
    }
    // handleHideBal();
  };


  const sortedWallet = useMemo(() => {
    const data = [...(userWallet || [])];
    const pinZiln = activeTab === "Airdrop";
    const includeBonus = activeTab === "Overview";
    data.sort((a, b) => {
      if (pinZiln) {
        const aIsZiln = String(a?.short_name || "").toUpperCase() === "ZILN";
        const bIsZiln = String(b?.short_name || "").toUpperCase() === "ZILN";
        if (aIsZiln && !bIsZiln) return -1;
        if (!aIsZiln && bIsZiln) return 1;
      }
      const totalA = coinTotal(a, includeBonus);
      const totalB = coinTotal(b, includeBonus);
      if (totalA > 0 && totalB === 0) return -1;
      if (totalA === 0 && totalB > 0) return 1;
      return totalB - totalA;
    });
    return data;
  }, [userWallet, activeTab]);

  const filteredCoinList = hideAssets
    ? sortedWallet.filter((item) => coinTotal(item, activeTab === "Overview") > 0)
    : sortedWallet;
  // setFilteredCoinList(data);

  const [value, setValue] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    if (value === "") {
      setList(filteredCoinList);
      return;
    }
    const query = value.toLowerCase();
    setList(
      filteredCoinList?.filter((data) =>
        data?.short_name?.toLowerCase().includes(query) ||
        data?.currency?.toLowerCase().includes(query)
      )
    );
  }, [value, filteredCoinList]);

  return (
    <>
      <View
        style={{
          marginTop: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
          onPress={() => handleCheckboxChange("balance")}
        >
          <FastImage
            source={coinActive}
            style={{ width: 12, height: 12 }}
            resizeMode="contain"
            tintColor={hideAssets ? colors.buttonBg : colors.disabledText}
          />
          <AppText color={BLACK}>Hide 0 balances</AppText>
        </TouchableOpacity>
        <View style={[styles.searchView, { borderColor: theme === "Dark" ? "#FFFFFF33" : "#00000033" }]}>
          <FastImage
            source={searchIcon}
            tintColor={"#787878"}
            resizeMode="contain"
            style={{ width: 12, height: 12, paddingHorizontal: 10 }}
          />
          <TextInput
            value={value}
            onChangeText={(val) => setValue(val)}
            placeholder="Search"
            placeholderTextColor={"#787878"}
            style={{ fontSize: 10, alignItems: "center", height: 40, color: theme !== "Dark" ? "#000000" : "#FFFFFF" }}
          />
          {/* <AppText type={TEN} color={DISCLAIMTEXT}>
            Search
          </AppText> */}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
          alignItems: "center",
        }}
      >
        <AppText style={{ width: "34%" }} weight={SEMI_BOLD}>
          Coin
        </AppText>
        <AppText style={{ width: "22%" }} weight={SEMI_BOLD}>
          Available
        </AppText>
        <AppText style={{ width: "22%" }} weight={SEMI_BOLD}>
          In-Order
        </AppText>
        <AppText style={{ width: "22%" }} weight={SEMI_BOLD}>
          Total
        </AppText>
      </View>
      <FlatList
        data={value !== "" ? list : filteredCoinList}
        renderItem={({ item }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "34%",
                  // gap: 3,
                }}
              >
                <View style={{ borderRadius: 50, overflow: "hidden" }}>
                  <FastImage
                    source={{ uri: BASE_URL + item?.icon_path }}
                    style={{ width: 30, height: 30 }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ marginLeft: 5, flexShrink: 1 }}>
                  <AppText color={BLACK} weight={SEMI_BOLD}>
                    {item?.short_name}
                  </AppText>
                  <AppText type={TEN} color={DISCLAIMTEXT}>
                    {item?.currency}
                  </AppText>
                </View>
              </View>
              <AppText color={theme !== "Dark" ? DISCLAIMTEXT : BLACK} style={{ width: "22%" }}>
                {safeRound(item?.balance)}
              </AppText>
              <AppText color={theme !== "Dark" ? DISCLAIMTEXT : BLACK} style={{ width: "22%" }}>
                {safeRound(item?.locked_balance)}
              </AppText>
              <AppText color={theme !== "Dark" ? DISCLAIMTEXT : BLACK} style={{ width: "22%" }}>
                {safeRound(amount(item?.balance) + amount(item?.locked_balance))}
              </AppText>
              {/* <AppText color={BLACK} style={{width: "20%"}}>
                {item?.short_name === "USDT"
                  ? toFixedFive(item?.balance)
                  : toFixedFive(item?.balance * item?.price || 0)}
              </AppText> */}
            </View>
          );
        }}
        ListEmptyComponent={() => {
          return (
            <View style={{ alignItems: "center", marginTop: 100, gap: 10 }}>
              <FastImage source={NO_NOTIFICATION_ICON_LIGHT} style={{ width: 100, height: 100 }} resizeMode="contain" />
              {/* <AppText weight={SEMI_BOLD} type={FOURTEEN}>No Balance</AppText> */}

            </View>
          )
        }}
        style={{ height: "100%" }}
      />
      {/* <RBSheet
        ref={depsoitSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={360}
        animationType="none"
        customStyles={{
          container: {
            backgroundColor: colors.white,
            height: 350,
            borderTopRightRadius: 40,
            borderTopLeftRadius: 40,
          },
          wrapper: {
            backgroundColor: "#0006",
          },
          draggableIcon: {
            backgroundColor: "transparent",
          },
        }}
      >
        <DepositSheet />
      </RBSheet> */}
    </>
  );
};

export default WalletList;

const styles = StyleSheet.create({
  searchView: {
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // borderColor: "#00000033",
    width: "30%",
    borderRadius: 50,
    height: 25,
  },
});
