import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/context/app-context';

export function AppShell({ title, children }: PropsWithChildren<{ title: string }>) {
  const { session, online, pendingCount, notice, clearNotice, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.eyebrow}>EPMAPS · OPERACIÓN DE CAMPO</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={[styles.connection, online ? styles.connected : styles.disconnected]}>
            <View style={[styles.dot, online ? styles.green : styles.red]} />
            <Text style={styles.connectionText}>{online ? 'En línea' : 'Sin conexión'}</Text>
          </View>
        </View>

        {session ? (
          <View style={styles.nav}>
            <Pressable onPress={() => router.replace('/')} style={styles.navButton}>
              <Text style={styles.navText}>Inicio</Text>
            </Pressable>
            <View style={styles.pendingPill}>
              <Text style={styles.pendingText}>{pendingCount} pendientes</Text>
            </View>
            <Pressable onPress={() => router.push('/records')} style={styles.navButton}>
              <Text style={styles.navText}>Lecturas</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.navButton}>
              <Text style={styles.logoutText}>Salir</Text>
            </Pressable>
          </View>
        ) : null}

        {notice ? (
          <Pressable onPress={clearNotice} accessibilityRole="alert">
            <Text style={styles.notice}>{notice}  ·  Toca para cerrar</Text>
          </Pressable>
        ) : null}

        <View style={styles.body}>{children}</View>
        <Text style={styles.footer}>Lectura móvil · trabajo seguro incluso sin señal</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
  content: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 18,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  brand: { flex: 1 },
  eyebrow: { color: '#263973', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#263973', fontSize: 25, fontWeight: '800', marginTop: 5 },
  connection: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  connected: { backgroundColor: '#E4F6EE' },
  disconnected: { backgroundColor: '#FFF0E8' },
  dot: { width: 8, height: 8, borderRadius: 5 },
  green: { backgroundColor: '#16885E' },
  red: { backgroundColor: '#E07845' },
  connectionText: { color: '#263973', fontSize: 11, fontWeight: '700' },
  nav: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  navButton: { backgroundColor: '#E7EFF4', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  navText: { color: '#263973', fontWeight: '700', fontSize: 12 },
  logoutText: { color: '#D92534', fontWeight: '700', fontSize: 12 },
  pendingPill: { backgroundColor: '#D9B64E', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  pendingText: { color: '#263973', fontWeight: '800', fontSize: 12 },
  notice: {
    backgroundColor: '#FFF4D8',
    borderColor: '#F3D98F',
    borderWidth: 1,
    borderRadius: 14,
    color: '#624914',
    fontSize: 13,
    padding: 12,
  },
  body: { gap: 14 },
  footer: { color: '#263973', fontSize: 11, textAlign: 'center', marginTop: 8 },
});
