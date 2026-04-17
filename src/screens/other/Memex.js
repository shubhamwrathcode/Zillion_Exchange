import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  AppText,
  BLACK,
  DISCLAIMTEXT,
  EIGHT,
  ELEVEN,
  FIFTEEN,
  GREEN,
  NINE,
  RED,
  SEMI_BOLD,
  SIXTEEN,
  TEN,
} from "../../shared";
import FastImage from "react-native-fast-image";
import { discoverIcon, meme1, meme2, meme3 } from "../../helper/ImageAssets";
import { colors } from "../../theme/colors";
import { useEffect, useState } from "react";
import { getMemeList } from "../../actions/homeActions";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL } from "../../helper/Constants";
import { toFixedFive, toFixedFour, toFixedThree } from "../../helper/utility";
import NavigationService from "../../navigation/NavigationService";
import MemexSkeleton from "./MemexSkeleton";
import { WALLET_SCREEN } from "../../navigation/routes";
import { setMemeList } from "../../slices/homeSlice";

const Memex = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector(state => state.auth.theme);
  const memeList = useAppSelector((state) => state.home.memeList);
  const [contentLoading, setContentLoading] = useState(true);

  // Always show skeleton on every mount/revisit and only hide it once the fresh
  // API fetch completes. This prevents cached Redux data from bypassing the skeleton.
  useEffect(() => {
    setContentLoading(true);
    // Clear stale list so skeleton shows full grid, not a flash of old cards
    dispatch(setMemeList([]));
    dispatch(getMemeList()).finally(() => {
      setContentLoading(false);
    });
  }, []);

  const handleNavigate = (item) => {
    NavigationService.navigate(WALLET_SCREEN, { coinDetail: item });
  };

  return (
    <View style={{  }}>
      {contentLoading ? (
        <MemexSkeleton />
      ) : (
        <>
      <View
        style={{
          marginVertical: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 16
        }}
      >
        <FastImage
          source={discoverIcon}
          resizeMode="contain"
          style={{ width: 22, height: 22 }}
        />
        <AppText color={BLACK} type={SIXTEEN} weight={SEMI_BOLD}>
          MemeX
        </AppText>
      </View>
      <AppText color={DISCLAIMTEXT} type={ELEVEN} style={{ textAlign: 'left',marginHorizontal:20 }}>
        Your easiest way to early on-chain investment opportunities!
      </AppText>
      <View style={{ marginVertical: 10,marginHorizontal:16,elevation:5}}>
      <FlatList
        data={memeList}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        columnWrapperStyle={{flexDirection: "row",  marginTop: 10, gap: 6}}
        // contentContainerStyle={styles.rawContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={[styles.cardDarkiew]} onPress={() => handleNavigate(item)}>
            <View style={{borderRadius: 10, overflow: "hidden"}}>
            <FastImage
              source={{uri: BASE_URL+item?.icon_path}}
              resizeMode="cover"
              style={{ width: '100%', height: 110 }}
            />
            </View>
            
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <Text style={[styles.cell, {color: theme !== "Dark" ? "#000" : "#fff"}]}>
              {item?.base_currency}
              <Text style={{ fontWeight: "400", color: "#9D9D9D" }}>
                /{item?.quote_currency}
              </Text>
            </Text>
              {/* <AppText color={BLACK} type={NINE}>
              {item?.base_currency_fullname}
              </AppText> */}
            </View>
            {/* <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
              {item?.volume?.toFixed(1)}
              </AppText>
            </View> */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
              {toFixedFive(item?.buy_price)}
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={item?.change_percentage < 0 ? RED : GREEN} type={NINE}>
              {item?.change_percentage > 0 && '+'}{toFixedThree(item?.change_percentage)}%
              </AppText>
            </View>
          </TouchableOpacity>
          
        )}
      />
        {/* <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: 10}}>
        <View style={styles.cardView}>
            <FastImage
              source={meme1}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme2}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={RED} type={NINE}>
                -2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme3}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
        </View> */}
        {/* <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: 10}}>
        <View style={styles.cardView}>
            <FastImage
              source={meme1}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme2}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={RED} type={NINE}>
                -2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme3}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
        </View>
        <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: 10}}>
        <View style={styles.cardView}>
            <FastImage
              source={meme1}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme2}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={RED} type={NINE}>
                -2.00%
              </AppText>
            </View>
          </View>
          <View style={styles.cardView}>
            <FastImage
              source={meme3}
              resizeMode="contain"
              style={{ width: '100%', height: 105 }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                USDT
              </AppText>
              <AppText color={BLACK} type={NINE}>
                dogwifhat
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Volume
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Price
              </AppText>
              <AppText color={BLACK} type={NINE}>
                09
              </AppText>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 5 }}
            >
              <AppText color={BLACK} type={NINE}>
                Change
              </AppText>
              <AppText color={GREEN} type={NINE}>
                +2.00%
              </AppText>
            </View>
          </View>
        </View> */}
      </View>
        </>
      )}
    </View>
  );
};

export default Memex;

const styles = StyleSheet.create({
  cardView: {
    backgroundColor: colors.white,
    shadowColor: "#00000026",
    shadowOpacity: 1,
    width: "32%",
    paddingVertical: 6,
    borderRadius: 8,
    paddingHorizontal:6,
    elevation:5,
    borderWidth: 1,
    borderColor: colors.buttonBg
  },
  cardDarkiew: {
    backgroundColor: colors.themeElevationColor,
    width: "32%",
    paddingVertical: 6,
    borderRadius: 8,
    paddingHorizontal:6,
    // borderWidth: 1,
    // borderColor: colors.buttonBg
  },
  cell: {
    fontSize: 11,
    fontWeight: "700",
  },
});
