import FastImage from "react-native-fast-image";
import { AppText, BLACK, ELEVEN, SIXTEEN, SEMI_BOLD } from "../../shared";
import { discoverIcon } from "../../helper/ImageAssets";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import MarketList from "./MarketList";
import NavigationService from "../../navigation/NavigationService";
import { WALLET_SCREEN } from "../../navigation/routes";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/colors";

const DiscoverMarket = ({ coinPairs }) => {
  const theme = useAppSelector((state) => state.auth.theme);
  const [activeTab, setActiveTab] = useState("Gainer");
  const isDark = theme === "Dark";
  const tabTextColor = (selected) => (selected ? colors.white : (isDark ? "#9D9D9D" : "#666"));
  const tabBg = (selected) => (selected ? colors.themeElevationColor : "transparent");
  const [filterData, setFilterData] = useState([]);

  // 🔥 Auto-update filterData whenever coinPairs or activeTab changes
  useEffect(() => {
    handleFilterData(activeTab);
  }, [coinPairs, activeTab]);

  const handleFilterData = (tab = "Gainer") => {
    setActiveTab(tab);

    if (!coinPairs || coinPairs.length === 0) {
      setFilterData([]);
      return;
    }

    if (tab === "Gainer") {
      let data = [...coinPairs].sort(
        (a, b) => b.change_percentage - a.change_percentage
      );
      setFilterData(data);
    } else if (tab === "Loser") {
      let data = [...coinPairs].sort(
        (a, b) => a.change_percentage - b.change_percentage
      );
      setFilterData(data);
    } else if (tab === "Listing") {
      let data = [...coinPairs].reverse();
      setFilterData(data);
    }
  };

  const handleNavigate = (item) => {
    NavigationService.navigate(WALLET_SCREEN, { coinDetail: item });
  };

  return (
    <>
      <View
        style={{
          marginVertical: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: 16,
        }}
      >
        <FastImage
          source={discoverIcon}
          resizeMode="contain"
          style={{ width: 22, height: 22 }}
        />
        <AppText color={BLACK} type={SIXTEEN} weight={SEMI_BOLD}>
          Discover
        </AppText>
      </View>

      <View>
        <View style={styles.mainTabView}>
          <TouchableOpacity
            style={[styles.tabView, { backgroundColor: tabBg(activeTab === "Gainer") }]}
            onPress={() => handleFilterData("Gainer")}
          >
            <AppText color={tabTextColor(activeTab === "Gainer")} weight={SEMI_BOLD} type={ELEVEN}>
              Top Gainer
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabView, { backgroundColor: tabBg(activeTab === "Loser") }]}
            onPress={() => handleFilterData("Loser")}
          >
            <AppText color={tabTextColor(activeTab === "Loser")} weight={SEMI_BOLD} type={ELEVEN}>
              Top Loser
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabView, { backgroundColor: tabBg(activeTab === "Listing") }]}
            onPress={() => handleFilterData("Listing")}
          >
            <AppText color={tabTextColor(activeTab === "Listing")} weight={SEMI_BOLD} type={ELEVEN}>
              New Listing
            </AppText>
          </TouchableOpacity>
        </View>

        <MarketList filterData={filterData} onPress={handleNavigate} />
      </View>
    </>
  );
};

export default DiscoverMarket;

const styles = StyleSheet.create({
  mainTabView: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    paddingHorizontal: 8,
    marginBottom: 20,
    gap: 12,
    marginHorizontal: 11,
  },
  tabView: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
