import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAppStart } from "./helper/utility";
import store from "./store/store";
import { Provider } from "react-redux";
import Navigator from "./navigation/Navigator";
import { SocketProvider } from "./SocketProvider";
import { ChartProvider } from "./ChartProvider";
import FutureSocketContextProvider from "./screens/Futures/FutureSocket";
import { OptionsContextProvider } from "./screens/Options/OptionsContext";
import { colors } from "./theme/colors";

function App(): JSX.Element {
  useEffect(() => {
    onAppStart(store);
    SplashScreen.hide();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={colors.newThemeColor} barStyle="light-content" />
      <Provider store={store}>
        <SocketProvider>
          <FutureSocketContextProvider>
            <OptionsContextProvider>
              <ChartProvider>
                <Navigator />
              </ChartProvider>
            </OptionsContextProvider>
          </FutureSocketContextProvider>
        </SocketProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
