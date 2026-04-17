import { useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from "react-native";
import FastImage from "react-native-fast-image";
import {
  AppText,
  Button,
  Input,
  SEMI_BOLD,
  SIXTEEN,
  AppSafeAreaView,
  Toolbar,
  FOURTEEN,
  TEN,
  ELEVEN,
  WHITE,
  BLACK,
  TWELVE,
  FIFTEEN
} from "../../shared";
import NavigationService from "../../navigation/NavigationService";
import { colors } from "../../theme/colors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ticketMessages } from "../../actions/accountActions";
import moment from "moment";
import { back_ic, BACK_ICON, folder, Send_Img, copyIcon } from "../../helper/ImageAssets";
import { showSuccess } from "../../helper/logger";

const TicketScreen = () => {
  const route = useRoute();
  const dispatch = useAppDispatch();
  const flatListRef = React.useRef(null);
  const theme = useAppSelector((state) => state.auth.theme);
  const userTickets = useAppSelector((state) => state.home.userTickets);
  const userData = useAppSelector((state) => state.auth.userData);
  const chatData = route?.params?.data;

  // Get user initial for avatar (same as web logic)
  const getUserInitial = () => {
    if (userData?.first_name) {
      return userData.first_name.charAt(0).toUpperCase();
    }
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    if (userData?.emailId) {
      return userData.emailId.charAt(0).toUpperCase();
    }
    return "U";
  };

  const userInitial = getUserInitial();

  // Find the latest chat object from Redux to ensure we see new messages
  const chat = userTickets?.find(t => t._id === chatData?._id) || chatData;
  const messages = chat?.ticket || [];

  const [message, setMessage] = useState("");

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isUser = item.replyBy === 1;
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.supportRow]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.overlayColor }]}>
            <AppText weight={SEMI_BOLD} type={TEN} style={{ color: colors.buttonBg }}>{item?.name ? item.name.charAt(0).toUpperCase() : "T"}</AppText>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.supportBubble,
          { backgroundColor: isUser ? colors.overlayColor : colors.overlayColor }
        ]}>
          <AppText style={{ color: isUser ? colors.white : colors.white }} type={ELEVEN}>
            {item.query}
          </AppText>
          <AppText
            style={[styles.timestamp, { color: isUser ? colors.white : colors.white }]}
            type={TEN}
          >
            {moment(item.createdAt).format("hh:mm A")}
          </AppText>
        </View>
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.overlayColor }]}>
            <AppText weight={SEMI_BOLD} type={TEN} style={{ color: colors.buttonBg }}>{userInitial}</AppText>
          </View>
        )}
      </View>
    );
  };

  const handleTicketMessages = () => {
    if (!message.trim()) return;
    let data = {
      replyBy: 1,
      query: message.trim(),
      ticket_id: chat?._id,
    }
    console.log("Sending Ticket Message Payload:", data);
    dispatch(ticketMessages(data, () => setMessage("")))
  }

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    showSuccess("Ticket Id Copied!");
  };

  return (
    <AppSafeAreaView style={styles.container}>
      {/* <Toolbar isLogo={false} title={`TICKET #${chat?.ticketId}`} isSecond /> */}
      <View style={{ width: '100%', flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, marginTop: 10, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => NavigationService.goBack()}>
          <FastImage source={back_ic} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor={colors.white} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity onPress={() => copyToClipboard(chat?.ticketId)}>
            <FastImage source={copyIcon} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor={colors.secondaryText} />
          </TouchableOpacity>
          <AppText weight={SEMI_BOLD} type={FIFTEEN} style={{ color: colors.white }}>{chat?.ticketId}</AppText>

        </View>

        <View style={{ width: 20 }} />
      </View>
      <View style={styles.content}>
        {/* Ticket Details summary card */}
        <View style={[styles.detailCard, { backgroundColor: colors.themeElevationColor }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <AppText type={TEN} color={colors.secondaryText}>Created On</AppText>
              <AppText weight={SEMI_BOLD} type={ELEVEN} style={{ marginTop: 2, color: colors.white }}>
                {moment(chat?.createdAt).format('DD/MM/YYYY')}
              </AppText>
            </View>
            <View style={[styles.detailCol, { alignItems: 'flex-end' }]}>
              <AppText type={TEN} color={colors.secondaryText}>Priority</AppText>
              <View style={[styles.priorityBadge, { backgroundColor: colors.buttonBg + '20' }]}>
                <AppText weight={SEMI_BOLD} type={TEN} style={{ color: colors.buttonBg, textTransform: 'capitalize' }}>
                  {chat?.priority || "Medium"}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <AppText type={TEN} color={colors.secondaryText}>Subject</AppText>
              <AppText weight={SEMI_BOLD} type={ELEVEN} style={{ marginTop: 2, color: colors.white }}>{chat?.subject}</AppText>
            </View>
            <View style={[styles.detailCol, { alignItems: 'flex-end' }]}>
              <AppText type={TEN} color={colors.secondaryText}>Category</AppText>
              <AppText weight={SEMI_BOLD} type={ELEVEN} style={{ marginTop: 2, color: colors.white, textTransform: 'capitalize' }}>
                {chat?.category?.replace(/_/g, ' ')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Chat List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}

        />
      </View>

      {/* Footer */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {chat?.status?.toLowerCase() === "open" ? (
          <View style={[styles.inputContainer, { backgroundColor: colors.themeElevationColor }]}>
            <Input
              placeholder="Type your message..."
              multiline
              numberOfLines={3}
              mainContainer={{ flex: 1, backgroundColor: 'transparent' }}
              value={message}
              onChangeText={(val) => setMessage(val)}
              containerStyle={{ borderWidth: 0 }}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { opacity: message.trim() ? 1 : 0.5 }]}
              disabled={!message.trim()}
              onPress={handleTicketMessages}
            >
              <FastImage source={Send_Img} style={{ width: 22, height: 22 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.closedFooter}>
            <AppText color={colors.secondaryText} type={ELEVEN}>This ticket is {chat?.status}.</AppText>
          </View>
        )}
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
};

export default TicketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.newThemeColor,
  },
  content: {
    flex: 1,
  },
  detailCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dividerColor,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailCol: {
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.dividerColor,
    marginVertical: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  supportRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  supportBubble: {
    borderBottomLeftRadius: 2,
  },
  timestamp: {
    marginTop: 4,
    alignSelf: 'flex-end',
    fontSize: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.dividerColor,
    gap: 10,
  },
  sendBtn: {
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closedFooter: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  noDataRow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  noDataText: {
    color: colors.secondaryText,
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
