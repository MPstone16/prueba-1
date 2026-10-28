import { create } from 'axios';

import {
  API_BASE_URL,
  METER_RESOURCE,
  READING_RESOURCE,
} from '@/constants/config';
import type { Meter, Reading } from '@/types/domain';

const http = create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: 'application/json; charset=utf-8',
    'Accept-Charset': 'utf-8',
    'Content-Type': 'application/json; charset=utf-8',
  },
});

const demoMeters: Omit<Meter, 'id'>[] = [
  {
    code: 'MED-000001',
    customerName: 'María Elena Paredes',
    address: 'Calle del Bosque 120',
    sector: 'Nono',
    previousReading: 120,
    previousReadingAt: '2026-09-15',
    averageConsumption: 18,
  },
  {
    code: 'MED-000002',
    customerName: 'José Luis Andrade',
    address: 'Av. de los Arrayanes 45',
    sector: 'Lloa',
    previousReading: 246,
    previousReadingAt: '2026-09-14',
    averageConsumption: 22,
  },
  {
    code: 'MED-000003',
    customerName: 'Ana Lucía Cevallos',
    address: 'Camino a Pacto s/n',
    sector: 'Pacto',
    previousReading: 85,
    previousReadingAt: '2026-09-12',
    averageConsumption: 16,
  },
  {
    code: 'MED-000004',
    customerName: 'Carlos Benítez',
    address: 'Calle Quito 308',
    sector: 'Nanegalito',
    previousReading: 410,
    previousReadingAt: '2026-09-16',
    averageConsumption: 25,
  },
  {
    code: 'MED-000005',
    customerName: 'Rosa María Lema',
    address: 'Camino a Calacalí km 2',
    sector: 'Calacalí',
    previousReading: 176,
    previousReadingAt: '2026-09-11',
    averageConsumption: 19,
  },
];

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asMeter(value: unknown): Meter | null {
  if (!isRecord(value)) return null;
  const code = stringValue(value.code);
  const previousReading = numberValue(value.previousReading);
  const averageConsumption = numberValue(value.averageConsumption);
  if (!/^MED-\d{6}$/.test(code) || previousReading === null || averageConsumption === null) {
    return null;
  }
  return {
    id: stringValue(value.id),
    code,
    customerName: stringValue(value.customerName),
    address: stringValue(value.address),
    sector: stringValue(value.sector),
    previousReading,
    previousReadingAt: stringValue(value.previousReadingAt),
    averageConsumption,
  };
}

function asReading(value: unknown): Reading | null {
  if (!isRecord(value)) return null;
  const meterCode = stringValue(value.meterCode);
  const condition = value.condition;
  const reading = numberValue(value.reading);
  if (
    !/^MED-\d{6}$/.test(meterCode) ||
    (condition !== 'normal' && condition !== 'inaccessible' && condition !== 'damaged')
  ) {
    return null;
  }
  const monthKey = stringValue(value.monthKey);
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
  if (condition === 'normal' && reading === null) return null;
  return {
    id: stringValue(value.id),
    meterCode,
    reading,
    condition,
    inaccessibleReason: stringValue(value.inaccessibleReason),
    damageDescription: stringValue(value.damageDescription),
    photoUri: '',
    photoUrl: stringValue(value.photoUrl),
    anomalyConfirmed: value.anomalyConfirmed === true,
    recordedAt: stringValue(value.recordedAt),
    monthKey,
    syncStatus: 'sent',
  };
}

export async function fetchMeters(): Promise<Meter[]> {
  const response = await http.get<unknown>(METER_RESOURCE);
  if (!Array.isArray(response.data)) {
    throw new Error('La respuesta de MEDIDOR no tiene el formato esperado.');
  }

  const meters = response.data.map(asMeter).filter((meter): meter is Meter => meter !== null);
  const knownCodes = new Set(meters.map((meter) => meter.code));
  const missingDemoMeters = demoMeters.filter((meter) => !knownCodes.has(meter.code));

  for (const meter of missingDemoMeters) {
    const created = await http.post<JsonRecord>(METER_RESOURCE, meter);
    const parsed = asMeter(created.data);
    if (!parsed) {
      throw new Error(`MockAPI devolvió un medidor inválido para ${meter.code}.`);
    }
    meters.push(parsed);
  }

  return meters;
}

export async function fetchReadings(): Promise<Reading[]> {
  const response = await http.get<unknown>(READING_RESOURCE);
  if (!Array.isArray(response.data)) {
    throw new Error('La respuesta de LECTURA no tiene el formato esperado.');
  }
  return response.data.map(asReading).filter((reading): reading is Reading => reading !== null);
}

export async function createReading(
  reading: Omit<Reading, 'id' | 'syncStatus' | 'photoUri'>,
): Promise<Reading> {
  const response = await http.post<JsonRecord>(READING_RESOURCE, reading);
  const parsed = asReading(response.data);
  if (!parsed) throw new Error('MockAPI devolvió una lectura inválida.');
  return parsed;
}
