/* eslint-disable react-native/no-inline-styles */
import React, {ReactNode} from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  View,
  ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appBg, HOME_BG, mainBg} from '../helper/ImageAssets';
import {commonStyles} from '../theme/commonStyles';
import { colors } from '../theme/colors';

interface AppSafeAreaViewProps {
  children: ReactNode;
  style?: ViewStyle;
  source?: any;
  backgroundColor?: any;
  isfrom?: any;
}

const AppSafeAreaView = ({children, style, source, backgroundColor, isfrom}: AppSafeAreaViewProps) => {
  return Platform.OS === 'ios' ? (
    <SafeAreaView
      edges={['right', 'left']}
      style={[
        {
          flex: 1,
        },
        style,
      ]}>
      <StatusBar
        translucent
        backgroundColor={colors.newThemeColor}
        barStyle="light-content"
      />
      <ImageBackground
        source={source ? source : HOME_BG}
        style={commonStyles.screenSize}
        // resizeMethod="auto"
        resizeMode="cover">
        {children}
      </ImageBackground>
    </SafeAreaView>
  ) : (
    <View style={[{flex: 1}, style]}>
      <StatusBar
        translucent={false}
        backgroundColor={colors.newThemeColor}
        barStyle="light-content"
      />
      <ImageBackground
        source={source ? source : undefined}
        style={commonStyles.screenSize}
        // resizeMethod="auto"
        resizeMode="cover">
        {children}
      </ImageBackground>
    </View>
  );
};
export {AppSafeAreaView};
