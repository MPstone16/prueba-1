import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppShell } from '@/components/app-shell';
import { BentoCard } from '@/components/bento-card';
import { Field, PrimaryButton, useTypography } from '@/components/form-controls';
import { useApp } from '@/context/app-context';
import { useTheme } from '@/hooks/use-theme';
import { persistPhoto } from '@/services/photo-storage';
import { emptyDraft, type MeterCondition, type ReadingDraft } from '@/types/domain';
import { currentMonthKey } from '@/utils/reading';

const conditions: { value: MeterCondition; label: string; detail: string }[] = [
  { value: 'normal', label: 'Normal', detail: 'Lectura disponible' },
  { value: 'inaccessible', label: 'Inaccesible', detail: 'Indica la razón' },
  { value: 'damaged', label: 'Dañado', detail: 'Describe el daño y toma foto' },
];

export default function ReadingScreen() {
  const { code = '', readingId } = useLocalSearchParams<{ code: string; readingId?: string }>();
  const { meters, readings, draft, ready, saveDraft, discardDraft, submitReading } = useApp();
  const typography = useTypography();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [form, setForm] = useState<ReadingDraft>(() => emptyDraft(code));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);
  const meter = meters.find((item) => item.code === code);
  const effectiveReadingId = readingId ?? (draft?.meterCode === code ? draft.readingId : undefined);
  const existing = readings.find((item) => item.id === effectiveReadingId);

  useEffect(() => {
    if (!ready || initialized.current || !code) return;
    initialized.current = true;
    let restored = emptyDraft(code);
    if (existing) {
      restored = {
        meterCode: code,
        readingId: existing.id,
        reading: existing.reading === null ? '' : `${existing.reading}`,
        condition: existing.condition,
        inaccessibleReason: existing.inaccessibleReason,
        damageDescription: existing.damageDescription,
        photoUri: existing.photoUri,
        anomalyConfirmed: existing.anomalyConfirmed,
        step: 0,
      };
    } else if (draft?.meterCode === code) {
      restored = draft;
    }
    setForm(restored);
    void saveDraft(restored);
  }, [code, draft, effectiveReadingId, existing, ready, saveDraft]);

  const numericReading = form.reading.trim() === '' ? null : Number(form.reading);
  const consumption = numericReading === null || !meter ? null : numericReading - meter.previousReading;
  const isAnomaly =
    consumption !== null && meter !== undefined && consumption > meter.averageConsumption * 3;
  const photoRequired = isAnomaly || form.condition === 'damaged';

  const setField = (updates: Partial<ReadingDraft>) => {
    const next = { ...form, ...updates };
    setForm(next);
    setError('');
    void saveDraft(next);
  };

  const validateStep = (): boolean => {
    if (form.condition === 'normal' && numericReading === null) {
      setError('Ingresa una lectura para un medidor normal.');
      return false;
    }
    if (form.condition === 'inaccessible' && !form.inaccessibleReason.trim()) {
      setError('Indica por qué no fue posible acceder al medidor.');
      return false;
    }
    if (form.condition === 'damaged' && !form.damageDescription.trim()) {
      setError('Describe el daño observado.');
      return false;
    }
    if (numericReading !== null) {
      if (!Number.isFinite(numericReading) || numericReading < 0) {
        setError('La lectura debe ser un número válido mayor o igual a cero.');
        return false;
      }
      if (meter && numericReading < meter.previousReading) {
        setError('La lectura actual no puede ser menor que la lectura anterior.');
        return false;
      }
    }
    return true;
  };

  const pickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso de cámara requerido',
          'Autoriza el acceso a la cámara para tomar la evidencia fotográfica.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.75,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const selectedUri = result.assets[0]?.uri;
      if (!selectedUri) {
        setError('La cámara no devolvió una imagen. Inténtalo nuevamente.');
        return;
      }
      const photoUri = await persistPhoto(selectedUri);
      setField({ photoUri });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `No se pudo abrir la cámara: ${cause.message}`
          : 'No se pudo abrir la cámara.',
      );
    }
  };

  const stepLabel = useMemo(
    () => ['Estado y lectura', 'Evidencia', 'Confirmación'][form.step],
    [form.step],
  );

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await submitReading(
        {
          meterCode: code,
          reading: form.condition === 'inaccessible' ? null : numericReading,
          condition: form.condition,
          inaccessibleReason: form.inaccessibleReason.trim(),
          damageDescription: form.damageDescription.trim(),
          photoUri: form.photoUri,
          anomalyConfirmed: form.anomalyConfirmed,
          monthKey: currentMonthKey(),
        },
        effectiveReadingId,
      );
      if (saved) router.replace('/records');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la lectura.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    Alert.alert('Descartar progreso', 'Se eliminará el borrador guardado de este formulario.', [
      { text: 'Seguir editando', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          void discardDraft().then(() => router.replace('/records'));
        },
      },
    ]);
  };

  if (!meter) {
    return (
      <AppShell title="Medidor no disponible">
        <BentoCard style={styles.card}>
          <Text style={typography.body}>
            No se encontró {code} en los datos guardados. Conéctate y vuelve a buscar el medidor.
          </Text>
          <PrimaryButton label="Volver a validar" onPress={() => router.replace('/meter')} />
        </BentoCard>
      </AppShell>
    );
  }

  const toggleButton = (condition: MeterCondition, label: string, detail: string) => (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: form.condition === condition }}
      key={condition}
      onPress={() => setField({ condition })}
      style={[styles.condition, form.condition === condition && styles.conditionSelected]}>
      <Text style={styles.conditionLabel}>{label}</Text>
      <Text style={typography.caption}>{detail}</Text>
    </Pressable>
  );

  return (
    <AppShell title="Registrar lectura">
      <BentoCard style={styles.meterCard}>
        <Text style={styles.overline}>MEDIDOR {meter.code}</Text>
        <Text style={typography.heading}>{meter.customerName || 'Usuario de servicio'}</Text>
        <Text style={typography.body}>{meter.address || meter.sector}</Text>
        <View style={styles.meterStats}>
          <View style={styles.meterStat}>
            <Text style={styles.metricNumber}>{meter.previousReading}</Text>
            <Text style={typography.caption}>Anterior · m³</Text>
          </View>
          <View style={styles.meterStat}>
            <Text style={styles.metricNumber}>{meter.averageConsumption}</Text>
            <Text style={typography.caption}>Promedio · m³</Text>
          </View>
        </View>
      </BentoCard>

      <BentoCard style={styles.card}>
        <View style={styles.stepHeader}>
          <Text style={styles.overline}>PASO {form.step + 1} DE 3</Text>
          <Text style={typography.caption}>{stepLabel}</Text>
        </View>

        {form.step === 0 ? (
          <View style={styles.section}>
            <Text style={typography.subheading}>Condición del medidor</Text>
            <View style={styles.conditions}>
              {conditions.map((item) => toggleButton(item.value, item.label, item.detail))}
            </View>

            {form.condition === 'normal' || form.condition === 'damaged' ? (
              <View style={styles.fieldGroup}>
                <Text style={typography.label}>
                  Lectura actual {form.condition === 'damaged' ? '(opcional)' : '(m³)'}
                </Text>
                <Field
                  keyboardType="decimal-pad"
                  onChangeText={(reading) => setField({ reading: reading.replace(',', '.') })}
                  placeholder={`Igual o mayor que ${meter.previousReading}`}
                  value={form.reading}
                />
              </View>
            ) : null}

            {form.condition === 'inaccessible' ? (
              <View style={styles.fieldGroup}>
                <Text style={typography.label}>Razón de inaccesibilidad</Text>
                <Field
                  multiline
                  onChangeText={(inaccessibleReason) => setField({ inaccessibleReason })}
                  placeholder="Describe por qué no se pudo acceder"
                  value={form.inaccessibleReason}
                />
              </View>
            ) : null}

            {form.condition === 'damaged' ? (
              <View style={styles.fieldGroup}>
                <Text style={typography.label}>Descripción del daño</Text>
                <Field
                  multiline
                  onChangeText={(damageDescription) => setField({ damageDescription })}
                  placeholder="Describe el daño observado"
                  value={form.damageDescription}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {form.step === 1 ? (
          <View style={styles.section}>
            {isAnomaly ? (
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>Consumo fuera del promedio</Text>
                <Text style={styles.warningBody}>
                  El consumo calculado es {consumption} m³, más de 3× el promedio de{' '}
                  {meter.averageConsumption} m³. Confirma la lectura y adjunta una foto.
                </Text>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: form.anomalyConfirmed }}
                  onPress={() => setField({ anomalyConfirmed: !form.anomalyConfirmed })}
                  style={styles.confirmRow}>
                  <Text style={styles.checkbox}>{form.anomalyConfirmed ? '✓' : ''}</Text>
                  <Text style={styles.confirmText}>Confirmo que la lectura es correcta</Text>
                </Pressable>
              </View>
            ) : null}
            {form.condition === 'damaged' ? (
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>Evidencia de daño requerida</Text>
                <Text style={styles.warningBody}>
                  Adjunta una fotografía del medidor para respaldar el reporte.
                </Text>
              </View>
            ) : null}
            {!photoRequired && !isAnomaly ? (
              <View style={styles.info}>
                <Text style={typography.body}>
                  No se requiere fotografía para este estado. Puedes continuar con la revisión.
                </Text>
              </View>
            ) : null}
            <View style={[styles.photoSection, photoRequired && styles.photoSectionRequired]}>
              <View style={styles.photoHeader}>
                <Text style={styles.photoLabel}>Evidencia fotográfica</Text>
                <Text style={[styles.photoBadge, photoRequired && styles.photoBadgeRequired]}>
                  {photoRequired ? 'Obligatoria' : 'Opcional'}
                </Text>
              </View>
              <PrimaryButton
                label={form.photoUri ? 'Tomar otra fotografía' : 'Tomar fotografía'}
                onPress={() => void pickPhoto()}
              />
              {form.photoUri ? (
                <Image source={{ uri: form.photoUri }} resizeMode="cover" style={styles.photo} />
              ) : (
                <Text style={typography.caption}>
                  {photoRequired
                    ? 'La fotografía es obligatoria para este caso y se adjuntará a la lectura.'
                    : 'La foto se conserva localmente y se subirá a Cloudinary al recuperar la conexión.'}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {form.step === 2 ? (
          <View style={styles.section}>
            <Text style={typography.subheading}>Revisa antes de guardar</Text>
            <View style={styles.reviewLine}>
              <Text style={styles.reviewLabel}>Estado</Text>
              <Text style={styles.reviewValue}>
                {conditions.find((item) => item.value === form.condition)?.label}
              </Text>
            </View>
            {form.reading ? (
              <View style={styles.reviewLine}>
                <Text style={styles.reviewLabel}>Lectura</Text>
                <Text style={styles.reviewValue}>{form.reading} m³</Text>
              </View>
            ) : null}
            {form.condition === 'inaccessible' ? (
              <Text style={typography.body}>Motivo: {form.inaccessibleReason}</Text>
            ) : null}
            {form.condition === 'damaged' ? (
              <Text style={typography.body}>Daño: {form.damageDescription}</Text>
            ) : null}
            <Text style={typography.caption}>
              {form.photoUri ? 'Fotografía adjunta' : 'Sin fotografía requerida'} · Se guardará en
              este dispositivo y se sincronizará cuando haya señal.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isAnomaly && form.step === 2 ? (
          <Text style={styles.warningTitle}>Consumo alto: confirma y adjunta la fotografía.</Text>
        ) : null}

        <View style={styles.actions}>
          {form.step > 0 ? (
            <PrimaryButton
              label="Anterior"
              onPress={() => setField({ step: form.step - 1 })}
              secondary
            />
          ) : null}
          {form.step < 2 ? (
            <PrimaryButton
              label="Continuar"
              onPress={() => {
                if (form.step === 0 && !validateStep()) return;
                if (form.step === 1 && photoRequired && !form.photoUri) {
                  setError('Toma una fotografía para poder continuar.');
                  return;
                }
                if (form.step === 1 && isAnomaly && !form.anomalyConfirmed) {
                  setError('Confirma que la lectura anómala es correcta.');
                  return;
                }
                setField({ step: form.step + 1 });
              }}
            />
          ) : (
            <PrimaryButton
              disabled={saving || (isAnomaly && !form.anomalyConfirmed) || (photoRequired && !form.photoUri)}
              label={saving ? 'Guardando…' : 'Guardar lectura'}
              onPress={() => void submit()}
            />
          )}
        </View>
        <Pressable onPress={discard} style={styles.discard}>
          <Text style={styles.discardText}>Descartar este progreso</Text>
        </Pressable>
      </BentoCard>
    </AppShell>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  meterCard: { backgroundColor: theme.background, borderColor: '#117DBF', gap: 8 },
  overline: { color: '#117DBF', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  meterStats: { flexDirection: 'row', gap: 10, marginTop: 10 },
  meterStat: { backgroundColor: theme.backgroundElement, borderRadius: 14, flex: 1, padding: 12, gap: 3 },
  metricNumber: { color: '#117DBF', fontSize: 24, fontWeight: '900' },
  card: { gap: 16 },
  stepHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  section: { gap: 14 },
  conditions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  condition: {
    backgroundColor: theme.background,
    borderColor: theme.background,
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: '30%',
    padding: 11,
    gap: 4,
  },
  conditionSelected: { backgroundColor: '#D9B64E', borderColor: '#117DBF', borderWidth: 2 },
  conditionLabel: { color: theme.text, fontSize: 13, fontWeight: '800' },
  fieldGroup: { gap: 4 },
  warning: { backgroundColor: '#FFF2D6', borderColor: '#F0D799', borderRadius: 15, borderWidth: 1, padding: 14, gap: 7 },
  warningTitle: { color: '#8C5D00', fontSize: 14, fontWeight: '900' },
  warningBody: { color: '#705722', fontSize: 13, lineHeight: 19 },
  confirmRow: { alignItems: 'center', flexDirection: 'row', gap: 9, paddingVertical: 5 },
  checkbox: {
    alignItems: 'center',
    borderColor: '#9E7A2E',
    borderRadius: 5,
    borderWidth: 1,
    color: '#6E4E0C',
    fontSize: 14,
    fontWeight: '900',
    height: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 22,
  },
  confirmText: { color: '#624914', flex: 1, fontSize: 13, fontWeight: '700' },
  info: { backgroundColor: theme.background, borderRadius: 14, padding: 13 },
  photoSection: {
    backgroundColor: theme.backgroundElement,
    borderColor: theme.textSecondary,
    borderRadius: 15,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  photoSectionRequired: { backgroundColor: '#FFF0EC', borderColor: '#D92534' },
  photoHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  photoLabel: { color: theme.text, fontSize: 13, fontWeight: '800' },
  photoBadge: { backgroundColor: theme.backgroundSelected, borderRadius: 999, color: theme.text, fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  photoBadgeRequired: { backgroundColor: '#F2D5D5', color: '#9E3C2A' },
  photo: { alignSelf: 'center', borderRadius: 15, height: 220, width: '100%' },
  reviewLine: { alignItems: 'center', borderBottomColor: theme.textSecondary, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  reviewLabel: { color: theme.text, fontSize: 13 },
  reviewValue: { color: theme.text, fontSize: 14, fontWeight: '800' },
  error: { backgroundColor: '#FFF0EC', borderRadius: 12, color: '#9E3C2A', fontSize: 13, lineHeight: 19, padding: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  discard: { alignSelf: 'center', padding: 8 },
  discardText: { color: '#9E3C2A', fontSize: 13, fontWeight: '700' },
});
