import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { BentoCard } from '@/components/bento-card';
import { Field, PrimaryButton, useTypography } from '@/components/form-controls';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { session, readings, draft, login, ready } = useApp();
  const typography = useTypography();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const pendingCount = readings.filter((reading) => reading.syncStatus === 'pending').length;
  const sentCount = readings.filter((reading) => reading.syncStatus === 'sent').length;

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      if (await login(employeeCode, pin)) setPin('');
    } finally {
      setLoggingIn(false);
    }
  };

  if (!ready) {
    return (
      <AppShell title="Preparando la jornada">
        <BentoCard>
          <Text style={typography.body}>Restaurando sesión y lecturas guardadas…</Text>
        </BentoCard>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell title="Acceso de técnico">
        <BentoCard style={styles.loginCard}>
          <Text style={styles.overline}>ACCESO DE CAMPO</Text>
          <Text style={typography.heading}>Bienvenido de vuelta</Text>
          <Text style={typography.body}>
            Inicia sesión una vez. Tu sesión se conserva en este dispositivo hasta que cierres
            sesión.
          </Text>
          <View style={styles.fieldGroup}>
            <Text style={typography.label}>Código de empleado</Text>
            <Field
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={setEmployeeCode}
              placeholder="DEMO-001"
              returnKeyType="next"
              value={employeeCode}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={typography.label}>PIN</Text>
            <Field
              keyboardType="number-pad"
              onChangeText={setPin}
              onSubmitEditing={() => void handleLogin()}
              placeholder="••••"
              secureTextEntry
              value={pin}
            />
          </View>
          <PrimaryButton
            disabled={loggingIn || !employeeCode.trim() || !pin}
            label={loggingIn ? 'Verificando…' : 'Iniciar sesión'}
            onPress={() => void handleLogin()}
          />
          <Text style={typography.caption}>
            Credenciales públicas de práctica: código DEMO-001 · PIN 1234. No usar en producción.
          </Text>
        </BentoCard>
      </AppShell>
    );
  }

  return (
    <AppShell title="Panel de jornada">
      <BentoCard style={styles.hero}>
        <Text style={styles.overline}>TURNO ACTIVO</Text>
        <Text style={styles.heroTitle}>Hola, técnico</Text>
        <Text style={styles.heroBody}>
          Busca el código del medidor para registrar una lectura. Los cambios se guardan aunque no
          haya señal.
        </Text>
        <PrimaryButton label="Registrar lectura" onPress={() => router.push('/meter')} />
      </BentoCard>

      <View style={styles.stats}>
        <BentoCard style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={typography.caption}>Pendientes de sincronizar</Text>
        </BentoCard>
        <BentoCard style={styles.statCard}>
          <Text style={styles.statNumber}>{sentCount}</Text>
          <Text style={typography.caption}>Enviadas este dispositivo</Text>
        </BentoCard>
      </View>

      {draft ? (
        <BentoCard style={styles.resumeCard}>
          <Text style={styles.overline}>BORRADOR RECUPERADO</Text>
          <Text style={typography.subheading}>{draft.meterCode}</Text>
          <Text style={typography.body}>Tu progreso se guardó automáticamente.</Text>
          <PrimaryButton
            label="Continuar borrador"
            onPress={() => router.push({ pathname: '/reading', params: { code: draft.meterCode } })}
          />
        </BentoCard>
      ) : null}

      <BentoCard style={styles.actionCard}>
        <Text style={typography.subheading}>Control de lecturas</Text>
        <Text style={typography.body}>
          Revisa registros pendientes, retoma borradores o verifica qué lecturas ya fueron enviadas.
        </Text>
        <PrimaryButton label="Ver lecturas" onPress={() => router.push('/records')} secondary />
      </BentoCard>
    </AppShell>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  loginCard: { gap: 16, padding: 22 },
  fieldGroup: { gap: 5 },
  overline: { color: '#117DBF', fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  hero: { backgroundColor: theme.background, borderColor: '#117DBF', gap: 13, padding: 22 },
  heroTitle: { color: theme.text, fontSize: 28, fontWeight: '900' },
  heroBody: { color: theme.text, fontSize: 15, lineHeight: 23, marginBottom: 4 },
  stats: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, minHeight: 115, justifyContent: 'center', gap: 6 },
  statNumber: { color: '#117DBF', fontSize: 34, fontWeight: '900' },
  resumeCard: { backgroundColor: theme.background, borderColor: '#D9B64E', gap: 10 },
  actionCard: { gap: 12 },
});
