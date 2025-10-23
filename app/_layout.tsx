import "@rork/polyfills";
import { BundleInspector } from '@rork/inspector';
import { RorkSafeInsets } from '@rork/safe-insets';
import { RorkErrorBoundary } from '@rork/rork-error-boundary';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function InitialRouteHandler() {
  const { isLoading, hasCompletedOnboarding } = useApp();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, hasCompletedOnboarding]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialRouteHandler />
          <BundleInspector><RorkSafeInsets><RorkErrorBoundary><RootLayoutNav /></RorkErrorBoundary></RorkSafeInsets></BundleInspector>
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}
