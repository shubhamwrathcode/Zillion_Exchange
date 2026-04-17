import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Easing, Dimensions} from 'react-native';
import {useAppSelector} from '../store/hooks';
import {APP_LOGO} from '../helper/ImageAssets';

interface SpinnerSecondProps {
  loading?: boolean;
}

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');

const SpinnerSecond = ({loading}: SpinnerSecondProps) => {
  const isLoading = useAppSelector(state => state.auth.isLoading);
  const loadingFor = useAppSelector(state => state.auth.loadingFor);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const shouldShow = (isLoading || loading) && loadingFor !== 'otp';

  useEffect(() => {
    if (!shouldShow) {
      scaleValue.setValue(1);
      return;
    }
    const ease = Easing.bezier(0.4, 0, 0.2, 1);
    const zoomIn = Animated.timing(scaleValue, {
      toValue: 1.05,
      duration: 700,
      easing: ease,
      useNativeDriver: true,
    });
    const zoomOut = Animated.timing(scaleValue, {
      toValue: 0.96,
      duration: 700,
      easing: ease,
      useNativeDriver: true,
    });
    const animation = Animated.loop(
      Animated.sequence([zoomIn, zoomOut]),
    );
    animation.start();
    return () => animation.stop();
  }, [shouldShow, scaleValue]);

  const scale = scaleValue;

  return (
    <>
      {shouldShow ? (
        <View style={[styles.spinnerStyle, {width: WINDOW_WIDTH, height: WINDOW_HEIGHT}]}>
          <Animated.Image
            source={APP_LOGO}
            style={[styles.logo, {transform: [{scale}]}]}
            resizeMode="contain"
          />
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  spinnerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  logo: {
    width: 65,
    height: 65,
  },
});

export {SpinnerSecond};
