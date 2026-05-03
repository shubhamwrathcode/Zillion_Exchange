// ChartProvider.js
import React, { createContext, useMemo, useRef } from "react";
import { WebView } from "react-native-webview";
import { View } from "react-native";
import { CHART_WEB_ORIGIN } from "./helper/Constants";
import { useAppSelector } from "./store/hooks";

export const ChartContext = createContext();

export function ChartProvider({ children }) {
  const webview = useRef(null);
  const theme = useAppSelector((state) => state.auth.theme);
  /** Chart path segment matches hosted chart app: /chart/dark/ or /chart/light/ */
  const chartThemeSegment = theme === "Dark" ? "dark" : "light";
  const chartWarmUri = useMemo(
    () => `${CHART_WEB_ORIGIN}/chart/${chartThemeSegment}/BTC_USDT`,
    [chartThemeSegment]
  );

  return (
    <ChartContext.Provider value={{ webview }}>
      <View
        style={{
          width: 1,
          height: 1,
          opacity: 0,
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <WebView
          key={chartWarmUri}
          ref={webview}
          source={{ uri: chartWarmUri }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={() => { }}
        />
      </View>

      {children}
    </ChartContext.Provider>
  );
}
