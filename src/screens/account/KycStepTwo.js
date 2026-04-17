import React from "react";
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
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { colors } from "../../theme/colors";
import PickerSelect from "../../shared/components/PickerSelect";
import { useKycForm } from "../../context/KycFormContext";
import NavigationService from "../../navigation/NavigationService";
import { KYC_STEP_THREE_SCREEN } from "../../navigation/routes";
import { appBg } from "../../helper/ImageAssets";
import DateTimePicker from "react-native-modal-datetime-picker";
import KycStepHeader from "./KycStepHeader";

const accentColor = colors.white || "#F3BB2B";

const KycStepTwo = () => {
  const {
    theme,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    infoDob,
    setInfoDob,
    showDobPicker,
    setShowDobPicker,
    dobPickerClosedAt,
    gender,
    setGender,
    address,
    setAddress,
    city,
    setCity,
    infoState,
    setInfoState,
    zipCode,
    setZipCode,
    validateStep1,
  } = useKycForm();

  const cardBg = colors.themeElevationColor;
  const borderClr = theme === "Dark" ? colors.white : "#E0E0E0";
  const textClr = theme === "Dark" ? colors.white : colors.black;
  const inputWrap = { backgroundColor: cardBg, borderColor: borderClr };
  const genderOptions = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];

  const onNext = () => {
    if (!validateStep1()) return;
    NavigationService.navigate(KYC_STEP_THREE_SCREEN);
  };

  return (
    <AppSafeAreaView source={theme !== "Dark" && appBg} style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
      <KeyBoardAware style={{ flex: 1 }}>
        <KycStepHeader title="Personal Details" theme={theme} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.stepBadge, { backgroundColor: theme === "Dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={{ color: accentColor }}>Step 2 of 6</AppText>
          </View>

          {/* Personal Info Section */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: theme === "Dark" ? "#888" : "#666" }]}>Personal information</AppText>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>First Name <AppText color={RED}>*</AppText></AppText>
            <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>Last Name <AppText color={RED}>*</AppText></AppText>
            <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>Date of Birth <AppText color={RED}>*</AppText></AppText>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (Date.now() - dobPickerClosedAt.current < 500) return;
                setShowDobPicker(true);
              }}
            >
              <Input
                placeholder="DD/MM/YYYY"
                value={infoDob}
                editable={false}
                containerStyle={[styles.input, inputWrap]}
                inputStyle={{ color: textClr }}
                placeholderTextColor={theme === "Dark" ? "#888" : "#999"}
              />
            </TouchableOpacity>
            <DateTimePicker
              isVisible={showDobPicker}
              mode="date"
              date={infoDob && infoDob.includes("/") ? (() => { 
                const parts = infoDob.split("/"); 
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])); 
              })() : (infoDob ? new Date(infoDob) : (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; })())}
              maximumDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; })()}
              minimumDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return d; })()}
              onConfirm={(date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                setInfoDob(`${day}/${m}/${y}`);
                dobPickerClosedAt.current = Date.now();
                setShowDobPicker(false);
              }}
              onCancel={() => {
                dobPickerClosedAt.current = Date.now();
                setShowDobPicker(false);
              }}
              isDarkModeEnabled={theme === "Dark"}
            />
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>Gender <AppText color={RED}>*</AppText></AppText>
            <PickerSelect
              data={genderOptions}
              selected={gender}
              onSelect={(item) => setGender(item?.value ?? item)}
              theme={theme}
              placeholder="Select Gender"
              style={[styles.input, inputWrap]}
            />
          </View>

          {/* Address Section */}
          <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
            <AppText type={TWELVE} weight={SEMI_BOLD} style={[styles.sectionTitle, { color: theme === "Dark" ? "#888" : "#666" }]}>Address</AppText>
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>Address <AppText color={RED}>*</AppText></AppText>
            <Input placeholder="Full address (min 10 characters)" value={address} onChangeText={setAddress} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
            <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>City <AppText color={RED}>*</AppText></AppText>
            <Input placeholder="City" value={city} onChangeText={setCity} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
            <View style={styles.row2}>
              <View style={styles.halfField}>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>State <AppText color={RED}>*</AppText></AppText>
                <Input placeholder="State" value={infoState} onChangeText={setInfoState} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
              </View>
              <View style={styles.halfField}>
                <AppText type={FOURTEEN} weight={SEMI_BOLD} style={[styles.fieldLabel, { color: textClr }]}>Zip <AppText color={RED}>*</AppText></AppText>
                <Input placeholder="Zip Code" value={zipCode} onChangeText={setZipCode} containerStyle={[styles.input, inputWrap]} inputStyle={{ color: textClr }} placeholderTextColor={theme === "Dark" ? "#888" : "#999"} />
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button children="Next" onPress={onNext} containerStyle={styles.nextBtn} />
        </View>
      </KeyBoardAware>
    </AppSafeAreaView>
  );
};

export default KycStepTwo;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  stepBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: { marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.8 },
  fieldLabel: { marginBottom: 6, letterSpacing: 0.2 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48, marginBottom: 14,},
  row2: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
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
      ios: {
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
});
