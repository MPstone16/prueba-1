import * as Network from 'expo-network';
import { AppState, type AppStateStatus } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { DEMO_EMPLOYEE_CODE, DEMO_EMPLOYEE_PIN } from '@/constants/config';
import { createReading, fetchMeters, fetchReadings } from '@/services/api';
import { uploadPhoto } from '@/services/cloudinary';
import { storage } from '@/services/storage';
import type { Meter, Reading, ReadingDraft } from '@/types/domain';

type ReadingSubmission = {
  meterCode: string;
  reading: number | null;
  condition: Reading['condition'];
  inaccessibleReason: string;
  damageDescription: string;
  photoUri: string;
  anomalyConfirmed: boolean;
  monthKey: string;
};

type AppContextValue = {
  session: string | null;
  meters: Meter[];
  readings: Reading[];
  draft: ReadingDraft | null;
  online: boolean;
  ready: boolean;
  notice: string;
  pendingCount: number;
  lookupMeter: (code: string) => Promise<Meter | null>;
  login: (employeeCode: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  saveDraft: (draft: ReadingDraft | null) => Promise<void>;
  discardDraft: () => Promise<void>;
  submitReading: (submission: ReadingSubmission, editingId?: string) => Promise<boolean>;
  clearNotice: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function isOnline(network: Network.NetworkState): boolean {
  return network.isConnected === true && network.isInternetReachable !== false;
}

function mergeReadings(local: Reading[], remote: Reading[]): Reading[] {
  const merged = new Map<string, Reading>();
  for (const reading of local) {
    merged.set(`${reading.meterCode}:${reading.monthKey}`, reading);
  }
  for (const reading of remote) {
    const key = `${reading.meterCode}:${reading.monthKey}`;
    const localReading = merged.get(key);
    if (
      localReading?.syncStatus === 'pending' &&
      !sameReading(localReading, reading)
    ) {
      continue;
    }
    merged.set(key, { ...reading, photoUri: localReading?.photoUri ?? '' });
  }
  return Array.from(merged.values()).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

function sameReading(first: Reading, second: Reading): boolean {
  return (
    first.meterCode === second.meterCode &&
    first.monthKey === second.monthKey &&
    first.reading === second.reading &&
    first.condition === second.condition &&
    first.inaccessibleReason === second.inaccessibleReason &&
    first.damageDescription === second.damageDescription &&
    first.anomalyConfirmed === second.anomalyConfirmed &&
    first.recordedAt === second.recordedAt
  );
}

export function AppProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [draft, setDraft] = useState<ReadingDraft | null>(null);
  const [online, setOnline] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const readingsRef = useRef(readings);
  const draftWrites = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    readingsRef.current = readings;
  }, [readings]);

  const persistReadings = useCallback(async (nextReadings: Reading[]) => {
    readingsRef.current = nextReadings;
    setReadings(nextReadings);
    await storage.setReadings(nextReadings);
  }, []);

  const persistDraft = useCallback(async (nextDraft: ReadingDraft | null) => {
    setDraft(nextDraft);
    draftWrites.current = draftWrites.current.then(
      () => storage.setDraft(nextDraft),
      () => storage.setDraft(nextDraft),
    );
    await draftWrites.current;
  }, []);

  const syncQueue = useCallback(
    async (queue: Reading[]) => {
      if (!online) return;
      const failures: string[] = [];
      let remote: Reading[];
      try {
        remote = await fetchReadings();
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Error desconocido';
        setNotice(`No se pudo consultar LECTURA para sincronizar: ${detail}`);
        return;
      }

      let next = [...queue];
      for (const pending of queue.filter((item) => item.syncStatus === 'pending')) {
        const alreadySent = remote.find(
          (item) => item.meterCode === pending.meterCode && item.monthKey === pending.monthKey,
        );
        if (alreadySent) {
          if (sameReading(pending, alreadySent)) {
            next = next.map((item) =>
              item.id === pending.id ? { ...alreadySent, photoUri: pending.photoUri } : item,
            );
          } else {
            failures.push(
              `${pending.meterCode}: ya existe una lectura distinta para este mes; se conservó el borrador sin duplicarlo.`,
            );
          }
          continue;
        }

        let photoUrl = pending.photoUrl;
        try {
          if (pending.photoUri && !photoUrl) photoUrl = await uploadPhoto(pending.photoUri);
          const uploaded = await createReading({
            meterCode: pending.meterCode,
            reading: pending.reading,
            condition: pending.condition,
            inaccessibleReason: pending.inaccessibleReason,
            damageDescription: pending.damageDescription,
            photoUrl,
            anomalyConfirmed: pending.anomalyConfirmed,
            recordedAt: pending.recordedAt,
            monthKey: pending.monthKey,
          });
          next = next.map((item) =>
            item.id === pending.id ? { ...uploaded, photoUri: pending.photoUri } : item,
          );
          remote.push(uploaded);
        } catch (error) {
          if (photoUrl && photoUrl !== pending.photoUrl) {
            next = next.map((item) =>
              item.id === pending.id ? { ...item, photoUrl } : item,
            );
          }
          const detail = error instanceof Error ? error.message : 'Error desconocido';
          failures.push(`${pending.meterCode}: ${detail}`);
        }
      }

      await persistReadings(next);
      setNotice(
        failures.length
          ? `Hay ${failures.length} lectura(s) pendiente(s): ${failures.join(' | ')}`
          : 'Sincronización completada.',
      );
    },
    [online, persistReadings],
  );

  const refreshRemoteData = useCallback(async () => {
    if (!online) return;
    try {
      const [remoteMeters, remoteReadings] = await Promise.all([fetchMeters(), fetchReadings()]);
      setMeters(remoteMeters);
      await storage.setMeters(remoteMeters);
      const merged = mergeReadings(readingsRef.current, remoteReadings);
      await persistReadings(merged);
      await syncQueue(merged);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido';
      setNotice(`No se pudo actualizar la información del servidor: ${detail}`);
    }
  }, [online, persistReadings, syncQueue]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const [savedSession, savedMeters, savedReadings, savedDraft, network] = await Promise.all([
          storage.getSession(),
          storage.getMeters(),
          storage.getReadings(),
          storage.getDraft(),
          Network.getNetworkStateAsync(),
        ]);
        if (!active) return;
        setSession(savedSession);
        setMeters(savedMeters);
        readingsRef.current = savedReadings;
        setReadings(savedReadings);
        setDraft(savedDraft);
        setOnline(isOnline(network));
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Error desconocido';
        setNotice(`No se pudieron restaurar los datos guardados: ${detail}`);
      } finally {
        if (active) setReady(true);
      }
    };
    void initialize();

    const networkSubscription = Network.addNetworkStateListener((state) => {
      setOnline(isOnline(state));
    });
    const appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        void Network.getNetworkStateAsync()
          .then((state) => setOnline(isOnline(state)))
          .catch((error: unknown) => {
            const detail = error instanceof Error ? error.message : 'Error desconocido';
            setNotice(`No se pudo comprobar la conexión: ${detail}`);
          });
      }
    });

    return () => {
      active = false;
      networkSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!ready || !online) return;
    const timer = setTimeout(() => void refreshRemoteData(), 0);
    return () => clearTimeout(timer);
  }, [online, ready, refreshRemoteData]);

  const login = useCallback(async (employeeCode: string, pin: string) => {
    if (employeeCode.trim() !== DEMO_EMPLOYEE_CODE || pin !== DEMO_EMPLOYEE_PIN) {
      setNotice('Código de empleado o PIN incorrecto.');
      return false;
    }
    try {
      await storage.setSession(DEMO_EMPLOYEE_CODE);
      setSession(DEMO_EMPLOYEE_CODE);
      setNotice('');
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido';
      setNotice(`No se pudo guardar la sesión en este dispositivo: ${detail}`);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await storage.clearSession();
      setSession(null);
      setNotice('Sesión cerrada.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido';
      setNotice(`No se pudo cerrar la sesión guardada: ${detail}`);
    }
  }, []);

  const saveDraft = useCallback(
    async (nextDraft: ReadingDraft | null) => {
      try {
        await persistDraft(nextDraft);
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Error desconocido';
        setNotice(`No se pudo guardar el borrador local: ${detail}`);
      }
    },
    [persistDraft],
  );

  const discardDraft = useCallback(async () => {
    try {
      await persistDraft(null);
      setNotice('Borrador descartado.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error desconocido';
      setNotice(`No se pudo descartar el borrador local: ${detail}`);
    }
  }, [persistDraft]);

  const lookupMeter = useCallback(
    async (code: string) => {
      const cached = meters.find((meter) => meter.code === code);
      if (cached || !online) return cached ?? null;
      try {
        const remoteMeters = await fetchMeters();
        setMeters(remoteMeters);
        await storage.setMeters(remoteMeters);
        return remoteMeters.find((meter) => meter.code === code) ?? null;
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Error desconocido';
        setNotice(`No se pudo consultar el medidor: ${detail}`);
        throw error;
      }
    },
    [meters, online],
  );

  const submitReading = useCallback(
    async (submission: ReadingSubmission, editingId?: string) => {
      const meter = meters.find((item) => item.code === submission.meterCode);
      if (!meter) {
        setNotice('No se puede guardar: el medidor no está disponible en la caché.');
        return false;
      }
      if (submission.condition === 'normal' && submission.reading === null) {
        setNotice('Ingresa una lectura para un medidor normal.');
        return false;
      }
      if (submission.condition === 'inaccessible' && !submission.inaccessibleReason.trim()) {
        setNotice('Indica por qué no fue posible acceder al medidor.');
        return false;
      }
      if (submission.condition === 'damaged' && !submission.damageDescription.trim()) {
        setNotice('Describe el daño observado.');
        return false;
      }
      if (
        submission.reading !== null &&
        (!Number.isFinite(submission.reading) || submission.reading < meter.previousReading)
      ) {
        setNotice('La lectura debe ser válida y no puede ser menor que la anterior.');
        return false;
      }
      const anomaly =
        submission.reading !== null &&
        submission.reading - meter.previousReading > meter.averageConsumption * 3;
      if (anomaly && (!submission.anomalyConfirmed || !submission.photoUri)) {
        setNotice('El consumo anómalo requiere confirmación y fotografía.');
        return false;
      }
      if (submission.condition === 'damaged' && !submission.photoUri) {
        setNotice('Un medidor dañado requiere fotografía.');
        return false;
      }

      const existingById = editingId
        ? readingsRef.current.find(
            (item) => item.id === editingId && item.meterCode === submission.meterCode,
          )
        : undefined;
      if (editingId && !existingById) {
        setNotice('No se encontró la lectura pendiente que intentas editar.');
        return false;
      }
      const existing =
        existingById ??
        readingsRef.current.find(
          (item) =>
            item.meterCode === submission.meterCode && item.monthKey === submission.monthKey,
        );
      if (existing && existing.syncStatus === 'sent') {
        setNotice('Ya existe una lectura enviada para este medidor durante este mes.');
        return false;
      }
      if (existing && existing.id !== editingId) {
        setNotice('Ya existe un borrador de lectura para este medidor y este mes.');
        return false;
      }

      const now = new Date().toISOString();
      const reading: Reading = {
        id: existing?.id ?? `local-${Date.now()}`,
        ...submission,
        monthKey: existing?.monthKey ?? submission.monthKey,
        photoUrl: existing?.photoUrl ?? '',
        recordedAt: existing?.recordedAt ?? now,
        syncStatus: 'pending',
      };
      const next = existing
        ? readingsRef.current.map((item) => (item.id === existing.id ? reading : item))
        : [reading, ...readingsRef.current];
      await persistReadings(next);
      await persistDraft(null);
      setNotice('Lectura guardada localmente.');
      if (online) await syncQueue(next);
      return true;
    },
    [meters, online, persistDraft, persistReadings, syncQueue],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      meters,
      readings,
      draft,
      online,
      ready,
      notice,
      pendingCount: readings.filter((reading) => reading.syncStatus === 'pending').length,
      lookupMeter,
      login,
      logout,
      saveDraft,
      discardDraft,
      submitReading,
      clearNotice: () => setNotice(''),
    }),
    [
      session,
      meters,
      readings,
      draft,
      online,
      ready,
      notice,
      login,
      logout,
      saveDraft,
      discardDraft,
      submitReading,
      lookupMeter,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider.');
  return context;
}
