# CO1111: The Computing Challenge — Treasure Hunt Web App

> **BSc (Hons) Computing — UCLan Cyprus**  
> **Coursework Assessment 1 (80% Module Weighting)**  
> **Deadline**: 11 December 2026, 17:00

---

## 👥 Team Members & Responsibilities

| Member | Role | File Ownership & Primary Duties |
| :--- | :--- | :--- |
| **Alex A** (`@alex`) | **Developer A** | Owns `app.js` & game logic: CodeCyprus API integration, state management, question loop, geolocation sync, unit tests. |
| **WizardMag1** (`@WizardMag1`) | **Developer B** | Owns `app.html`, `index.html`, `css/styles.css`, markup of `test.html` & `notes.html`, PWA setup & GitHub administration. |
| **Member C** | **Content & QA** | Owns page content, copywriting, marketing campaigns, social media posts, test documents, and meeting minutes. |

---

## 🌐 Live Deployment & Local Testing

- **Live GitHub Pages URL**: [https://wizardmag1.github.io/CO1111-The-Computing-Challenge/](https://wizardmag1.github.io/CO1111-The-Computing-Challenge/)
- **Repository URL**: [https://github.com/WizardMag1/CO1111-The-Computing-Challenge](https://github.com/WizardMag1/CO1111-The-Computing-Challenge)

### Running Locally
Because modern browser APIs (Geolocation, Service Worker, Camera QR) require an HTTP/HTTPS context, run the project with a lightweight local server:
```bash
# Using Python 3
python3 -m http.server 8080

# Or using npx
npx serve .
```
Open `http://localhost:8080` in your browser.

---

## 🤝 UI & Logic Interface Contract (Agreed Oct 26)

To ensure seamless collaboration between Developer A (Logic) and Developer B (UI), the following element IDs and functional interfaces are strictly agreed upon:

### 1. Screen Containers (Displayed One at a Time)
All screens are wrapped in `.screen` containers. Developer A's logic calls `showScreen(screenId)` to toggle visibility cleanly:

| Screen ID | Purpose | Core Element IDs Inside |
| :--- | :--- | :--- |
| `#screen-hunt-list` | Lists available hunts | `#hunts-loader`, `#hunts-container`, `#btn-refresh-hunts` |
| `#screen-name-entry` | Player nickname & app registration | `#selected-hunt-name`, `#player-name-input`, `#app-name-input`, `#startButton` |
| `#screen-question` (also `#game`) | Active gameplay & clue view | `#question`, `#question-counter`, `#score`, `#time-left`, `#message` |
| `#screen-finish` | Completion & final score | `#final-score`, `#finish-message`, `#btn-view-leaderboard`, `#btn-restart` |
| `#screen-leaderboard` | Live ranked leaderboard | `#leaderboard-table`, `#leaderboard-body`, `#btn-close-leaderboard` |

### 2. Adaptive Answer UI Elements
Developer B provides dedicated markup containers for each of the 4 question types. Developer A reveals the matching container based on `data.questionType`:
- **Text Clues**: Container `#answer-container-text`, Form `#answerForm`, Input `#answer`, Submit `#btn-submit-answer`.
- **Boolean Clues**: Container `#answer-container-boolean`, Buttons `#btn-bool-true` and `#btn-bool-false`.
- **Multiple Choice (MCQ)**: Container `#answer-container-mcq`, Option buttons `#btn-mcq-a`, `#btn-mcq-b`, `#btn-mcq-c`, `#btn-mcq-d`.
- **Numeric Clues**: Container `#answer-container-numeric`, Input `#answer-numeric-input` (`inputmode="decimal"`), Submit `#btn-submit-numeric`.

### 3. Action Controls & Overlays
- **Skip Clue**: `#skipButton` (triggers point deduction confirmation).
- **Camera QR Clue Scanner**: `#qrButton` (opens `#qr-modal` containing `#qr-reader`).
- **Interactive Map**: `#mapButton` (toggles `#map-container`).

### 4. Backwards Compatibility Note
Developer B's markup retains all IDs originally referenced in Developer A's prototype (`startButton`, `game`, `question`, `answerForm`, `answer`, `message`, `score`), guaranteeing zero runtime breakage while enabling the full multi-screen experience.

---

## 🌿 Git & Pull Request Guidelines

1. **Always pull before starting**:
   ```bash
   git pull origin main
   ```
2. **Work on your designated feature branch**:
   - Developer A: `feature/app-logic`
   - Developer B: `feature/ui-landing`
   - Member C: `content/marketing-notes`
3. **Make small, atomic commits** with clear messages referencing issue numbers:
   - Example: `feat(app): add responsive MCQ button layout (#3)`
   - Avoid generic messages like `update` or `fix`.
4. **Open a Pull Request into `main`** and request review from the other developer before merging. Never push unreviewed breaking changes directly to `main`.

---

## 📋 Project Milestones & Task Tracking

- **Issue #1**: Setup UI/Logic contract agreement and branch guidelines *(Assigned: Dev B)*
- **Issue #2**: Mobile-first multi-screen layout & CSS styling in `app.html` *(Assigned: Dev B)*
- **Issue #3**: Professional landing page `index.html` with SEO & marketing *(Assigned: Dev B & Member C)*
- **Issue #4**: Structured markup for `test.html` (Unit Tests, UAT, Nielsen Heuristics) *(Assigned: Dev B)*
- **Issue #5**: Teamwork collaboration log and Meeting 1 in `notes.html` *(Assigned: Dev B & Member C)*
- **Issue #6**: Progressive Web App (PWA) manifest, service worker, and icons *(Assigned: Dev B)*
- **Issue #7**: End-to-end CodeCyprus API integration and question loop *(Assigned: Dev A)*
- **Issue #8**: Geolocation sync and periodic GPS updates *(Assigned: Dev A)*
