# User Stories - EPMAPS Field Water Meter Reader

Every completed user story implementation must update `MEMORY.md`.

## US-01: Technician Authentication
- **As a** field technician working in rural areas (Nono, Lloa, Pacto, Nanegalito, Calacalí),
- **I want to** log in once with my employee code and PIN and stay remembered,
- **So that** I do not have to re-authenticate repeatedly during my field shift.
- **Acceptance Criteria:** Session persists across app restarts until explicit logout (`R1`).

## US-02: Meter Code Validation
- **As a** field technician,
- **I want** the app to validate that the meter code follows the strict `MED-` followed by 6 digits format before querying,
- **So that** invalid codes never query the office system (`R2`).

## US-03: Offline Caching & Data Retrieval
- **As a** field technician in a basement or zone with zero cellular signal,
- **I want** to view cached meter details instantly or input readings offline,
- **So that** my work is never blocked by poor connectivity (`R3`, `R4`).

## US-04: Meter Condition States & Validation Rules
- **As a** field technician,
- **I want** the app to enforce correct input rules based on meter status (Normal, Inaccessible, Damaged),
- **So that** required operational data is always captured correctly (`R5`).

## US-05: Anomaly Detection & Cloudinary Image Backup
- **As a** field technician,
- **I want** the app to warn me if consumption exceeds triple the average, requiring confirmation and a **Cloudinary** photo upload,
- **So that** high-consumption disputes have verifiable photo proof stored in the cloud (`R6`, `R7`).

## US-06: Crash Recovery & Persistent Wizards
- **As a** field technician,
- **I want** my multi-screen reading progress to be saved if the app unexpectedly closes,
- **So that** I can resume or discard my draft without losing data (`R8`).

## US-07: Automatic Sync & Status Indicator
- **As a** field technician,
- **I want** pending readings to sync automatically when signal returns without duplication, and see my live connection status on all screens via a **Bento Grid** layout,
- **So that** office records update seamlessly (`R9`).

## US-08: Editing Restrictions & Duplicate Prevention
- **As a** field technician,
- **I want** to edit pending records but lock sent records, and prevent duplicate monthly submissions per meter,
- **So that** data integrity is maintained (`R10`).