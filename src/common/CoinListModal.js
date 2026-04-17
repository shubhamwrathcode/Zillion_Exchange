import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import { BASE_URL } from "../helper/Constants";
import { AppText, BLACK, BOLD, DISCLAIMTEXT, SEMI_BOLD } from "./AppText";
import FastImage from "react-native-fast-image";
import { toFixedFive } from "../helper/utility";
import { showError } from "../helper/logger";
import Ionicons from "react-native-vector-icons/Ionicons";
import { closeIcon, NO_NOTIFICATION_ICON, searchIcon } from "../helper/ImageAssets";
import { colors } from "../theme/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const CoinListModal = ({ visible, data, onSelect, theme, onClose, disabledCoinId }) => {
  const [searchText, setSearchText] = useState("");
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // clear search when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchText("");
    }
  }, [visible]);

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible]);

  // filter list based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(
      (item) =>
        item?.short_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item?.currency?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, data]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    const translate = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [0, SCREEN_HEIGHT],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY: translate }, { scale: scale.value }],
    };
  });

  const handleClose = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    scale.value = withTiming(0.9, { duration: 200 });
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const renderCoinItem = ({ item, index }) => {
    const isDisabled = item?.currency_id === disabledCoinId;
    return (
      <AnimatedTouchableOpacity
        entering={FadeInDown.delay(index * 30).duration(200).springify()}
        layout={Layout.springify()}
        activeOpacity={0.7}
        style={[
          styles.coinItem,
          {
            backgroundColor: colors.themeElevationColor,
            opacity: isDisabled ? 0.4 : 1,
          },
        ]}
        onPress={() => {
          if (isDisabled) {
            showError("Same coin can't be swap.");
            return;
          }
          onSelect(item);
          handleClose();
        }}
      >
        <View style={styles.coinLeft}>
          <AnimatedView
            entering={FadeIn.delay(index * 50 + 100).duration(300)}
            style={[
              styles.coinIconContainer,
              {
                borderColor: theme === "Dark" 
                  ? "rgba(255,255,255,0.1)" 
                  : "rgba(0,0,0,0.08)",
              },
            ]}
          >
            <FastImage
              source={{ uri: BASE_URL + item?.icon_path }}
              style={styles.coinIcon}
              resizeMode="cover"
            />
          </AnimatedView>
          <View style={styles.coinInfo}>
            <AppText
              color={BLACK}
              style={styles.coinShortName}
              weight={SEMI_BOLD}
            >
              {item?.short_name}
            </AppText>
            <AppText color={DISCLAIMTEXT} style={styles.coinCurrency}>
              {item?.currency}
            </AppText>
          </View>
        </View>
        <View style={styles.coinRight}>
          <AppText 
            color={BLACK} 
            style={[
              styles.coinBalance,
              { color: theme === "Dark" ? "#fff" : "#000" }
            ]}
          >
            {toFixedFive(item?.balance)}
          </AppText>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <AnimatedView style={[styles.overlay, backdropStyle]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <AnimatedView
              style={[
                styles.modalContent,
                modalStyle,
                {
                  backgroundColor:colors.newThemeColor,
                },
              ]}
            >
              <View style={styles.header}>
                <AppText 
                  style={[
                    styles.title,
                    { color: theme === "Dark" ? "#fff" : "#000" }
                  ]} 
                  weight={BOLD}
                > 
                  Select Currency
                </AppText>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme === "Dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                   <FastImage source={closeIcon} resizeMode="contain" style={{width: 15, height: 15}} tintColor={theme !== "Dark" ? colors.black : colors.white}/>
                </TouchableOpacity>
              </View>

              <Animated.View
                entering={FadeInDown.delay(100).duration(400).springify()}
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor:colors.themeElevationColor,
                  },
                ]}
              >
                 <FastImage source={searchIcon} resizeMode="contain" 
                 style={{width: 20, height: 20}} 
                 tintColor={"#666"}/>
                <TextInput
                  placeholder="Search currency..."
                  placeholderTextColor={theme === "Dark" ? "#666" : "#999"}
                  value={searchText}
                  onChangeText={setSearchText}
                  style={[
                    styles.searchInput,
                    {
                      color: theme === "Dark" ? "#fff" : "#000",
                    },
                  ]}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText("")}
                    style={styles.clearButton}
                  >
                   <FastImage source={closeIcon} 
                   resizeMode="contain" 
                   style={{width: 15, height: 15}} 
                   tintColor={"#666"}/>
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* Coin List */}
              {filteredData.length === 0 ? (
                <Animated.View
                  entering={FadeIn.delay(200).duration(300)}
                  style={styles.noResultContainer}
                >
                <FastImage source={NO_NOTIFICATION_ICON} resizeMode="contain" style={{width: 80, height: 80}} 
                tintColor={colors.white}/>
                </Animated.View>
              ) : (
                <FlatList
                  data={filteredData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderCoinItem}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </AnimatedView>
          </TouchableWithoutFeedback>
        </AnimatedView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.65,
    width: "100%",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    minHeight: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  coinItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 8,
  },
  coinLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  coinIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1.5,
  },
  coinIcon: {
    width: "100%",
    height: "100%",
  },
  coinInfo: {
    flex: 1,
  },
  coinShortName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  coinCurrency: {
    fontSize: 12,
    opacity: 0.6,
  },
  coinRight: {
    alignItems: "flex-end",
  },
  coinBalance: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  noResultContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});

export default CoinListModal;
