import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/i18n';
import { SessionProvider } from '@/state/session';
import { colors, fontAssets } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Fonts fall back to system faces if loading fails; never block the app on them.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <I18nProvider>
            <SessionProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.cream },
                  // Platform push by default; a plain fade when the OS asks for reduced motion.
                  animation: reduceMotion ? 'fade' : 'default',
                }}
              >
                <Stack.Screen
                  name="selfie/camera"
                  options={{ animation: reduceMotion ? 'fade' : 'slide_from_bottom' }}
                />
                <Stack.Screen name="creating" options={{ gestureEnabled: false }} />
                <Stack.Screen
                  name="menu"
                  options={{
                    presentation: 'formSheet',
                    sheetAllowedDetents: 'fitToContents',
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 24,
                    contentStyle: { backgroundColor: colors.cream },
                  }}
                />
              </Stack>
            </SessionProvider>
          </I18nProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
