# Concurrent Task Breakdown for Multi-Agent Execution

Every completed task must update `MEMORY.md`.

## Agent 1: Core Setup, Architecture & Routing
- [x] **Task 1.1:** Initialize Expo SDK 57 project with TypeScript and configure **Expo Router**.
- [x] **Task 1.2:** Install and configure **Axios** with base URL pointing to **MockAPI**.
- [x] **Task 1.3:** Set up local storage persistence (Expo SecureStore/AsyncStorage) for offline mode caching and employee session state (`R1`, `R3`).
- [x] **Task 1.4:** Create `MEMORY.md` tracker template.
- *Reminder: Log all updates to `MEMORY.md`.*

## Agent 2: UI/UX Bento Grid Design & Authentication
- [x] **Task 2.1:** Design and implement the login screen using a **Bento Grid** card layout (Employee Code & PIN validation, local session persistence) (`R1`).
- [x] **Task 2.2:** Build the global Bento Grid dashboard layout featuring connection status indicator and pending sync count ticker (`R9`).
- [x] **Task 2.3:** Implement meter code validation screen (`MED-` followed by 6 digits) (`R2`).
- *Reminder: Log all updates to `MEMORY.md`.*

## Agent 3: Meter Reading, Offline Mode & Cloudinary Integration
- [x] **Task 3.1:** Implement online/offline meter data fetching with local cache fallback (`R3`, `R4`).
- [x] **Task 3.2:** Implement reading state logic (Normal: requires reading; Inaccessible: requires reason, no reading; Damaged: requires description, optional reading) (`R5`).
- [x] **Task 3.3:** Implement consumption calculation rule (compare current vs previous; trigger warning and mandatory confirmation if $>3\times$ average) (`R6`).
- [x] **Task 3.4:** Implement **Cloudinary** image upload integration, capturing photos when required (anomalies or damaged meters) with persistent local storage backup (`R7`).
- *Reminder: Log all updates to `MEMORY.md`.*

## Agent 4: Persistence, Background Sync & Validation
- [x] **Task 4.1:** Implement crash-recovery persistence (restore incomplete reading wizard if app closes mid-process) (`R8`).
- [x] **Task 4.2:** Implement automatic background/foreground reconnection sync engine with duplicate prevention (`R9`).
- [x] **Task 4.3:** Implement edit/lock rules (editable while pending, locked once sent; block duplicate monthly readings per meter) (`R10`).
- [ ] **Task 4.4:** Perform final system verification and prep APK build.
- *Reminder: Log all updates to `MEMORY.md`.*