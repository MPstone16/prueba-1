# EPMAPS Field Water Meter Reader

Mobile field-reading demo for EPMAPS technicians, built with Expo SDK 57, React Native, TypeScript, and Expo Router. The interface uses Bento-style cards and supports offline capture with later synchronization.

## Run locally

```bash
npm install
npx expo start
```

For static web verification:

```bash
npx expo export --platform web
```

## Practice login

- Employee code: `DEMO-001`
- PIN: `1234`

These credentials are intentionally hardcoded for this practice app. They are public demo credentials, not authentication suitable for a production deployment.

## Application flow

- **Inicio:** login, session dashboard, connection status, sync count, and draft recovery.
- **Validar medidor:** accepts only `MED-` followed by six digits before looking up a meter.
- **Registrar lectura:** a three-step wizard for condition, reading, evidence, and confirmation.
- **Lecturas:** local and sent readings; pending records can be edited and sent records are locked.

The app stores the session in Expo SecureStore on iOS/Android, and stores cached meters, readings, wizard drafts, and local photo URIs in device storage. Photo files are copied to the app documents directory so the operating system does not clear them as temporary cache. Reconnection or returning to the foreground triggers a sync attempt.

## MockAPI demo schema

The API base URL and resource names are defined in `src/constants/config.ts`:

- `MEDIDOR`: `code`, `customerName`, `address`, `sector`, `previousReading`, `previousReadingAt`, and `averageConsumption`.
- `LECTURA`: `meterCode`, `reading`, `condition`, `inaccessibleReason`, `damageDescription`, `photoUrl`, `anomalyConfirmed`, `recordedAt`, and `monthKey`.

The supplied MockAPI collections initially contain generic sample records. When online, the app adds five compatible demo meters if their codes are missing; it does not remove existing data. The `LECTURA` collection is written when pending readings synchronize.

## Photo upload

Cloudinary uses an unsigned upload preset configured in `src/constants/config.ts`. Only the public cloud name and unsigned preset belong in the mobile client; never add an API secret or private credential. Configure the preset as unsigned in Cloudinary. If upload or network synchronization fails, the local photo and pending reading are retained and the error is surfaced in the app.

## Native build

Camera, SecureStore, network, and filesystem modules are configured in `app.json`. A native APK has not yet been generated; use the Android build workflow appropriate to the local development environment.
