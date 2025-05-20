# 4Geeks CTF - Vercel Implementation Plan (Simple HTML/JS Frontend, Dynamic Flags & Auth v5)

This plan outlines the steps to create and deploy the "HTTP Intercept & Decode Agency" (4Geeks) CTF project on Vercel using a simple HTML, CSS, and vanilla JavaScript frontend, with a Node.js/Express backend. Flags are dynamically fetched. User authentication starts with token generation via Postman and primarily uses `Authorization: Token <value>` for student interactions with the CTF's API, with session cookies for browser navigation. The application supports English and Spanish and aims for full responsiveness.

**Prerequisites:**
*   Project directory `http-foundations-ctf-project` already created and `git init` has been run.
*   Vercel account created.
*   Vercel CLI installed (`npm install -g vercel`) and logged in (`vercel login`).
*   Node.js version 22 and npm installed locally.
*   Git installed locally.
*   Access to your central API details: Host URL (`https://breathecode.herokuapp.com/v1` for this CTF), Academy Token, Academy ID. Student credentials (email/password) for token generation.

**Phase 0: Core Setup, Authentication, UI, and i18n (Largely Implemented)**

1.  **Navigate into Project Directory:** (Completed)
2.  **Initialize `package.json`:** (Completed) `npm init -y`, added `"engines": { "node": "22.x" }`.
3.  **Install Dependencies:** (Completed) `npm install express node-fetch express-session cookie-parser`.
4.  **Create Directories:** (Completed) `api`, `public`, `public/css`, `public/js`, `public/js/locales`, `public/img`.
5.  **Create/Update `.gitignore`:** (Completed) Ensured `node_modules/`, `.env*` are listed.
6.  **Create `public/login.html` (Challenge 0 - Instructional Page):** (Implemented)
    *   Plain HTML file with i18n keys.
    *   Title: "Challenge 0: Obtain Your 4Geeks Access Token".
    *   Clarifies `CENTRAL_API_HOST` as `https://breathecode.herokuapp.com/v1`.
    *   Instructs students on Postman usage for token generation (`POST {{CENTRAL_API_HOST}}/v1/auth/login/`).
    *   Explains token usage for 4Geeks API and query parameter for browser session.
    *   Includes a **Token Validator Section**: Input for token, "Validate" button, and result display area. JavaScript in `public/js/token-validator.js` handles validation against `{{CENTRAL_API_HOST}}/v1/auth/token/:token` after fetching host from `/api/app-config` (or consider hardcoding for CTF consistency).
7.  **Create `public/css/styles.css`:** (Implemented)
    *   Basic CSS for styling (dark mode implemented).
    *   **Responsiveness:** Implemented media queries for various screen sizes to ensure fluid layouts, readable fonts, and usable buttons. Includes styles for `.page-wrapper`, `.container`, `.sidebar`, welcome page elements, and the language switcher.
8.  **Create `public/welcome.html`:** (Implemented)
    *   Serves as the initial landing page (root route `/`).
    *   Introduces 4Geeks, CTF, learning outcomes. Includes a "Start" button linking to `login.html`.
    *   Styled with `welcome-container` and responsive adjustments.
9.  **Create `public/index.html` (Main CTF Dashboard):** (Implemented)
    *   Placeholder for active challenges.
    *   Includes `<link rel="stylesheet" href="/css/styles.css">`.
    *   **Sidebar UI:** Implemented a right sidebar for tutorial progress/navigation (styled and responsive).
10. **Internationalization (i18n) Setup:** (Implemented)
    *   Created `public/js/locales/en.json` and `public/js/locales/es.json`.
    *   Created `public/js/i18n.js` to handle language detection (localStorage, query param, browser default), loading translation files, and updating page content via `data-i18n-key` attributes.
    *   Added language switcher UI to `login.html` (and to be added to other pages manually).
    *   Applied i18n keys to `login.html`. (To be applied to `welcome.html`, `index.html`, and future pages).
11. **Create `api/index.js` (Backend Logic):** (Largely Implemented)
    *   Requires `express`, `node-fetch`, `express-session`, `cookie-parser`, `path`.
    *   Set up Express app, session middleware (with `SESSION_SECRET`).
    *   **Authentication Middleware (`authenticate`):** Implemented (Bearer, session, query; validation via `/v1/auth/user/me`). Handles redirects and 401s.
    *   **Unprotected Configuration Endpoint (`/api/app-config`):** Added to serve `CENTRAL_API_HOST` (used by token validator).
    *   **Static File Serving (Unprotected & Semi-Protected):**
        *   Serves `/welcome.html` (unprotected) and `/login.html` (unprotected).
        *   Serves static assets from `/css`, `/js`, `/img` (unprotected).
    *   **Protected HTML Page Routes:**
        *   `app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/welcome.html')));` (Root now serves welcome)
        *   `app.get('/index.html', authenticate, (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));`
    *   **Protected 4Geeks API Routes (under `/api/`):** Placeholder `/api/test` exists.
    *   **Logout Route (`/api/logout`):** Implemented.
    *   **Dynamic Flag Fetching Helper (`fetchDynamicFlag`):** Implemented.
12. **Create `vercel.json` Configuration File:** (Corrected)
    ```json
    {
      "version": 2,
      "builds": [
        { "src": "api/index.js", "use": "@vercel/node" }
      ],
      "rewrites": [
        { "source": "/(.*)", "destination": "/api/index.js" }
      ]
    }
    ```
    *Note: Ensure your `package.json` includes an `"engines": { "node": "22.x" }` field to guide Vercel's build Node.js version.*

13. **Create `.env.development` for Local Testing:** (Instructions provided, user to create)
    *   `CENTRAL_API_HOST=https://breathecode.herokuapp.com/v1` (Clarified for CTF)
    *   `SESSION_SECRET=a_very_strong_random_secret_string_for_sessions`

14. **Commit Current Progress:** `git add .` & `git commit -m "Implemented core auth, UI, i18n, token validator"` (User to do).

15. **Configure Environment Variables in Vercel:** (User to do).

16. **Deploy to Vercel:** (User to do) `vercel --prod`.

17. **PROGRESS CHECK (Phase 0 - Core Features):**
    *   **(Welcome Page):** Access root URL. Expected: `welcome.html` loads, looks good, responsive.
    *   **(Challenge 0 & Login):** Navigate from Welcome to `login.html`. Follow Postman instructions. Expected: Get token.
    *   **(Token Validator):** Use the validator on `login.html`. Test valid and invalid tokens. Expected: Correct feedback.
    *   **(i18n):** Test language switching on `login.html` (EN/ES links, `?lang=` query). Expected: Content and validator text updates.
    *   **(API Auth - Postman):** Test CTF API (e.g., `/api/test`) with/without token. Expected: 401 without, success with `Authorization: Token YOUR_TOKEN`.
    *   **(Browser Session):** Visit `https://your-ctf.vercel.app/index.html?token=YOUR_TOKEN`. Expected: `index.html` loads with sidebar. URL should clean (token removed from query). Session cookie set.
    *   **(Protected Page Access):** Navigate to `/index.html` directly in browser without token/session. Expected: Redirect to `/login.html`.
    *   **(Session Navigation):** After authenticating, navigate between `/index.html` and other protected pages (if any exist). Expected: Pages load due to session.
    *   **(Responsiveness):** Check `welcome.html`, `login.html`, `index.html` on various screen sizes.

**Phase 1: Basic Observation & DevTools Fundamentals Challenges**

*   **General Considerations for Challenges:**
    *   **i18n:** All new challenge text (clues in HTML, messages from API, etc.) must have entries in `en.json` and `es.json`.
    *   **HTML Structure:** Keep HTML simple. Clues are presented on static pages (e.g., `public/index.html`, or new `public/challengeX.html` files).
    *   **CTF API Endpoints:** These are for Postman interaction by students (using `Authorization: Token <value>`). They return JSON and may set headers or cookies as part of challenges. (The backend itself will use `Bearer` when calling the *external* `CENTRAL_API_HOST` for flag generation or user validation).
    *   **Client-Side JS:** Vanilla JS for simple interactions directly related to revealing a flag or triggering a step *within the browser* (e.g., console log, DOM manipulation based on an API call initiated by browser JS). Ensure this JS is minimal and easy to understand.
    *   **Flag Generation:** Use the `fetchDynamicFlag('FLAG_SLUG_HERE')` helper in `api/index.js` for all flags.
    *   **Sidebar Updates:** The sidebar in `index.html` (and potentially other main views) should reflect current challenge progress. This might require some simple client-side JS to update `current` / `completed` classes based on user actions or visited pages (could use localStorage or simple URL checks).

*Challenge 1: "The Welcome Briefing" (Flag in HTTP Response Header of a 4Geeks API call - Postman)*

18. **Define Flag Slug:** `4Geeks_CH1_WELCOME_HEADER`.
19. **Create 4Geeks API Endpoint in `api/index.js`): `/api/challenge1-briefing`:**
    *   Protected by `authenticate` middleware.
    *   Fetches dynamic flag for `4Geeks_CH1_WELCOME_HEADER`.
    *   Sets response header: `X-4Geeks-Briefing: <fetched_flag>`.
    *   Returns JSON: `{ "message": "Briefing details transmitted. Check all channels." }` (Ensure message is i18n-keyed if it varies by language, though for API responses often English is fine, or the client handles i18n of generic API messages).
20. **Update `public/index.html` - Challenge 1 Clue:**
    *   Add a section for Challenge 1.
    *   Clue (i18n-keyed): "Welcome, Agent... Use Postman to `GET /api/challenge1-briefing`. Inspect all parts of the response for an `X-4Geeks-Briefing` header."
21. **Commit & Deploy.**
22. **PROGRESS CHECK (1):** Use Postman with `Authorization: Token YOUR_TOKEN` to `GET /api/challenge1-briefing`. Expected: `X-4Geeks-Briefing` header contains flag.

*Challenge 2: "The Whispered Secret" (Flag in Console Log - Vanilla JS on a page)*

23. **Define Flag Slug:** `4Geeks_CH2_CONSOLE_SECRET`.
24. **Create new page `public/challenge2.html` (or add section to `index.html`).** Add route in `api/index.js` to serve it, protected by `authenticate`.
    *   Clue on page (i18n-keyed): "Sometimes secrets are meant only for your browser's ears. Check the developer console on this page after the special announcement loads."
25. **Create 4Geeks API Endpoint in `api/index.js`: `/api/challenge2-secret-for-console`:**
    *   Protected by `authenticate`.
    *   Fetches flag for `4Geeks_CH2_CONSOLE_SECRET`.
    *   Returns JSON (i18n-keyed if needed): `{ "secretMessage": "<fetched_flag>" }`.
26. **Add Vanilla JavaScript to `public/challenge2.html` (or the relevant section):**
    *   `fetch('/api/challenge2-secret-for-console') .then(res => res.json()).then(data => console.log("4Geeks Internal Memo (Flag): " + data.secretMessage));`
27. **Commit & Deploy.**
28. **PROGRESS CHECK (2):** Establish browser session. Navigate to the page for Challenge 2. Open console. Expected: Flag logged.

*(Further challenges will follow a similar pattern, focusing on different HTTP aspects like request bodies, query parameters, status codes, cookies, local storage, WebSockets, etc.)*

**Phase 2: Intermediate Challenges (Expanding on DevTools and HTTP Concepts)**
*   (To be detailed: Challenges involving specific HTTP methods, status codes, request/response bodies, cookies, localStorage, basic WebSocket inspection.)

**Phase 3: Advanced Challenges & Review**
*   (To be detailed: More complex scenarios, possibly combining multiple techniques.)

**Final Steps:**
*   Thorough testing of all challenges and application flows.
*   Gather feedback and iterate. 