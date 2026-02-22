import { Stack } from "expo-router";
import { SettingsProvider } from "../context/SettingsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack />
    </SettingsProvider>
  );
}