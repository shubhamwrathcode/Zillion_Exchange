import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  AppText,
  BOLD,
  Button,
  EIGHT,
  EIGHTEEN,
  FIFTEEN,
  FOURTEEN,
  SEMI_BOLD,
  TEN,
  TWELVE,
} from "../../shared";
import { closeIcon } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import { colors } from "../../theme/colors";

const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 100;
const STEP = 1;
const TRACK_HEIGHT = 4;
const KNOB_SIZE = 18;
const KNOB_TOUCH_SIZE = KNOB_SIZE + 16;
const TRACK_WRAPPER_HEIGHT = 36;
const LEVERAGE_MARKERS = [1, 20, 40, 60, 80, 100];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sanitizeLeverage = (value, fallback = MIN_LEVERAGE) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return clamp(numeric, MIN_LEVERAGE, MAX_LEVERAGE);
};

const AdjustLeverage = ({ onSelectLeverage, leverage, onClose }) => {
  const [leverageState, setLeverageState] = useState(() =>
    sanitizeLeverage(leverage)
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const [knobPosition, setKnobPosition] = useState(0);

  const knobPositionRef = useRef(0);
  const panStartX = useRef(0);

  const derivedPosition = useMemo(() => {
    if (!trackWidth) {
      return 0;
    }
    const ratio =
      (clamp(leverageState, MIN_LEVERAGE, MAX_LEVERAGE) - MIN_LEVERAGE) /
      (MAX_LEVERAGE - MIN_LEVERAGE);
    return ratio * trackWidth;
  }, [leverageState, trackWidth]);

  useEffect(() => {
    setLeverageState((prev) => sanitizeLeverage(leverage, prev));
  }, [leverage]);

  useEffect(() => {
    setKnobPosition(derivedPosition);
  }, [derivedPosition]);

  useEffect(() => {
    knobPositionRef.current = knobPosition;
  }, [knobPosition]);

  const updateLeverage = (nextValue) => {
    const normalized = sanitizeLeverage(
      Math.round(Number(nextValue) / STEP) * STEP,
      leverageState
    );
    setLeverageState(normalized);
    onSelectLeverage(normalized);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          panStartX.current = knobPositionRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!trackWidth) {
            return;
          }
          const nextPos = clamp(
            panStartX.current + gestureState.dx,
            0,
            trackWidth
          );
          const rawValue =
            MIN_LEVERAGE +
            (nextPos / trackWidth) * (MAX_LEVERAGE - MIN_LEVERAGE);
          setKnobPosition(nextPos);
          updateLeverage(rawValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!trackWidth) {
            return;
          }
          const nextPos = clamp(
            panStartX.current + gestureState.dx,
            0,
            trackWidth
          );
          const rawValue =
            MIN_LEVERAGE +
            (nextPos / trackWidth) * (MAX_LEVERAGE - MIN_LEVERAGE);
          updateLeverage(rawValue);
        },
      }),
    [trackWidth]
  );

  const handleTrackLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  };

  const handleDecrease = () => {
    updateLeverage(leverageState - STEP);
  };

  const handleIncrease = () => {
    updateLeverage(leverageState + STEP);
  };

  return (
    <View style={{ flex: 1, backgroundColor:colors.themeElevationColor }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <AppText type={EIGHTEEN} weight={BOLD}>
            Adjust Leverage
          </AppText>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={{
            borderWidth: 1,
            borderColor: "#FFFFFF80",
            borderRadius: 15,
            padding: 5,
          }}
        >
          <FastImage
            source={closeIcon}
            style={{ width: 12, height: 12 }}
            tintColor={"#FFFFFF80"}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.stepContainer}>
        <TouchableOpacity
          onPress={handleDecrease}
          style={styles.stepButton}
          activeOpacity={0.7}
        >
          <AppText style={styles.stepButtonLabel}>-</AppText>
        </TouchableOpacity>
        <AppText style={{ color: "#FFFFFF" }} type={FIFTEEN}>
          {`${leverageState}x`}
        </AppText>
        <TouchableOpacity
          onPress={handleIncrease}
          style={styles.stepButton}
          activeOpacity={0.7}
        >
          <AppText style={styles.stepButtonLabel}>+</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <View
          style={styles.trackWrapper}
          onLayout={handleTrackLayout}
        >
          <View style={styles.track} />
          <View
            style={[
              styles.activeTrack,
              { width: Math.max(knobPosition, 0) },
            ]}
          />
          <View style={styles.tickRow}>
            {LEVERAGE_MARKERS.map((marker) => {
              const isActive = leverageState >= marker;
              return (
                <View
                  key={marker}
                  style={[
                    styles.tick,
                    isActive && styles.tickActive,
                  ]}
                />
              );
            })}
          </View>
          <View
            {...panResponder.panHandlers}
            style={[
              styles.knobTouchArea,
              {
                left: knobPosition,
                top: (TRACK_WRAPPER_HEIGHT - KNOB_TOUCH_SIZE) / 2,
              },
            ]}
          >
            <View style={styles.knob} />
          </View>
        </View>

        <View style={styles.labelRow}>
          {LEVERAGE_MARKERS.map((marker) => {
            const isActive = leverageState >= marker;
            return (
              <TouchableOpacity
                key={marker}
                onPress={() => updateLeverage(marker)}
                activeOpacity={0.7}
                style={styles.labelHitSlop}
              >
                <AppText
                  type={TEN}
                  style={[
                    styles.labelText,
                    isActive && styles.labelTextActive,
                  ]}
                >
                  {`${marker}x`}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* <View style={{marginTop: 20}}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF80",
              width: 4,
              height: 4,
              borderRadius: 50,
            }}
          ></View>
          <AppText type={TEN} style={{color: "#FFFFFF80"}}>
            Maximum Position at current leverageState: 100,000,000 USDT
          </AppText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF80",
              width: 4,
              height: 4,
              borderRadius: 50,
            }}
          ></View>
          <AppText type={TEN} style={{color: "#FFFFFF80"}}>
          Please note that leverageState Changing will also apply for open positions
          and Open orders.
          </AppText>
        </View>
      </View> */}

      <Button
        children="Confirm"
        containerStyle={{ marginHorizontal: 20, marginTop: 20 }}
        onPress={onClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    borderWidth: 1,
    borderColor: "#3F3F3F",
    borderRadius: 5,
    paddingHorizontal: 20,
    height: 40,
    marginVertical: 15,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF1A",
    width: "90%",
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF12",
  },
  stepButtonLabel: {
    color: "#FFFFFF80",
    fontSize: 16,
  },
  sliderContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  trackWrapper: {
    height: TRACK_WRAPPER_HEIGHT,
    justifyContent: "center",
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: "#3F3F3F",
  },
  activeTrack: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.buttonDarkBg,
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
    paddingHorizontal: 1,
  },
  tick: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3F3F3F",
    transform: [{ rotate: "45deg" }],
  },
  tickActive: {
    backgroundColor: colors.buttonDarkBg,
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
    backgroundColor: colors.buttonDarkBg,
    borderWidth: 2,
    borderColor: "#1D1D1D",
    transform: [{ rotate: "45deg" }],
  },
  labelRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelText: {
    color: "#FFFFFF66",
  },
  labelTextActive: {
    color: colors.white,
  },
  labelHitSlop: {
    paddingVertical: 4,
  },
});

export default AdjustLeverage;
