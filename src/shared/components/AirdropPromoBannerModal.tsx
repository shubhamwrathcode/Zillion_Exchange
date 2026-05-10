import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import ReactNativeModal from "react-native-modal";
import FastImage from "react-native-fast-image";
import NavigationService from "../../navigation/NavigationService";
import { AIRDROP_SCREEN } from "../../navigation/routes";
import { zillionBanner, closeIcon } from "../../helper/ImageAssets";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";

interface AirdropPromoBannerModalProps {
  enabled?: boolean;
}

const { width } = Dimensions.get("window");

const AirdropPromoBannerModal: React.FC<AirdropPromoBannerModalProps> = ({ enabled = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [closedThisVisit, setClosedThisVisit] = useState(false);
  const isFocused = useIsFocused();
  const { colors: themeColors, isDark } = useTheme();

  useEffect(() => {
    if (!enabled) return;

    if (isFocused && !closedThisVisit) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isFocused, closedThisVisit, enabled]);

  const dismissModal = () => {
    setIsVisible(false);
    setClosedThisVisit(true);
  };

  const onBannerClick = () => {
    dismissModal();
    NavigationService.navigate(AIRDROP_SCREEN);
  };

  if (!enabled) return null;

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={dismissModal}
      onBackButtonPress={dismissModal}
      backdropOpacity={0.7}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={styles.modalContainer}
    >
      <View style={[styles.contentContainer, { backgroundColor: isDark ? "#1C2230" : "#FFFFFF" }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={dismissModal} style={[styles.closeButton, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
            <FastImage source={closeIcon} style={[styles.closeIcon, { tintColor: themeColors.text }]} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={onBannerClick} style={styles.imageWrapper}>
          <FastImage
            source={zillionBanner}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  closeIcon: {
    width: 12,
    height: 12,
  },
  imageWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    aspectRatio: 1.2, // Adjusted for a more typical banner aspect ratio
    borderRadius: 16,
  },
});

export default AirdropPromoBannerModal;
