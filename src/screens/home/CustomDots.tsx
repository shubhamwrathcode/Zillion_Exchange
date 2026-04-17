import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../../theme/colors';

interface CustomDotsProps {
  index: number;
  activeIndex: number;
}

const CustomDots = ({index, activeIndex}: CustomDotsProps) => {
  return (
    <View style={[styles.dot, index === activeIndex && styles.activeDot]} />
  );
};

const styles = StyleSheet.create({
  dot: {
    height: 6,
    width: 6,
    backgroundColor: colors.white,
    borderRadius: 50,
    marginRight: 4,
    marginTop:10
  },
  activeDot: {
    width: 15,
    backgroundColor: colors.white,
  },
});
export default CustomDots;
