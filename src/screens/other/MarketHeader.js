import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity as RNTouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { searchIcon } from "../../helper/ImageAssets";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AppText, FOURTEEN, SEMI_BOLD } from "../../shared";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { useAppSelector } from "../../store/hooks";
import NavigationService from "../../navigation/NavigationService";
import { SEARCH_SCREEN } from "../../navigation/routes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = Math.max(14, SCREEN_WIDTH * 0.04);

const TABS = [
  { key: "Favourite", label: "Favourite" },
  { key: "Spot", label: "Spot" },
  { key: "Futures", label: "Futures" },
  { key: "Discover", label: "Discover" },
  { key: "MemeX", label: "MemeX" },
];

const MarketHeader = ({ activeTab, setActiveTab, search, onSearchChange, showSearch }) => {
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === "Dark";
  const textColor = isDark ? colors.white : colors.black;
  const placeholderColor = isDark ? "#6E6E6E" : "#9D9D9D";
  const tabInactiveColor = isDark ? "#9D9D9D" : "#666";

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.newThemeColor }]}>
      {/* Search bar - full width, reference style */}
      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.themeElevationColor : "#F0F0F0" }]}>
          <FastImage
            source={searchIcon}
            resizeMode="contain"
            style={styles.searchIcon}
            tintColor={placeholderColor}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search Coin Pairs"
            placeholderTextColor={placeholderColor}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>
      )}

      {!showSearch && (
        <TouchableOpacity
          onPress={() => NavigationService.navigate(SEARCH_SCREEN)}
          style={[styles.searchBar, { backgroundColor: isDark ? colors.themeElevationColor : "#F0F0F0" }]}
        >
          <FastImage source={searchIcon} resizeMode="contain" style={styles.searchIcon} tintColor={placeholderColor} />
          <AppText style={[styles.searchPlaceholder, { color: placeholderColor }]}>Search Coin Pairs</AppText>
        </TouchableOpacity>
      )}

      {/* Primary tabs - yellow underline for selected */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
        style={styles.tabsRow}
      >
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.8}
            >
              <AppText
                type={FOURTEEN}
                weight={SEMI_BOLD}
                style={[
                  styles.tabLabel,
                  { color: isActive ? textColor : tabInactiveColor },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {label}
              </AppText>
              {isActive && <View style={[styles.tabUnderline, { backgroundColor: colors.buttonBg }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 0,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  tabsRow: {
    maxHeight: 44,
  },
  tabsScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingRight: 24,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  tabActive: {},
  tabLabel: {
    fontSize: 14,
  },
  tabLabelActive: {
    fontWeight: "700",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 1,
  },
});

export default MarketHeader;
