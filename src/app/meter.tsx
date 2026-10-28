import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { BentoCard } from '@/components/bento-card';
import { Field, PrimaryButton, useTypography } from '@/components/form-controls';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/hooks/use-theme';
import { currentMonthKey, isValidMeterCode } from '@/utils/reading';

export default function MeterScreen() {
  const { readings, draft, online, lookupMeter } = useApp();
  const typography = useTypography();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const lookup = async () => {
    const normalized = code;
    if (!isValidMeterCode(normalized)) {
      setError('El código debe tener el formato MED- seguido exactamente de 6 dígitos.');
      return;
    }

    setSearching(true);
    setError('');
    try {
      const meter = await lookupMeter(normalized);
      if (!meter) {
        setError(
          online
            ? 'No se encontró el medidor. Revisa el código o sincroniza los datos.'
            : 'Este medidor no está guardado en el dispositivo y no hay conexión.',
        );
        return;
      }

      const monthKey = currentMonthKey();
      if (draft && draft.meterCode !== normalized) {
        setError(
          `Primero continúa o descarta el borrador guardado de ${draft.meterCode}.`,
        );
        return;
      }
      const existing = readings.find(
        (item) => item.meterCode === normalized && item.monthKey === monthKey,
      );
      if (existing?.syncStatus === 'sent') {
        setError('Este medidor ya tiene una lectura enviada durante el mes actual.');
        return;
      }
      router.push({
        pathname: '/reading',
        params: { code: normalized, ...(existing ? { readingId: existing.id } : {}) },
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar el medidor.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <AppShell title="Validar medidor">
      <BentoCard style={styles.card}>
        <Text style={styles.icon}>01</Text>
        <Text style={typography.heading}>Busca un medidor</Text>
        <Text style={typography.body}>
          Solo se consultan códigos válidos. Formato estricto: MED-000000.
        </Text>
        <View style={styles.fieldGroup}>
          <Text style={typography.label}>Código del medidor</Text>
          <Field
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            onChangeText={(value) => {
              setCode(value);
              setError('');
            }}
            onSubmitEditing={() => void lookup()}
            placeholder="MED-000001"
            returnKeyType="search"
            value={code}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          disabled={searching || !code.trim()}
          label={searching ? 'Consultando…' : 'Validar y continuar'}
          onPress={() => void lookup()}
        />
      </BentoCard>

      <BentoCard style={styles.helpCard}>
        <Text style={typography.subheading}>Consulta offline</Text>
        <Text style={typography.body}>
          Los datos sincronizados anteriormente permanecen disponibles sin señal. Si este código
          todavía no está en caché, conéctate una vez para descargarlo.
        </Text>
      </BentoCard>
    </AppShell>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: { gap: 14, padding: 22 },
  icon: {
    alignSelf: 'flex-start',
    backgroundColor: theme.background,
    borderRadius: 12,
    color: '#117DBF',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  fieldGroup: { gap: 5 },
  error: {
    backgroundColor: '#FFF0EC',
    borderRadius: 12,
    color: '#9E3C2A',
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  helpCard: { backgroundColor: theme.background, borderColor: '#117DBF', gap: 9 },
});
