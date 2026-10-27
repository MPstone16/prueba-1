import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export async function persistPhoto(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  if (!FileSystem.documentDirectory) {
    throw new Error('El almacenamiento permanente no está disponible en este dispositivo.');
  }
  const destination = `${FileSystem.documentDirectory}meter-photo-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
