import React, { useEffect, useState } from "react";
import {
  AppSafeAreaView,
  AppText,
  BLACK,
  Button,
  SECOND,
  SEMI_BOLD,
  TEN,
  THIRTEEN,
  Toolbar,
  TWELVE,
  YELLOW,
} from "../../shared";
import {
  FlatList,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
} from "react-native";
import { commonStyles } from "../../theme/commonStyles";
import {
  universalPaddingHorizontal,
  universalPaddingHorizontalHigh,
} from "../../theme/dimens";
import { useAppSelector } from "../../store/hooks";
import moment from "moment";
import { colors } from "../../theme/colors";
import { checkValue } from "../../helper/utility";
import {
  appBg,
  loginDarkBg,
  bell_ic,
  externalLinkIcon,
  HomeBg,
  folder,
  NO_NOTIFICATION_ICON,
} from "../../helper/ImageAssets";
import { useDispatch } from "react-redux";
import { getNotificationList, markAsRead } from "../../actions/homeActions";
import FastImage from "react-native-fast-image";
import NotificationSkeleton from "./NotificationSkeleton";

const ListEmptyComponent = () => {
  return (
    <View style={commonStyles.center}>
      <FastImage
        source={NO_NOTIFICATION_ICON}
        resizeMode="contain"
        style={{ width: 80, height: 80 }}
      />
      {/* <AppText color={BLACK} weight={SEMI_BOLD}>
        {"No New Notifications"}
      </AppText> */}
    </View>
  );
};

const Notification = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector((state) => state.auth.theme);
  const notificationList = useAppSelector(
    (state) => state.home.notificationList
  );
  const languages = useAppSelector((state) => {
    return state.account.languages;
  });
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    dispatch(getNotificationList());
  }, []);

  useEffect(() => {
    if (Array.isArray(notificationList)) {
      setContentLoading(false);
    }
  }, [notificationList]);

  const handleMarkAsRead = (id) => {
    dispatch(
      markAsRead({
        notificationId: id,
      })
    );
  };
  // console.log(notificationList[0]?.link, "notificationList");
  const renderItem = ({ item }) => {
    return (
      <View
        style={[
          styles.renderContainer,
          {
            backgroundColor:colors.themeElevationColor,
          },
        ]}
      >
        <View style={styles.renderContainerSecond}>
          <View style={styles.renderContainerThird}>
            {/* <View style={{flexDirection: "row", gap: 10}}> */}

            <AppText weight={SEMI_BOLD} type={THIRTEEN}>
              <View
                style={{
                  backgroundColor: item?.isSeen ? colors.grey : colors.green,
                  width: 10,
                  height: 10,
                  borderRadius: 50,
                }}
              ></View>{" "}
              {item.title}
            </AppText>
            {/* </View> */}

            {/* {item?.message?.length > 0 &&
              item?.message?.map(e => {
                return <AppText type={TWELVE}>{e?.description}</AppText>;
              })} */}

            <AppText type={TWELVE}>{item?.message}</AppText>
            {/* {!item?.isSeen &&  <AppText type={TWELVE} color={YELLOW}>Mark as read</AppText>} */}
            <View style={{ gap: 10, marginTop: 5 }}>
              {item?.link && (
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                  onPress={() => {
                    Linking.openURL(item?.link);
                  }}
                >
                  <AppText type={TWELVE} color={YELLOW}>
                    Learn more
                  </AppText>
                  <FastImage
                    source={externalLinkIcon}
                    resizeMode="contain"
                    style={{ width: 10, height: 10 }}
                    tintColor={colors.buttonBg}
                  />
                </TouchableOpacity>
              )}

              {!item?.isSeen && (
                <Button
                  children={"Mark as read"}
                  titleStyle={{ color: colors.white, fontSize: 10 }}
                  containerStyle={{ width: "35%", height: 30 }}
                  onPress={() => handleMarkAsRead(item?._id)}
                />
              )}

              <AppText color={BLACK} type={TWELVE} weight={SEMI_BOLD}>
                {moment(item.createdAt).fromNow()}
              </AppText>
            </View>

            {/* <View style={{flexDirection: 'row'}}>
                    <Button
                      children={'Learn more'}
                      titleStyle={{color: colors.white, fontSize: 10}}
                      containerStyle={{width: '30%', height: 30}}
                      onPress={() => {
                        Linking.openURL(item?.Link);
                      }}
                    />
                  </View> */}
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: colors.newThemeColor }}>
      <Toolbar
        isSecond
        title={checkValue(languages?.notification_one)}
        style={{ width: "62%" }}
      />
      {contentLoading ? (
        <NotificationSkeleton />
      ) : (
        <FlatList
          data={notificationList}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={commonStyles.flexGrow}
        />
      )}
    </AppSafeAreaView>
  );
};

export default Notification;
const styles = StyleSheet.create({
  renderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: universalPaddingHorizontal,
    marginVertical: universalPaddingHorizontal,
    borderWidth: 0.4,
    borderRadius: 20,
    borderColor: "#00000033",
    // backgroundColor: colors.offWhite,
  },
  icon: {
    height: 50,
    width: 50,
    marginEnd: 10,
  },
  renderContainerSecond: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  renderContainerThird: {
    // flex: 1,
  },
});
