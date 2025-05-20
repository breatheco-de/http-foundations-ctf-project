# CTF Design Plan: HTTP Intercept & Decode Agency (4Geeks)

## Core Principle:
Students will act as "HTTP Detectives" or "Network Analysts." Each challenge ("Case File") will require them to use specific tools to investigate and understand how data is transmitted and stored in web applications. The focus is on learning *where* to look for information within HTTP communications and browser storage, and *why* it's found there, rather than random discovery. **No programming or script writing will be required by students.**

## I. Overall CTF Structure & Narrative:

1.  **Onboarding:** Students are "new recruits" at 4Geeks. They receive a briefing and access to a target web application/portal which they will investigate.
2.  **Case Files (Challenges):** A series of progressively difficult cases are presented. Each case focuses on specific tools, HTTP concepts, and common data locations.
3.  **Objective:** For each case, students must use the specified tools to locate a flag, demonstrating their understanding of the targeted concept.
4.  **Flag Format:** `FLAG{s0m3_d3script1v3_t3xt_h3r3}`
5.  **Winning:** Successfully submitting all flags, thereby demonstrating a solid understanding of HTTP debugging techniques.

## II. Technical Infrastructure:

1.  **Single Online Server:**
    *   Hosts a simple web application (HTML, CSS, minimal JS for dynamic content to trigger API calls).
    *   Hosts a backend API that the web application interacts with. This API is the primary target for many challenges.
2.  **Web Application ("Target App"):**
    *   A few interconnected pages (e.g., a mock login, a dashboard, a "secret messages" section, a settings page).
    *   Designed to make various types of HTTP requests (GET, POST) to its own backend API.
    *   Intentionally embeds clues or triggers for challenges (e.g., a button that makes a specific API call, comments in HTML, JS that logs to console).
3.  **Backend API (The "Leaky" or "Challenge" API):**
    *   Multiple endpoints (e.g., `/api/user_profile`, `/api/messages`, `/api/config`, `/api/submit_report`, `/api/get_secret_document`).
    *   **Flag Delivery Mechanism:** This API will serve the flags when students interact with it correctly using the tools, demonstrating specific HTTP concepts. Flags can be located:
        *   In HTTP response headers (e.g., `X-Flag: FLAG{...}`) – illustrating metadata transmission.
        *   In HTTP response bodies (e.g., within a JSON object, as an HTML comment, or plain text) – showing how primary data is sent.
        *   Revealed after a specific sequence of interactions or correct request formulation (e.g., a POST request with the right body to an endpoint) – demonstrating stateful interaction or correct API usage.
    *   **Challenge-Specific Behaviors:**
        *   Endpoints that require specific request headers (e.g., `X-Auth-Token`, custom `User-Agent`) – teaching about headers for auth, control, or identification.
        *   Endpoints that expect specific query parameters – demonstrating data filtering or specification.
        *   Endpoints that expect specific request bodies (JSON, form data) – showing how client data is sent to the server.
        *   Endpoints that return different status codes based on the input, with flags sometimes hidden in non-200 responses – teaching interpretation of server states.
        *   Endpoints that interact with cookies or set values in local storage via frontend JS for later inspection – illustrating client-side storage mechanisms.

## III. Student Toolset (Mandatory & Exclusive):

*   **Browser Developer Tools:**
    *   **Network Tab:** For inspecting all HTTP requests/responses, headers, payloads, status codes, timing.
    *   **Console Tab:** For finding messages logged by client-side JavaScript.
    *   **Application Tab:** For inspecting cookies, local storage, session storage.
*   **Postman (or similar API GUI tool like Insomnia):** For crafting and sending custom HTTP requests, managing headers, bodies, and parameters outside the browser.

## IV. Challenge Design & Progression:

The challenges should be structured to introduce tools and concepts incrementally, with clear guidance on where to look and why.

### Phase 1: Basic Observation & DevTools Fundamentals

*   **Challenge 1: "The Welcome Briefing"**
    *   **Objective:** Understand that servers can send metadata in HTTP response headers. Find a flag located in a custom response header.
    *   **Scenario:** The main page of the Target App includes a special welcome message from the server, not visible on the page itself.
    *   **Task:** The server often sends important, non-visible metadata in HTTP response headers. For this challenge, the flag is located in a custom HTTP response header named `X-Welcome-Agent` when you load the main page. Use the Network Tab to inspect the response headers for the main page load and find this flag.
    *   **Tool:** Network Tab.
*   **Challenge 2: "The Whispered Secret"**
    *   **Objective:** Learn that client-side JavaScript can log information to the browser's console.
    *   **Scenario:** A piece of client-side code on the dashboard page logs a "sensitive" piece of information for debugging purposes.
    *   **Task:** Client-side JavaScript can log information directly to the browser's console for debugging or informational purposes. On the dashboard page, a script logs a flag. Open the Console Tab to view this message and retrieve the flag.
    *   **Tool:** Console Tab.
*   **Challenge 3: "The Temporary Passcode"**
    *   **Objective:** Discover how web applications use Local or Session Storage for temporary client-side data.
    *   **Scenario:** Visiting a "settings" page in the Target App temporarily stores a user-specific passcode in the browser's storage.
    *   **Task:** Web applications sometimes store temporary user-specific data in the browser's Local Storage or Session Storage. After visiting the 'settings' page, a flag representing a temporary passcode is stored there. Use the Application Tab to inspect Local/Session Storage and find the flag.
    *   **Tool:** Application Tab.
*   **Challenge 4: "Cookie Trail"**
    *   **Objective:** Understand the role of cookies in storing persistent small data pieces across requests.
    *   **Scenario:** The Target App sets a specific cookie to "remember" a user preference after a certain action.
    *   **Task:** Cookies are often used to store small pieces of data that persist across requests, like session identifiers or preferences. After performing a specific action on the page (e.g., interacting with the 'remember me' feature), a cookie containing the flag will be set. Use the Application Tab to inspect your cookies and find this flag.
    *   **Tool:** Application Tab.

### Phase 2: API Interaction with DevTools & Introduction to Postman

*   **Challenge 5: "Eavesdropping on the Wire"**
    *   **Objective:** Learn to inspect the payload of API responses for dynamic content.
    *   **Scenario:** The dashboard page fetches user details dynamically from an API. The flag is embedded within this data.
    *   **Task:** Modern web apps fetch dynamic data using API calls. The dashboard page makes an API call to get user details, and the server includes the flag within the JSON data of this response. Use the Network Tab to find this XHR/Fetch request and examine its response body (payload) to locate the flag.
    *   **Tool:** Network Tab.
*   **Challenge 6: "Replaying the Message (Postman GET)"**
    *   **Objective:** Practice using Postman to make a basic GET request to an API endpoint and inspect its raw response.
    *   **Scenario:** You've observed an API endpoint (e.g., `/api/server_status`) in the Network Tab that the frontend doesn't fully utilize or display.
    *   **Task:** Sometimes, you'll want to re-request an API endpoint outside the browser to analyze its raw response. You've observed an API call to `/api/server_status` in the Network Tab. Use Postman to make a GET request to this same URL. The flag is directly in the response body from this endpoint.
    *   **Tool:** Network Tab (to identify URL), Postman.
*   **Challenge 7: "Querying the Database (Postman GET with Params)"**
    *   **Objective:** Understand how query parameters are used to filter or request specific data from an API.
    *   **Scenario:** An API endpoint `/api/search_records` reveals specific information, including the flag, only when a correct query parameter is provided.
    *   **Task:** APIs often use query parameters to filter or specify data. The endpoint `/api/search_records` expects a query parameter (e.g., `record_id=42_secret`) to return specific information, including the flag. A hint for the parameter is available [source of hint, e.g., HTML comment on a related page]. Use Postman to construct this GET request with the correct parameter and find the flag in the response.
    *   **Tool:** Postman.

### Phase 3: Advanced API Interaction with Postman

*   **Challenge 8: "Sending a Coded Report (Postman POST)"**
    *   **Objective:** Learn to send data to a server using a POST request with a structured JSON body.
    *   **Scenario:** The Target App has a feature to "submit a report" via a POST request to `/api/submit_report`, which expects data in a specific JSON format.
    *   **Task:** POST requests are used to send data to a server, often in a structured format like JSON. The `/api/submit_report` endpoint expects a specific JSON payload. Observe an example from the Network Tab or use the provided hints to craft this JSON body in Postman. A successful POST with the correct body will return the flag in its response, demonstrating successful data submission.
    *   **Tool:** Network Tab (optional, for observation), Postman.
*   **Challenge 9: "Bypassing Security (Custom Headers)"**
    *   **Objective:** Understand how custom HTTP headers can be used for purposes like authentication or passing specific metadata.
    *   **Scenario:** An endpoint `/api/secure_data` requires a custom `X-Agent-ID` header for access.
    *   **Task:** Custom HTTP headers are sometimes used for authentication or to pass specific metadata. The `/api/secure_data` endpoint requires an `X-Agent-ID` header with a specific value (hinted elsewhere) to grant access. Use Postman to send a GET request to this endpoint, including this custom header, to retrieve the flag from the response.
    *   **Tool:** Postman.
*   **Challenge 10: "The Imposter Protocol (User-Agent)"**
    *   **Objective:** Learn about the User-Agent header and how servers might use it to alter behavior.
    *   **Scenario:** A legacy API endpoint `/api/legacy_system_access` only provides full data if it detects a specific (older) User-Agent.
    *   **Task:** The User-Agent header tells the server about the client making the request. Some legacy systems might only respond correctly to specific User-Agents. The `/api/legacy_system_access` endpoint is one such case. Find the required User-Agent string (hinted) and use Postman to make a GET request, modifying the User-Agent header. The flag will be in the response from the correctly identified client type.
    *   **Tool:** Postman.
*   **Challenge 11: "Wrong Method, Wrong Door"**
    *   **Objective:** Understand that API endpoints are designed for specific HTTP methods and how to discover allowed methods (e.g., using OPTIONS).
    *   **Scenario:** An endpoint `/api/resource_info` is typically accessed with GET, but an OPTIONS request might reveal more about its capabilities.
    *   **Task:** Different HTTP methods (GET, POST, OPTIONS, etc.) serve different purposes. The OPTIONS method can be used to find out what methods an endpoint supports. A developer note hints that sending an OPTIONS request to `/api/resource_info` might reveal more. Use Postman to do this; the flag is often found in the `Allow` header or the body of the OPTIONS response, indicating the server's capabilities.
    *   **Tool:** Postman.

### Phase 4: Multi-Step Investigation & Troubleshooting

*   **Challenge 12: "The Chained Clues"**
    *   **Objective:** Combine learnings to follow a multi-step trail involving different data locations and tools.
    *   **Scenario:** A series of clues must be followed: a console message hints at an API path and a token stored in cookies. This token is then needed for a Postman request.
    *   **Task:** Follow the clues: 1. A console log message gives a partial API path and mentions a 'token in cookies.' 2. Find the token in your browser's cookies (Application Tab). 3. Construct the full API request in Postman, using this token in an appropriate header (e.g., `Authorization: Token <token>` or a custom header like `X-Auth-Token`). The flag is in the response to this successful Postman request.
    *   **Tools:** Console Tab, Application Tab, Postman.
*   **Challenge 13: "The Faulty Redirect"**
    *   **Objective:** Analyze HTTP redirects and understand that data can exist in intermediate responses.
    *   **Scenario:** Clicking a link in the Target App results in an HTTP redirect (301/302). Important information (the flag) is present in a header of the initial response, before the browser automatically follows the redirect.
    *   **Task:** Redirects are common, but sometimes interesting data is passed in the *initial* response before the browser automatically follows to the new location. The flag is in a custom header of this *first* response in the redirect chain. Use the Network Tab (with 'Preserve log' enabled to see all parts of the redirect) or Postman (which may not auto-follow redirects by default, allowing inspection of the 30x response) to inspect these headers and find the flag.
    *   **Tools:** Network Tab, Postman.

## V. Flag Validation & CTF Platform:

*   The CTF platform (the website students interact with for challenges) will have a simple input field per challenge to submit flags.
*   Backend validation checks the submitted flag against the expected one for that challenge.
*   The "API endpoint for flag generation" mentioned in your prompt will be internal to the CTF platform. It means the *CTF system* might generate unique flags per student session for certain challenges if desired, or simply has a list of static flags. Students do *not* directly call a `/generate-flag` endpoint to get their flags; they *find* them by successfully completing the investigative task.

## VI. Hints & Learning Material:

*   Brief explanations of each tool and relevant HTTP concepts could be provided before or alongside challenges.
*   A tiered hint system for each challenge (e.g., first hint: "Focus on how servers send non-visible metadata.", second hint: "Check the HTTP response headers specifically."). 