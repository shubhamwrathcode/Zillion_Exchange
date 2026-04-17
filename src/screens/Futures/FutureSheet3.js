import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppText,
  BOLD,
  Button,
  EIGHTEEN,
  FIFTEEN,
  FOURTEEN,
  SEMI_BOLD,
  TEN,
} from "../../shared";
import { closeIcon, downIcon } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";
import Checkbox from "../../shared/components/Checkbox";
import { useAppSelector } from "../../store/hooks";
import { fontFamily } from "../../theme/typography";

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;
const STEP = 100;
const TRACK_HEIGHT = 4;
const KNOB_SIZE = 16;
const KNOB_TOUCH_SIZE = KNOB_SIZE + 16;
const TRACK_WRAPPER_HEIGHT = 44;
const AMOUNT_MARKERS = [0, 25, 50, 75, 100];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const FutureSheet3 = ({
  stopLoss,
  takeProfit,
  setStopLoss,
  setTakeProfit,
  onClose,
  onCloseDefault,
}) => {
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === "Dark";

  const [triggerPrice, setTriggerPrice] = useState(takeProfit);
  const [amountPercent, setAmountPercent] = useState(100);
  const [trackWidth, setTrackWidth] = useState(0);
  const [knobPosition, setKnobPosition] = useState(100);
  const [isSplitTarget, setIsSplitTarget] = useState(false);
  const [priceMode, setPriceMode] = useState(stopLoss);

  const knobPositionRef = useRef(0);

  const derivedPosition = useMemo(() => {
    if (!trackWidth) {
      return 0;
    }
    const ratio =
      (clamp(amountPercent, MIN_PERCENT, MAX_PERCENT) - MIN_PERCENT) /
      (MAX_PERCENT - MIN_PERCENT);
    return ratio * trackWidth;
  }, [amountPercent, trackWidth]);

  useEffect(() => {
    setKnobPosition(derivedPosition);
  }, [derivedPosition]);

  useEffect(() => {
    knobPositionRef.current = knobPosition;
  }, [knobPosition]);

  const updatePercent = (value) => {
    const normalized = clamp(
      Math.round(value / STEP) * STEP,
      MIN_PERCENT,
      MAX_PERCENT
    );
    setAmountPercent(normalized);
  };

  const labelColor = "#FFFFFF80";
  const surfaceColor = isDark ? "#2A2A2A" : "#EEF0F2";
  const borderColor = isDark ? "#3F3F3F" : "#DBDEE2";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.themeElevationColor },
      ]}
    >
      <View style={styles.header}>
        <AppText type={EIGHTEEN} weight={BOLD}>
          TP/SL
        </AppText>
        <TouchableOpacity style={styles.closeButton} onPress={onCloseDefault}>
          <FastImage
            source={closeIcon}
            style={{ width: 12, height: 12 }}
            tintColor={labelColor}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>



      <View style={styles.formSection}>
        <View style={styles.dualInputRow}>
          <View style={styles.inputColumn}>
            <View style={styles.labelRow}>
              <AppText type={FOURTEEN} style={{ color: labelColor }}>
                Take Profit (PnL)
              </AppText>
            </View>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: "#FFFFFF1A",
                  borderColor,
                },
              ]}
            >
              <TextInput
                value={takeProfit ?? ""}
                onChangeText={(text) => setTakeProfit(text)}
                placeholder="PnL"
                placeholderTextColor={colors.secondaryText}
                keyboardType="decimal-pad"
                style={[styles.textInput]}
              />
            </View>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.dualInputRow}>
            <View style={styles.inputColumn}>
              <View style={styles.labelRow}>
                <AppText type={FOURTEEN} style={{ color: labelColor }}>
                  Stop Loss (PnL)
                </AppText>
              </View>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: "#FFFFFF1A", borderColor },
                ]}
              >
                <TextInput
                  value={stopLoss} // keep it as string
                  style={[styles.textInput]}
                  placeholder="PnL"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => {
                    // Allow empty input
                    if (text === "") {
                      setStopLoss("");
                      return;
                    }

                    // Only allow valid number input (including decimals)
                    const numericValue = parseFloat(text);
                    if (!isNaN(numericValue) || text == "0") {
                      // Always keep negative
                      const formattedValue =
                        numericValue > 0
                          ? `-${numericValue}`
                          : `${numericValue}`;
                      setStopLoss(formattedValue);
                    } else {
                      // Ignore invalid characters
                      setStopLoss('');
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <Button
        children="Confirm"
        containerStyle={{ marginHorizontal: 20, marginTop: 20 }}
        onPress={onClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF30",
    borderRadius: 15,
    padding: 6,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#302F2F",
    borderTopWidth: 1,
    borderTopColor: "#302F2F",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#2F2F2F",
  },
  badgeText: {
    color: "#FFFFFF",
  },
  dualInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 20,
  },
  dualInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
  },
  inputColumn: {
    flex: 1,
  },
  priceSection: {
    marginTop: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dropdownToggle: {
    flexDirection: "row",
    // alignItems: "center",
    gap: 4,
  },
  dropdownIcon: {
    width: 12,
    height: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  inputBox: {
    // flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    justifyContent: "center",
    // paddingVertical: 10,
  },
  textInput: {
    fontSize: 14,
    fontFamily,
    color: colors.white,

  },
  amountBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  sliderContainer: {
    width: "100%",
    marginTop: 24,
  },
  trackWrapper: {
    height: TRACK_WRAPPER_HEIGHT,
    justifyContent: "center",
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  activeTrack: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    left: 0,
    top: (TRACK_WRAPPER_HEIGHT - TRACK_HEIGHT) / 2,
  },
  tickRow: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    left: 0,
    right: 0,
    paddingHorizontal: 2,
  },
  tick: {
    width: 12,
    height: 12,
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  knobTouchArea: {
    position: "absolute",
    width: KNOB_TOUCH_SIZE,
    height: KNOB_TOUCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -KNOB_TOUCH_SIZE / 2,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: 6,
    transform: [{ rotate: "45deg" }],
    borderWidth: 2,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
  },
});

export default FutureSheet3;
