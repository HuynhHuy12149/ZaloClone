import "./global.css";
import { Text, View } from "react-native";
import MainNavigator from "./src/navigations/MainNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <MainNavigator />
    </SafeAreaProvider>
  );
}
