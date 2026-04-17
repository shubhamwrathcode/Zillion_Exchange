import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { AppSafeAreaView, AppText, Button } from '../../shared';
import { colors } from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import { back_ic } from '../../helper/ImageAssets';
import { getPasskeyList } from '../../actions/accountActions';
import { ADD_PASSKEY_SCREEN } from '../../navigation/routes';

const ViewPasskeysScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const [passkeys, setPasskeys] = useState([]);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isDark = theme === 'Dark';
  const textPrimary = isDark ? colors.white : colors.black;
  const textSecondary = isDark ? '#888' : '#666';

  useEffect(() => {
    (async () => {
      const res = await dispatch(getPasskeyList());
      if (res?.data?.passkeys) setPasskeys(res.data.passkeys);
    })();
  }, [dispatch]);

  return (
    <AppSafeAreaView style={{ flex: 1, backgroundColor: colors.newThemeColor }}>
      <View style={[styles.header, { borderBottomColor: isDark ? colors.dividerColor : colors.secondBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <FastImage source={back_ic} style={styles.backIcon} tintColor={textPrimary} resizeMode="contain" />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: textPrimary }]}>Registered Passkeys</AppText>
        <View></View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { backgroundColor: colors.themeElevationColor }]}>
          <AppText style={[styles.title, { color: textPrimary }]}>Registered Passkeys</AppText>
          <AppText style={[styles.subtitle, { color: textSecondary }]}>Manage your passkeys for passwordless login</AppText>
          {passkeys.length > 0 ? (
            <ScrollView style={styles.passkeyList} showsVerticalScrollIndicator={false}>
              {passkeys.map((passkey) => (
                <View key={passkey._id} style={[styles.passkeyItem, { backgroundColor: isDark ? '#2F3542' : '#E8E8E8' }]}>
                  <View style={styles.passkeyItemLeft}>
                    <AppText style={[styles.passkeyName, { color: textPrimary }]}>{passkey.name || 'Passkey'}</AppText>
                    <AppText style={[styles.passkeyDevice, { color: textSecondary }]}>
                      {passkey.deviceInfo?.browser || 'Unknown'} • {passkey.deviceInfo?.os || 'Unknown'}
                    </AppText>
                    {(passkey.createdAt || passkey.lastUsedAt) && (
                      <AppText style={[styles.passkeyDate, { color: textSecondary }]}>
                        {passkey.createdAt && `Added ${new Date(passkey.createdAt).toLocaleDateString()}`}
                        {passkey.lastUsedAt && ` • Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`}
                      </AppText>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.passkeyEmpty}>
              <AppText style={[styles.passkeyEmptyText, { color: textSecondary }]}>No passkeys registered yet</AppText>
            </View>
          )}
          <Button
            children="Add New Passkey"
            onPress={() => navigation.navigate(ADD_PASSKEY_SCREEN)}
            containerStyle={styles.btn}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingHorizontal:20
  },
  backBtn: { padding: 4 },
  backIcon: { width: 22, height: 22 },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  content: { borderRadius: 16, padding: 24 },
  title: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  passkeyList: { maxHeight: 400 },
  passkeyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  passkeyItemLeft: {},
  passkeyName: { fontSize: 15, fontWeight: '600' },
  passkeyDevice: { fontSize: 13, marginTop: 4 },
  passkeyDate: { fontSize: 12, marginTop: 4 },
  passkeyEmpty: { paddingVertical: 32, alignItems: 'center' },
  passkeyEmptyText: { fontSize: 14 },
  btn: { marginTop: 24 },
});

export default ViewPasskeysScreen;
