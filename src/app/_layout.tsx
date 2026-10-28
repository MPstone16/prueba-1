import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from '@/context/app-context';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { mode } = useAppTheme();

  return (
    <AppProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppRoutes />
    </AppProvider>
  );
}

function AppRoutes() {
  const { session } = useApp();

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="meter" />
        <Stack.Screen name="reading" />
        <Stack.Screen name="records" />
      </Stack.Protected>
    </Stack>
  );
}
