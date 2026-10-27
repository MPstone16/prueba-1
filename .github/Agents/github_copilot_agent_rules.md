# GitHub Copilot AI Agent Guidelines & Rules

These rules govern all AI assistance, code generation, refactoring, and architectural decisions for the EPMAPS Mobile Water Meter Reading application.

## 1. Mandatory Memory Logging (`MEMORY.md`)
- **Rule:** Every single time a change, addition, refactor, or configuration update is made to the codebase or project files, the AI or developer must document the exact modification, rationale, and current state in `MEMORY.md`.

## 2. Important Changes & User Confirmation
- **Rule:** Before executing any significant or structural code change (such as database schema updates, major state-management shifts, or workflow redesigns), the AI **must** explicitly ask for user confirmation.

## 3. Handling Logic Gaps & Contradictions
- **Rule:** If any contradictions, ambiguous requirements, or logic gaps are detected in the user stories or technical test specifications, the AI **must not** guess or write code. It must pause and consult the user first.

## 4. UI/UX Design System ("Bento Grid")
- **Rule:** The entire application interface must follow a modern **Bento Grid** layout design (asymmetrical, card-based modular grids with clear visual hierarchy, padding, and subtle shadows/borders). Avoid plain list views or generic templates to prevent the 5-point penalty.

## 5. Technology Stack & Strict Constraints
- **Framework & Router:** React Native with Expo SDK 57, utilizing **Expo Router** for file-based routing.
- **Image Upload:** Cloudinary must be used for cloud image management, storing public URLs.
- **Backend Simulation:** **MockAPI** must be used for simulating office resources (`medidores` and `lecturas`).
- **Networking:** **Axios** must be used exclusively for all HTTP requests. Native `fetch` is strictly prohibited.
- **No Unapproved Libraries:** **NO** other libraries or dependencies may be included. If a new library is required, the AI must ask the user for permission first.