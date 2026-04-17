import React, {useEffect} from 'react';

import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import FastImage from 'react-native-fast-image';

import {useDispatch, useSelector} from 'react-redux';
import {
  AppText,
  FOURTEEN,
  GREEN,
  NORMAL,
  SECOND,
  SEMI_BOLD,
  SEVENTEEN,
  TEN,
  TWELVE,
} from './AppText';
import {colors} from '../theme/colors';
import KeyBoardAware from './KeyboardAware';
import {
  Screen,
  borderWidth,
  universalPaddingHorizontal,
  universalPaddingHorizontalHigh,
} from '../theme/dimens';
import {
  arrowRightIcon,
  closeIcon,
  convertBg,
  right_ic,
} from '../helper/ImageAssets';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import TouchableOpacityView from './TouchableOpacityView';
import {BASE_URL} from '../helper/Constants';
import {Button} from './Button';
import {toFixedFive} from '../helper/utility';
import {swapToken} from '../actions/homeActions';
import NavigationService from '../navigation/NavigationService';
import { CONVERT_HISTORY_SCREEN } from '../navigation/routes';

const CoinList = ({onSelectCoin, hideCoin}) => {
  const coinData = useAppSelector(state => state.home.coinList);
  const handlePress = item => {
    onSelectCoin(item);
  };
  const renderItem = ({item, index}) => {
    return (
      <>
        {hideCoin !== item?.short_name && (
          <TouchableOpacityView
            key={item?._id}
            style={styles.container2}
            onPress={() => handlePress(item)}>
            <View style={{flexDirection: 'row'}}>
              <FastImage
                resizeMode="contain"
                style={styles.coinLogo}
                source={{uri: `${BASE_URL}${item.icon_path}`}}
              />
              <View style={{marginLeft: 10}}>
                <AppText>{item?.short_name}</AppText>
                <AppText type={TEN} color={SECOND}>
                  {item?.name}
                </AppText>
              </View>
            </View>
            <FastImage
              source={right_ic}
              resizeMode="contain"
              style={styles.rightIc}
            />
          </TouchableOpacityView>
        )}
      </>
    );
  };
  return coinData?.map((item, index) => {
    return renderItem({item, index});
  });
};

const RbSheet = ({rbref, name, setCoin, hideCoin, data}) => {
  const dispatch = useAppDispatch();
  const Conversion = useSelector(state => state.home.conversion);

  const onSelectCoin = item => {
    setCoin(item);
    rbref.current.close();
  };

  const handleConvert = () => {
    let temp = Number(Conversion) * Number(data?.coinQuantity);
    const _data = {
      base_currency: data?.coin1,
      quote_currency: data?.coin2,
      amount: data?.coinQuantity,
      swapped_amount: data?.firstPrice,
      side: 'SELL',
    };
    // dispatch(swapToken(_data));
    NavigationService.navigate(CONVERT_HISTORY_SCREEN)
    rbref.current.close();
  };
  return (
    <View>
      <RBSheet
        ref={rbref}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={name === 'dropdown' ? 700 : 360}
        animationType="none"
        customStyles={{
          container: {
            backgroundColor: 'transparent',
            height: name === 'dropdown' ? 700 : 360,
            borderRadius: 10,
          },
          wrapper: {
            backgroundColor: '#0006',
          },
          draggableIcon: {
            backgroundColor: 'transparent',
          },
        }}>
        {name === 'dropdown' ? (
          <KeyBoardAware style={[styles.container]}>
            <View style={styles.confirmOrder}>
              <AppText
                type={SEVENTEEN}
                weight={SEMI_BOLD}
                style={styles.headerText}>
                Select Currency
              </AppText>
              <TouchableOpacityView
                onPress={() => {
                  rbref?.current?.close();
                }}
                style={styles.closeView}>
                <FastImage
                  source={closeIcon}
                  tintColor={colors.secondaryText}
                  style={styles.closeIcon}
                />
              </TouchableOpacityView>
            </View>
            <View style={styles.coinListView}>
              <CoinList
                name={'selectCoin'}
                onSelectCoin={onSelectCoin}
                hideCoin={hideCoin}
              />
            </View>
          </KeyBoardAware>
        ) : (
          <View style={[styles.container,{backgroundColor:"#1C1B1B"}]}>
            <View style={[styles.confirmOrder,{backgroundColor:"#27282C"}]}>
              <AppText
                type={SEVENTEEN}
                weight={SEMI_BOLD}
                style={styles.headerText}>
               Payment Details
              </AppText>
              <TouchableOpacityView
                onPress={() => {
                  rbref?.current?.close();
                }}
                style={styles.closeView}>
                <FastImage
                  source={closeIcon}
                  tintColor={colors.secondaryText}
                  style={styles.closeIcon}
                />
              </TouchableOpacityView>
            </View>
            <View style={[styles.row1]}>
              <AppText type={FOURTEEN} color={SECOND}>
                Exchange
              </AppText>
              <View style={styles.fromTo}>
                <AppText color={SECOND} type={TWELVE}>
                  From
                </AppText>
                <AppText color={SECOND} type={TWELVE}>
                  To
                </AppText>
              </View>
            </View>
            {/* <ImageBackground
              source={convertBg}
              imageStyle={{
                resizeMode: 'contain',
              }}
              style={{
                height: 60,
                width: Screen.Width - universalPaddingHorizontalHigh,
                alignSelf: 'center',
                justifyContent: 'center',
              }}>
             
            </ImageBackground> */}
             <View style={styles.row2}>
                <View style={styles.currencyBox}>
                  <FastImage source={data?.img1} style={styles.coinImg} />
                  <View style={styles.rightBox}>
                    <AppText type={TWELVE} weight={NORMAL}>
                      {data?.coin1}
                    </AppText>
                    <AppText type={FOURTEEN} weight={SEMI_BOLD}>
                      {data?.coinQuantity}
                    </AppText>
                  </View>
                </View>
                <FastImage
                  source={arrowRightIcon}
                  style={styles.arrow}
                  tintColor={'#ffffff90'}
                />
                <View style={styles.currencyBox2}>
                  <View style={styles.rightBox2}>
                    <AppText type={TWELVE} weight={NORMAL}>
                      {data?.coin2}
                    </AppText>
                    <AppText type={FOURTEEN} weight={SEMI_BOLD}>
                      {toFixedFive(data?.firstPrice)}
                    </AppText>
                  </View>
                  <FastImage source={data?.img2} style={styles.coinImg} />
                </View>
              </View>
            <View style={[styles.row3,{backgroundColor:"#1C1B1B"}]}>
              <View style={styles.feeLine}>
                <View>
                  <AppText style={styles.rowThreeHeading}>
                    Transaction Fees
                  </AppText>
                </View>
                <View>
                  <AppText color={GREEN}>No Fees</AppText>
                </View>
              </View>
              <View style={styles.typeLine}>
                <View>
                  <AppText style={styles.rowThreeHeading}>Type</AppText>
                </View>
                <View>
                  <AppText>Market</AppText>
                </View>
              </View>
              <View style={styles.rateLine}>
                <View>
                  <AppText style={styles.rowThreeHeading}>Rate</AppText>
                </View>
                <View>
                  <AppText>
                    1 {data?.coin1} = {toFixedFive(Conversion)} {data?.coin2}
                  </AppText>
                </View>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                children="Cancel"
                containerStyle={styles.noButton}
                titleStyle={styles.buttonTitle}
                onPress={() => rbref.current.close()}
              />
              <Button
                children="Continue"
                onPress={() => handleConvert()}
                containerStyle={styles.yesButton}
                titleStyle={[styles.buttonTitle,{color:colors.black}]}
              />
            </View>

          </View>
        )}
      </RBSheet>
    </View>
  );
};

export default RbSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: borderWidth,
    borderColor: colors.inputBorder,
    paddingHorizontal: 0,
  },
  confirmOrder: {
    height: 52,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
  },
  headerText: {alignSelf: 'center', color: '#fff', marginTop: 4},
  closeView: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  closeIcon: {width: 12, height: 12, padding: 7},
  coinListView: {},
  row1: {marginTop: 20, marginHorizontal: 26},
  fromTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:12
  },
  currencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    marginStart: universalPaddingHorizontal,
    flex: 1,
  },
  currencyBox2: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    width: '45%',
    justifyContent: 'flex-end',
    marginEnd: universalPaddingHorizontal,
    flex: 1,
  },
  coinImg: {width: 31, height: 31},
  rightBox: {marginLeft: 10, marginTop: 4},
  rightBox2: {marginRight: 10, marginTop: 4, alignItems: 'flex-end'},
  row3: {
    flexDirection: 'column',
    marginHorizontal: universalPaddingHorizontal,
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: universalPaddingHorizontal,
    paddingVertical: 15,
    alignItems: 'center',
    // backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  feeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowThreeHeading: {color: '#ffffff50'},
  typeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rateLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  arrow: {width: 24, height: 24},

  row4: {
    flexDirection: 'row',
    marginHorizontal: 26,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btns: {width: '48%'},
  container2: {
    flexDirection: 'row',
    marginHorizontal: universalPaddingHorizontal,
    borderBottomColor: colors.inputBorder,
    borderBottomWidth: borderWidth,
    paddingVertical: universalPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinLogo: {
    height: 30,
    width: 30,
  },
  rightIc: {
    height: 15,
    width: 15,
  },
  noButton: {
    width:"30%",
    backgroundColor: '#1C1B1B',
    borderColor: colors.buttonBg,
    borderWidth: borderWidth,
    marginEnd: 10,
  },
  yesButton: {
    width:"30%",
    backgroundColor: colors.buttonBg,
    marginStart: 10,
  },
  buttonContainer: {
   
    width:'100%',
    flexDirection: 'row',
    justifyContent:"flex-end",
    marginTop: 20,
    marginBottom: 10,
    right: 20,
  },
  buttonTitle: {
    color: colors.white,
    fontSize: 14,
  },
});
