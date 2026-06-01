import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Modal, Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_AUTH_STACK } from '../../navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APK_BASE_URL, BASE_URL, SELECTED_LANGUAGE, USER_TOKEN_KEY } from '../../helper/Constants';
import { commonStyles } from '../../theme/commonStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { AppSafeAreaView } from '../../shared';
import { getUserProfile } from '../../actions/accountActions';
import { translate } from 'google-translate-api-x';
import { languages } from '../../helper/languages';
import { setLanguages, setSelectedLanguage } from '../../slices/accountSlice';
import { getVersion } from 'react-native-device-info';
import { getAppVersion } from '../../actions/authActions';
import { splashTwo, updatedSplashDark } from '../../helper/ImageAssets';

const AuthLoading = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.auth.theme);
  const [CheckCurrent] = useState(getVersion());
  const appVersion = useAppSelector((state) => state.auth.appVersion);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [versionCheckDone, setVersionCheckDone] = useState(false);
  const proceededRef = useRef(false);

  // 1) Fetch server version (silent — no full-screen loader on splash).
  // useEffect(() => {
  //   dispatch(getAppVersion({ silent: true })).finally(() => {
  //     setVersionCheckDone(true);
  //   });
  // }, [dispatch]);

  // 2) After fetch settles: force-update if server `version` !== installed build; else continue boot.
  useEffect(() => {
    // if (!versionCheckDone || proceededRef.current) return;

    // const serverVersion =
    //   appVersion && typeof appVersion === 'object' && appVersion.version != null
    //     ? String(appVersion.version).trim()
    //     : null;
    // const current = String(CheckCurrent || '').trim();

    // if (serverVersion && current !== serverVersion) {
    //   setShowUpdateModal(true);
    //   return;
    // }

    // proceededRef.current = true;

    checkUserLogin();
    checkLanguage();


  }, [versionCheckDone, appVersion, CheckCurrent]);


  const success = () => {
    setTimeout(() => {
      dispatch(getUserProfile(false, true));
    }, 3000);
  };

  const onnFail = () => {
    setTimeout(() => {
      NavigationService.reset(NAVIGATION_AUTH_STACK);
    }, 2000);
  };

  const checkUserLogin = async () => {
    try {
      const customerToken = await AsyncStorage.getItem(USER_TOKEN_KEY);
      customerToken ? success() : onnFail();
    } catch (e) {
      console.log(e);
    }
  };

  const checkLanguage = async () => {
    try {
      const language = await AsyncStorage.getItem(SELECTED_LANGUAGE);
      if (language) {
        const res = await translate(languages, {
          from: "en",
          to: language,
        });
        dispatch(setLanguages(res));
        dispatch(setSelectedLanguage(language));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const downloadApk = () => {
    const v = appVersion && typeof appVersion === 'object' ? appVersion : null;
    if (!v) return;
    /** API: `data.apk` = relative path (e.g. `apk/apk-xxx.apk`) or full URL — boss: tap Update → latest APK download */
    const raw = v.apk || v.download_url || v.android_url;
    const iosUrl = v.ios_url || v.app_store_url || v.ios_link;
    if (Platform.OS === 'ios' && iosUrl) {
      console.log('[AuthLoading] iOS update URL:', iosUrl);
      Linking.openURL(iosUrl).catch((e) => console.error(e));
      return;
    }
    if (!raw) return;
    const baseForApk =
      APK_BASE_URL != null && String(APK_BASE_URL).trim() !== ''
        ? String(APK_BASE_URL).replace(/\/$/, '')
        : String(BASE_URL).replace(/\/$/, '');
    const url = String(raw).startsWith('http')
      ? String(raw)
      : `${baseForApk}/${String(raw).replace(/^\//, '')}`;
    console.log('[AuthLoading] APK download URL (Update tapped):', url);
    Linking.openURL(url).catch((error) => {
      console.error('Error opening download link:', error);
    });
  };

  const exitApp = () => {
    BackHandler.exitApp();
  };

  // Block Android back while update modal is open (force update).
  useEffect(() => {
    if (!showUpdateModal) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [showUpdateModal]);

  return (
    <AppSafeAreaView source={theme === 'Dark' ? updatedSplashDark : splashTwo}>
      <View style={commonStyles.center}>
        {/* Your logo or loader can go here */}
      </View>

      <Modal
        transparent
        visible={showUpdateModal}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => { }}
      >
        <View style={styles.fullScreen}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Update required</Text>
            <Text style={styles.message}>
              Your version ({CheckCurrent}) does not match the latest release ({appVersion?.version ?? ''}).{"\n\n"}
              {Platform.OS === 'ios'
                ? 'Tap Update to open the App Store and install the latest build.'
                : 'Tap Update — the latest APK will download (link from server).'}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.updateBtn} onPress={downloadApk}>
                <Text style={styles.updateText}>{Platform.OS === 'ios' ? 'Update' : 'Update (download APK)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exitBtn} onPress={exitApp}>
                <Text style={styles.exitText}>Exit App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppSafeAreaView>
  );
};

export default AuthLoading;

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updateBtn: {
    flex: 1,
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  updateText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  exitBtn: {
    flex: 1,
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
});
