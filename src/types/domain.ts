export type MeterCondition = 'normal' | 'inaccessible' | 'damaged';
export type SyncStatus = 'pending' | 'sent';

export type Meter = {
  id: string;
  code: string;
  customerName: string;
  address: string;
  sector: string;
  previousReading: number;
  previousReadingAt: string;
  averageConsumption: number;
};

export type ReadingDraft = {
  meterCode: string;
  readingId?: string;
  reading: string;
  condition: MeterCondition;
  inaccessibleReason: string;
  damageDescription: string;
  photoUri: string;
  anomalyConfirmed: boolean;
  step: number;
};

export type Reading = {
  id: string;
  meterCode: string;
  reading: number | null;
  condition: MeterCondition;
  inaccessibleReason: string;
  damageDescription: string;
  photoUri: string;
  photoUrl: string;
  anomalyConfirmed: boolean;
  recordedAt: string;
  monthKey: string;
  syncStatus: SyncStatus;
};

export const emptyDraft = (meterCode: string): ReadingDraft => ({
  meterCode,
  reading: '',
  condition: 'normal',
  inaccessibleReason: '',
  damageDescription: '',
  photoUri: '',
  anomalyConfirmed: false,
  step: 0,
});
