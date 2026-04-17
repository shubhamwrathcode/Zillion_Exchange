import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import FastImage from 'react-native-fast-image';
import { colors } from '../theme/colors';
import { AppText, BLACK } from './AppText';
import { closeIcon } from '../helper/ImageAssets';

const formatWalletLabel = (item) => {
  if (item == null) return '';
  const raw = typeof item === 'string' ? item : (item?.value ?? item?.label ?? item?.id ?? '');
  if (!raw || typeof raw !== 'string') return '';
  const lower = raw.toLowerCase();
  if (lower === 'p2p') return 'P2P';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const EarningDropdown = ({ data = [], onSelect, selected, theme }) => {
  const sheetRef = useRef(null);

  const handleSelect = (item) => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const openSheet = () => {
    sheetRef.current?.open();
  };

  return (
    <View>
      <TouchableOpacity style={styles.dropdown} onPress={openSheet}>
        <AppText color={colors.white}>
          {selected ? formatWalletLabel(selected) : 'Select Payment Wallet'}
        </AppText>
      </TouchableOpacity>

      <RBSheet
        ref={sheetRef}
        height={320}
        closeOnDragDown
        closeOnPressMask
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: colors.sheetColor,
            paddingBottom: 24,
          },
          wrapper: { backgroundColor: 'rgba(0,0,0,0.6)' },
          draggableIcon: { backgroundColor: colors.dividerColor },
        }}
      >
        <View style={styles.sheetHeader}>
          <AppText style={styles.sheetTitle}>Select Payment Wallet</AppText>
          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <FastImage
              source={closeIcon}
              style={styles.closeIcon}
              tintColor={colors.white}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.sheetDivider} />
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={styles.option}
              activeOpacity={0.7}
            >
              <AppText color={colors.white}>{formatWalletLabel(item)}</AppText>
            </TouchableOpacity>
          )}
        />
      </RBSheet>
    </View>
  );
};

export default EarningDropdown;

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 12,
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.themeElevationColor,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.dividerColor,
    marginHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerColor,
  },
});
