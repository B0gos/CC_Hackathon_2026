import { Stack } from "expo-router";

export default function RootLayout() {
<<<<<<< HEAD
  return 
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
      <Stack.Screen name="index" />
      </Stack>
    </SettingsProvider>;
=======
  return <Stack
    screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="index" />
    </Stack>;
>>>>>>> d300aab2ea235eb29ee2abd9cbe099f7b1e42e15
}
