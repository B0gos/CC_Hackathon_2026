import { Stack } from "expo-router";

export default function RootLayout() {
  return 
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
      <Stack.Screen name="index" />
      </Stack>
    </SettingsProvider>;
}
