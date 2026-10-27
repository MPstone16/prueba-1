import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Meter, Reading, ReadingDraft } from '@/types/domain';

const SESSION_KEY = 'epmaps.session';
const METERS_KEY = 'epmaps.meters';
const READINGS_KEY = 'epmaps.readings';
const DRAFT_KEY = 'epmaps.reading-draft';

async function getSession(): Promise<string | null> {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(SESSION_KEY)
    : SecureStore.getItemAsync(SESSION_KEY);
}

async function setSession(employeeCode: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(SESSION_KEY, employeeCode);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, employeeCode);
  }
}

async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : fallback;
}

export const storage = {
  getSession,
  setSession,
  clearSession,
  getMeters: () => readJson<Meter[]>(METERS_KEY, []),
  setMeters: (meters: Meter[]) => AsyncStorage.setItem(METERS_KEY, JSON.stringify(meters)),
  getReadings: () => readJson<Reading[]>(READINGS_KEY, []),
  setReadings: (readings: Reading[]) =>
    AsyncStorage.setItem(READINGS_KEY, JSON.stringify(readings)),
  getDraft: () => readJson<ReadingDraft | null>(DRAFT_KEY, null),
  setDraft: (draft: ReadingDraft | null) =>
    draft
      ? AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      : AsyncStorage.removeItem(DRAFT_KEY),
};
