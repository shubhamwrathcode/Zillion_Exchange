import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  AppSafeAreaView,
  AppText,
  Button,
  OtpInput6Digit,
} from '../../shared';
import { colors } from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import { back_ic } from '../../helper/ImageAssets';
import { confirm2fa, getUserProfile } from '../../actions/accountActions';
import { showError } from '../../helper/logger';
import { SpinnerSecond } from '../../shared/components/SpinnerSecond';

const CODE_LENGTH = 6;

const VerifyAuthenticatorCodeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const showButtonLoading = useAppSelector((state) => state.auth.isLoading && state.auth.loadingFor !== 'otp');
  const theme = useAppSelector((state) => state.auth.theme);
  const isDark = theme === 'Dark';

  const [authenticatorCode, setAuthenticatorCode] = useState('');

  const textPrimary = isDark ? colors.white : '#222';
  const textSecondary = isDark ? colors.descText : '#666';

  const handleEnable = async () => {
    if (!authenticatorCode || authenticatorCode.length !== CODE_LENGTH) {
      showError('Please enter a valid 6-digit code from your authenticator app');
      return;
    }
    const success = await dispatch(confirm2fa(authenticatorCode));
    if (success) {
      await dispatch(getUserProfile());
      navigation.pop(2);
    }
  };

  return (
    <AppSafeAreaView style={[styles.container, { backgroundColor: colors.newThemeColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FastImage source={back_ic} style={styles.backIcon} tintColor={colors.white} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <AppText style={[styles.title, { color: textPrimary }]}>Verify Setup</AppText>
            <AppText style={[styles.subtitle, { color: textSecondary }]}>
              Step 3: Enter the 6-digit code from your Google Authenticator app to complete setup.
            </AppText>
            <OtpInput6Digit
              label="Authenticator Code"
              value={authenticatorCode}
              onChangeText={setAuthenticatorCode}
              isDark={isDark}
            />
            <Button
              children="Enable Google Authenticator"
              onPress={handleEnable}
              loading={showButtonLoading}
              containerStyle={styles.btn}
              disabled={isLoading || authenticatorCode.length !== CODE_LENGTH}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SpinnerSecond />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { width: 20, height: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  content: { borderRadius: 16, overflow: 'hidden' },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2, marginHorizontal: 2 },
  subtitle: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  btn: { marginTop: 24 },
});

export default VerifyAuthenticatorCodeScreen;
