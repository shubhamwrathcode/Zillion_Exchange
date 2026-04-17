import React, { useState } from "react";
import {
  AppSafeAreaView,
  AppText,
  Button,
  FOURTEEN,
  Input,
  RED,
  SEMI_BOLD,
  TWELVE,
} from "../../shared";
import KeyBoardAware from "../../shared/components/KeyboardAware";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import { useKycForm } from "../../context/KycFormContext";
import NavigationService from "../../navigation/NavigationService";
import { KYC_STEP_FOUR_SCREEN } from "../../navigation/routes";
import { appBg, uploadIcon, checkIc, PHOTO_ID_MINI_ICON1, PHOTO_ID_MINI_ICON2, PHOTO_ID_MINI_ICON3, PHOTO_ID_VECTOR, KYC_IDENTITY } from "../../helper/ImageAssets";
import KycStepHeader from "./KycStepHeader";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { PictureModal } from "../../shared/components/PictureModal";
import ImageCropPicker from "react-native-image-crop-picker";
import { showError } from "../../helper/logger";

const accentColor = colors.white || "#F3BB2B";

const KycStepThree = () => {
  const [pictureModalVisible, setPictureModalVisible] = useState(false);
  const [pictureType, setPictureType] = useState("doc_front");

  const {
    theme,
    selectedCountry,
    modalCountry,
    getIdDocConfig,
    aadhar,
    handleDocumentNumberChange,
    documentNumberError,
    docFront,
    setDocFront,
    docBack,
    setDocBack,
    validateStep2,
  } = useKycForm();

  const cardBg =colors.themeElevationColor;
  const borderClr = theme === "Dark" ? "#3A3A3E" : "#E0E0E0";
  const textClr = theme === "Dark" ? colors.white : colors.black;

  const handleImagePick = (type) => {
    setPictureType(type);
    setPictureModalVisible(true);
  };

  const onPressCamera = () => {
    ImageCropPicker.openCamera({ multiple: false, mediaType: "photo", cropping: true, compressImageQuality: 0.8 })
      .then((image) => {
        if (image?.size < 5000000 && ["image/png", "image/jpeg", "image/jpg"].includes(image?.mime)) {
          const mime = image?.mime?.split("/");
          const photo = { uri: image.path, name: `${pictureType}_${image.modificationDate}.${mime[1]}`, type: image.mime };
          if (pictureType === "doc_front") setDocFront(photo);
          else if (pictureType === "doc_back") setDocBack(photo);
        } else {
          showError("Only JPEG, PNG & JPG formats and file size upto 5MB are supported");
        }
        setPictureModalVisible(false);
      })
      .catch(() => setPictureModalVisible(false));
  };

  const onPressGallery = () => {
    ImageCropPicker.openPicker({ multiple: false, mediaType: "photo", cropping: true, compressImageQuality: 0.8 })
      .then((image) => {
        if (image?.size < 5000000 && ["image/png", "image/jpeg", "image/jpg"].includes(image?.mime)) {
          const mime = image?.mime?.split("/");
          const photo = { uri: image.path, name: `${pictureType}_${image.modificationDate}.${mime[1]}`, type: image.mime };
          if (pictureType === "doc_front") setDocFront(photo);
          else if (pictureType === "doc_back") setDocBack(photo);
        } else {
          showError("Only JPEG, PNG & JPG formats and file size upto 5MB are supported");
        }
        setPictureModalVisible(false);
      })
      .catch(() => setPictureModalVisible(false));
  };

  const guidanceItems = [
    { title: "Align flat & centered", key: "align", image: PHOTO_ID_MINI_ICON1 },
    { title: "Hold steady, no blur", key: "blur", image: PHOTO_ID_MINI_ICON2 },
    { title: "Avoid glare & reflections", key: "glare", image: PHOTO_ID_MINI_ICON3 },
  ];

  const onNext = () => {
    if (!validateStep2()) return;
    NavigationService.navigate(KYC_STEP_FOUR_SCREEN);
  };

  return (
    <AppSafeAreaView source={theme !== "Dark" && appBg} style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
      <KeyBoardAware style={{ flex: 1 }}>
        <KycStepHeader title="Take a Photo of Your ID Card" theme={theme} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.stepBadge, { backgroundColor: theme === "Dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: accentColor }}>Step 3 of 6</AppText>
          </View>

          {/* Hero / Preview */}
          <View style={[styles.heroCard, { backgroundColor: cardBg }]}>
            <FastImage source={PHOTO_ID_VECTOR} resizeMode="contain" style={styles.heroImage} />
          </View>

          {/* Photo Tips */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: theme === "Dark" ? "#888" : "#666" }]}>Photo tips</AppText>
            <View style={styles.guidanceRow}>
              {guidanceItems.map((item) => (
                <View key={item.key} style={[styles.guidanceBox, { backgroundColor: colors.overlayColor }]}>
                  <FastImage source={item.image} resizeMode="contain" style={styles.guidanceImage} />
                  <AppText type={TWELVE} style={[styles.guidanceLabel, { color: theme === "Dark" ? "#AAA" : "#666" }]}>{item.title}</AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Your Selection */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: theme === "Dark" ? "#888" : "#666" }]}>Your selection</AppText>
            <View style={[styles.selectionRow, { backgroundColor: colors.overlayColor }]}>
              <AppText type={FOURTEEN} style={{ color: textClr }}>{selectedCountry?.flag || "🏳"} {selectedCountry?.label || modalCountry || "—"}</AppText>
              <View style={[styles.selectionDivider, { backgroundColor: borderClr }]} />
              <View style={styles.selectionRight}>
                <FastImage source={KYC_IDENTITY} resizeMode="contain" style={styles.idIcon} />
                <AppText type={FOURTEEN} style={{ color: textClr, marginLeft: 6 }}>{getIdDocConfig()?.label || "ID"}</AppText>
              </View>
            </View>
            <AppText type={TWELVE} style={[styles.helperText, { color: theme === "Dark" ? "#888" : "#666" }]}>
              Upload a valid ID matching your selection to avoid verification failure.
            </AppText>
          </View>

          {/* ID Number & Upload */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: theme === "Dark" ? "#888" : "#666" }]}>Document details</AppText>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>{getIdDocConfig()?.label || "ID"} Number <AppText color={RED}>*</AppText></AppText>
            <Input
              placeholder={(getIdDocConfig()?.label || "ID") + " Number"}
              value={aadhar}
              onChangeText={handleDocumentNumberChange}
              autoCapitalize="characters"
              containerStyle={[styles.input, { backgroundColor: colors.overlayColor, borderColor: colors.white }]}
              inputStyle={{ color: textClr }}
              placeholderTextColor={theme === "Dark" ? "#888" : "#999"}
            />
            {documentNumberError ? <AppText type={TWELVE} color={RED} style={{ marginBottom: 8 }}>{documentNumberError}</AppText> : null}
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr, marginTop: 4 }]}>Upload photos</AppText>
            <View style={styles.uploadRow}>
              <TouchableOpacityView onPress={() => handleImagePick("doc_front")} style={[styles.uploadBox, docFront ? styles.uploadBoxFilled : styles.uploadBoxEmpty, { backgroundColor: docFront ? (theme === "Dark" ? "#2A2A2E" : "#FFF") : "transparent", borderColor: docFront ? accentColor : borderClr }]}>
                {docFront ? (
                  <>
                    <FastImage source={{ uri: docFront.uri }} style={styles.uploadedImg} resizeMode="cover" />
                    <View style={[styles.uploadBadge, { backgroundColor: accentColor }]}>
                      <FastImage source={checkIc} resizeMode="contain" style={styles.uploadBadgeIcon} tintColor={colors.blueThemeColor} />
                    </View>
                  </>
                ) : (
                  <>
                    <FastImage source={PHOTO_ID_VECTOR} resizeMode="cover" style={styles.uploadPlaceholderBg} />
                    <View style={styles.uploadContent}>
                      <FastImage source={uploadIcon} tintColor={accentColor} resizeMode="contain" style={styles.uploadIcon} />
                      <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textClr }}>Front Side</AppText>
                      <AppText type={TWELVE} style={{ color: theme === "Dark" ? "#888" : "#999", marginTop: 2 }}>Tap to upload</AppText>
                    </View>
                  </>
                )}
              </TouchableOpacityView>
              <TouchableOpacityView onPress={() => handleImagePick("doc_back")} style={[styles.uploadBox, docBack ? styles.uploadBoxFilled : styles.uploadBoxEmpty, { backgroundColor: docBack ? (theme === "Dark" ? "#2A2A2E" : "#FFF") : "transparent", borderColor: docBack ? accentColor : borderClr }]}>
                {docBack ? (
                  <>
                    <FastImage source={{ uri: docBack.uri }} style={styles.uploadedImg} resizeMode="cover" />
                    <View style={[styles.uploadBadge, { backgroundColor: accentColor }]}>
                      <FastImage source={checkIc} resizeMode="contain" style={styles.uploadBadgeIcon} tintColor={colors.blueThemeColor} />
                    </View>
                  </>
                ) : (
                  <>
                    <FastImage source={PHOTO_ID_VECTOR} resizeMode="cover" style={styles.uploadPlaceholderBg} />
                    <View style={styles.uploadContent}>
                      <FastImage source={uploadIcon} tintColor={accentColor} resizeMode="contain" style={styles.uploadIcon} />
                      <AppText type={FOURTEEN} weight={SEMI_BOLD} style={{ color: textClr }}>Back Side</AppText>
                      <AppText type={TWELVE} style={{ color: theme === "Dark" ? "#888" : "#999", marginTop: 2 }}>{getIdDocConfig()?.requires_back_image ? "Required" : "Optional"}</AppText>
                    </View>
                  </>
                )}
              </TouchableOpacityView>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button children="Next" onPress={onNext} containerStyle={styles.nextBtn} />
        </View>
      </KeyBoardAware>
      <PictureModal isVisible={pictureModalVisible} onBackButtonPress={() => setPictureModalVisible(false)} onPressCamera={onPressCamera} onPressGallery={onPressGallery} isFront={false} />
    </AppSafeAreaView>
  );
};

export default KycStepThree;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  stepBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  heroImage: { width: "100%", minHeight: 100 },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: { marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8 },
  guidanceRow: { flexDirection: "row", gap: 10 },
  guidanceBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guidanceImage: { width: 56, height: 64, marginBottom: 8 },
  guidanceLabel: { textAlign: "center", fontSize: 11 },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
  },
  selectionDivider: { width: 1, height: 20, marginHorizontal: 12 },
  selectionRight: { flexDirection: "row", alignItems: "center", flex: 1 },
  idIcon: { width: 20, height: 20 },
  helperText: { marginTop: 10, lineHeight: 18 },
  fieldLabel: { marginBottom: 6, letterSpacing: 0.2 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, marginBottom: 4 },
  uploadRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  uploadBox: {
    flex: 1,
    height: 140,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  uploadBoxEmpty: { borderWidth: 2, borderStyle: "dashed" },
  uploadBoxFilled: { borderWidth: 2, borderStyle: "solid" },
  uploadPlaceholderBg: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", opacity: 0.2 },
  uploadContent: { alignItems: "center", justifyContent: "center", zIndex: 1 },
  uploadIcon: { width: 32, height: 32, marginBottom: 8 },
  uploadedImg: { width: "100%", height: "100%" },
  uploadBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBadgeIcon: { width: 14, height: 14 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "transparent",
  },
  nextBtn: {
    backgroundColor: colors.buttonBg,
    borderRadius: 28,
    ...Platform.select({
      ios: { shadowColor: accentColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
});
