import { View, StyleSheet, TextInput, Platform, TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import {
  avatarIcon,
  bell_ic,
  defaultPic,
  giftIcon,
  headPhoneIcon,
  searchIcon,
} from "../helper/ImageAssets";
import { colors } from "../theme/colors";
import NavigationService from "../navigation/NavigationService";
import { NOTIFICATION_SCREEN, SEARCH_SCREEN } from "../navigation/routes";
import { useAppSelector } from "../store/hooks";
import { IMAGE_BASE_URL } from "../helper/Constants";

const HeaderTop = ({theme}) => {
  const userData = useAppSelector((state) => state.auth.userData);
  return (
    <View style={styles.headerView}>
          
      <TouchableOpacity onPress={()=>NavigationService.navigate('ProfileDrawer')} style={{borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: colors.disclaimDarText}}>
      <FastImage
        source={userData?.profilepicture ? {uri: IMAGE_BASE_URL + userData?.profilepicture} : defaultPic}
        resizeMode="cover"
        style={{ width: 32, height: 32}}
      />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.searchView, {borderColor: theme === "Dark" ? "#FFFFFF33" : "#00000033"}]} onPress={() => NavigationService.navigate(SEARCH_SCREEN)}>
        <FastImage
          source={searchIcon}
          tintColor={'#787878'}
          resizeMode="contain"
          style={{ width: 15, height: 15, paddingHorizontal: 20 }}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor={"#787878"}
          style={{width:"80%", height: 40}}
          editable={false}
        />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <TouchableOpacity onPress={() => NavigationService.navigate(NOTIFICATION_SCREEN)}>
      <FastImage
          source={bell_ic}
          tintColor={theme === "Dark" ? colors.white : colors.white}
          resizeMode="contain"
          style={{ width: 27, height: 27 }}
        />
      </TouchableOpacity>
        
        <TouchableOpacity onPress={() => NavigationService.navigate("Support")}>
        <FastImage
          source={headPhoneIcon}
          tintColor={theme === "Dark" ? colors.white : colors.white}
          resizeMode="contain"
          style={{ width: 20, height: 20 }}
        />
        </TouchableOpacity>
       
      </View>
    </View>
  );
};

export default HeaderTop;

const styles = StyleSheet.create({
  headerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    alignItems: "center",
    marginVertical: 10,
    // paddingTop: Platform.OS === 'android' ? 40 : 42,
  },
  searchView: {
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    // borderColor: "#00000033",
    width: "65%",
    borderRadius: 50,
    height: 35,
  },
});
