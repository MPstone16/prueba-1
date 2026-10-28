import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { BentoCard } from '@/components/bento-card';
import { PrimaryButton, useTypography } from '@/components/form-controls';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/hooks/use-theme';
import type { Reading } from '@/types/domain';
import { formatDate } from '@/utils/reading';

function description(reading: Reading): string {
  if (reading.condition === 'inaccessible') {
    return `Inaccesible · ${reading.inaccessibleReason}`;
  }
  if (reading.condition === 'damaged') return `Dañado · ${reading.damageDescription}`;
  return `Lectura: ${reading.reading ?? '—'} m³`;
}

export default function RecordsScreen() {
  const { readings, draft } = useApp();
  const typography = useTypography();
  const theme = useTheme();
  const styles = createStyles(theme);
  const sorted = [...readings].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  return (
    <AppShell title="Lecturas guardadas">
      {draft ? (
        <BentoCard style={styles.draftCard}>
          <Text style={styles.statusPending}>BORRADOR RECUPERABLE</Text>
          <Text style={typography.subheading}>{draft.meterCode}</Text>
          <Text style={typography.body}>Paso guardado: {draft.step + 1} de 3</Text>
          <PrimaryButton
            label="Continuar borrador"
            onPress={() => router.push({ pathname: '/reading', params: { code: draft.meterCode } })}
          />
        </BentoCard>
      ) : null}

      {sorted.length ? (
        sorted.map((reading) => (
          <BentoCard key={`${reading.meterCode}-${reading.monthKey}`} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <View style={styles.recordTitle}>
                <Text style={typography.subheading}>{reading.meterCode}</Text>
                <Text style={typography.caption}>{reading.monthKey}</Text>
              </View>
              <Text
                style={reading.syncStatus === 'sent' ? styles.statusSent : styles.statusPending}>
                {reading.syncStatus === 'sent' ? 'ENVIADA' : 'PENDIENTE'}
              </Text>
            </View>
            <Text style={typography.body}>{description(reading)}</Text>
            <Text style={typography.caption}>Guardada {formatDate(reading.recordedAt)}</Text>
            {reading.photoUrl ? (
              <Text style={styles.photoLink}>Evidencia respaldada en Cloudinary</Text>
            ) : reading.photoUri ? (
              <Text style={styles.photoLocal}>Foto guardada en el dispositivo</Text>
            ) : null}
            {reading.syncStatus === 'pending' ? (
              <PrimaryButton
                label="Editar lectura pendiente"
                onPress={() =>
                  router.push({
                    pathname: '/reading',
                    params: { code: reading.meterCode, readingId: reading.id },
                  })
                }
                secondary
              />
            ) : (
              <Text style={styles.lockText}>Registro bloqueado después del envío</Text>
            )}
          </BentoCard>
        ))
      ) : (
        <BentoCard style={styles.empty}>
          <Text style={typography.subheading}>Aún no hay lecturas</Text>
          <Text style={typography.body}>
            Las lecturas que registres aparecerán aquí, incluso si se guardan sin conexión.
          </Text>
          <PrimaryButton label="Registrar lectura" onPress={() => router.push('/meter')} />
        </BentoCard>
      )}
    </AppShell>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  draftCard: { backgroundColor: theme.background, borderColor: '#D9B64E', gap: 10 },
  recordCard: { gap: 11 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  recordTitle: { gap: 3 },
  statusSent: { color: '#16885F', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  statusPending: { color: '#A56A16', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  photoLink: { color: '#16885F', fontSize: 12, fontWeight: '700' },
  photoLocal: { color: '#A56A16', fontSize: 12, fontWeight: '700' },
  lockText: { color: theme.text, fontSize: 12 },
  empty: { gap: 12 },
});
