import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { AppText, TWELVE, SEMI_BOLD } from "./AppText";
import { colors } from "../../theme/colors";
import { useTheme } from "../../hooks/useTheme";

const SUGGESTED_DOMAINS = [
  "@gmail.com",
  "@yahoo.com",
  "@outlook.com",
  "@hotmail.com",
  "@icloud.com",
];

const EmailDomainSuggestions = ({
  value = "",
  onSelect = () => {},
  containerStyle,
}) => {
  const { isDark } = useTheme();

  if (!value || typeof value !== "string" || !value.includes("@")) {
    return null;
  }

  const atIndex = value.indexOf("@");
  const localPart = value.slice(0, atIndex);
  const typedDomain = value.slice(atIndex).toLowerCase(); // e.g. "@g" or "@"

  if (!localPart.trim()) {
    return null;
  }

  // Filter suggestions matching the typed domain
  const filtered = SUGGESTED_DOMAINS.filter((domain) =>
    domain.startsWith(typedDomain)
  );

  // If already exactly matches one of the full domains, hide suggestions
  if (filtered.length === 1 && filtered[0] === typedDomain) {
    return null;
  }

  const domainsToShow = filtered.length > 0 ? filtered : SUGGESTED_DOMAINS;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.scrollContent}
      >
        {domainsToShow.map((domain) => (
          <TouchableOpacity
            key={domain}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(30, 86, 245, 0.08)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(30, 86, 245, 0.25)",
              },
            ]}
            onPress={() => {
              const fullEmail = `${localPart}${domain}`;
              onSelect(fullEmail);
            }}
          >
            <AppText
              type={TWELVE}
              weight={SEMI_BOLD}
              style={{
                color: isDark ? colors.white : colors.buttonBg,
              }}
            >
              {domain}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EmailDomainSuggestions;

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
});
