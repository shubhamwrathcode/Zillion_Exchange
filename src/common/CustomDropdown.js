import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { AppText, ELEVEN, FOURTEEN, SEMI_BOLD, TEN, THIRD, THIRTEEN, TWELVE, WHITE } from './AppText';
import FastImage from 'react-native-fast-image';
import { DOWN_ARROW, tick } from '../helper/ImageAssets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomDropdown = ({ data = [], onSelect, selected, theme }) => {
  const [visible, setVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
  };

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPos({
        top: y + height + 5,
        left: x,
        width: width,
      });
      setVisible(true);
    });
  };

  // Logic to determine if we should show the placeholder style
  const isPlaceholder = !selected || selected.toLowerCase().includes("select");

  return (
    <View>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.dropdownTrigger}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <AppText
          type={THIRTEEN}
          style={{
            flex: 1,
            color: isPlaceholder ? colors.disabledText : colors.white
          }}
        >
          {selected || 'Select option'}
        </AppText>
        <FastImage
          source={DOWN_ARROW}
          style={[styles.arrow, { transform: [{ rotate: visible ? '180deg' : '0deg' }] }]}
          tintColor={colors.white}
          resizeMode='contain'
        />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme === "Dark" ? colors.overlayColor : colors.white,
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }
            ]}
          >
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.option,
                    { borderBottomColor: theme === "Dark" ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }
                  ]}
                >
                  <AppText
                    type={ELEVEN}
                    style={{ color: theme === "Dark" ? colors.white : colors.black }}
                    weight={selected === item ? SEMI_BOLD : undefined}
                  >
                    {item}
                  </AppText>
                  {selected === item && (
                    <FastImage source={tick} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor={colors.buttonBg} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.overlayColor,
  },
  arrow: {
    width: 11,
    height: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    position: 'absolute',
    borderRadius: 16,
    paddingVertical: 8,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
});
