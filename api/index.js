const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;

// Environment Variables (ensure these are set in Vercel)
const CENTRAL_API_HOST = process.env.CENTRAL_API_HOST;
const FLAG_API_TOKEN = process.env.FLAG_API_TOKEN; // For HIDA backend to generate flags
const ACADEMY_ID = process.env.ACADEMY_ID; // For HIDA backend to generate flags
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_very_secure_secret_key_fallback_for_dev';

app.use(cookieParser());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Helps prevent XSS attacks
        sameSite: 'lax' // Mitigates CSRF attacks
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Authentication Middleware (`authenticate`) ---
const authenticate = async (req, res, next) => {
    let token = null;

    // 1. Check for Token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Token ')) {
        token = authHeader.substring(6);
    }

    // 2. If no header token, check session. Populate token to be validated further.
    if (!token && req.session.authToken) {
        token = req.session.authToken; 
    }

    // 3. If no Token from header or session, check query parameter (for initial session setup)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (token) {
        if (!CENTRAL_API_HOST) {
            console.error('CENTRAL_API_HOST environment variable is not set.');
            return res.status(500).send('Server configuration error. Please contact an administrator.');
        }
        try {
            const validationUrl = `${CENTRAL_API_HOST}/auth/user/me`;
            const fetchOptions = {
                method: 'GET',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
            };
            console.log('Attempting to validate token. URL:', validationUrl);
            console.log('Fetch options for CENTRAL_API_HOST:', JSON.stringify(fetchOptions, null, 2));

            const response = await fetch(validationUrl, fetchOptions);

            if (response.ok) {
                const userData = await response.json();
                console.log('Token validated successfully for user:', userData.id);
                req.session.authToken = token; // Store/update token in session

                // If token came from query string for an HTML page (NOT an API route), redirect to clean URL, keeping other query params
                if (req.query.token && req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api/')) {
                    let originalPath = req.path === '/login.html' ? '/' : req.path;
                    
                    const queryParams = { ...req.query };
                    delete queryParams.token; // Remove only the token

                    const remainingQueryString = new URLSearchParams(queryParams).toString();
                    
                    if (remainingQueryString) {
                        return res.redirect(`${originalPath}?${remainingQueryString}`);
                    } else {
                        return res.redirect(originalPath);
                    }
                }
                return next(); // Token is valid
            } else {
                const errorStatus = response.status;
                const errorPayload = await response.text(); // Get raw text, could be HTML for some errors
                console.warn(`Token validation failed with ${token}: ${errorStatus} ${errorPayload}`);
                req.session.destroy(); // Clear any potentially invalid session
                if (req.accepts('html')) {
                    return res.redirect(`/login.html?error=invalid_token&status=${errorStatus}&payload=${encodeURIComponent(errorPayload)}`);
                } else {
                    // For API requests, return JSON with details
                    let details = errorPayload;
                    try {
                        details = JSON.parse(errorPayload); // Try to parse if it's JSON
                    } catch (e) { /* ignore if not JSON */ }
                    return res.status(errorStatus).json({ error: 'Invalid or expired token.', details });
                }
            }
        } catch (error) {
            console.error('Error during token validation:', error);
            req.session.destroy();
            if (req.accepts('html')) {
                return res.redirect(`/login.html?error=validation_failed&message=${encodeURIComponent(error.message)}`);
            } else {
                return res.status(500).json({ error: 'Token validation process failed.', details: error.message });
            }
        }
    } else {
        // No token provided. This means authenticate was called on a protected route, 
        // and no token was found in Authorization header, session, or query param.
        
        if (req.accepts('html')) {
            const message = "Authentication is required to access this page. Please complete Challenge 0 to obtain a token, then use it to start a session (e.g., by appending ?token=YOUR_TOKEN to the URL of the page you were trying to access, or to /index.html).";
            return res.redirect(`/login.html?error=authentication_required&message=${encodeURIComponent(message)}`);
        } else {
            // For API requests, return 401 JSON
            return res.status(401).json({ error: 'Authentication required. Provide an Authorization header (e.g., Token YOUR_TOKEN) or establish a session.' });
        }
    }
};

// --- Static File Serving (Unprotected) ---
// Welcome and Login pages are explicitly served to bypass auth
app.get('/welcome.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/welcome.html'));
});

app.get('/login.html', (req, res) => {
    // Can add logic here to display error messages based on req.query.error on the login.html if desired
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/img', express.static(path.join(__dirname, '../public/img'))); // For logos, etc.

// --- Unprotected API Route for Frontend Configuration ---
app.get('/api/app-config', (req, res) => {
    if (!CENTRAL_API_HOST) {
        console.error('CENTRAL_API_HOST is not set on the server for /api/app-config');
        // Avoid sending a 500 if it's a non-critical config for some parts of the app
        // but for token validation, it IS critical.
        return res.status(503).json({ error: 'Server configuration for API host is missing.' });
    }
    res.json({
        centralApiHost: CENTRAL_API_HOST
    });
});

// --- Protected HTML Page Routes ---
app.get('/', (req, res) => {
    // Check if lang query parameter exists
    const lang = req.query.lang;
    if (lang && ['en', 'es'].includes(lang)) {
        // If lang is present and valid, set it in localStorage via a script
        // and then redirect to welcome.html
        res.send(`
            <script>
                localStorage.setItem('selectedLanguage', '${lang}');
                window.location.href = '/welcome.html';
            </script>
        `);
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'select-language.html'));
    }
});

app.get('/index.html', authenticate, (req, res) => { // This is the main dashboard, protected
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Example for a future dashboard page
app.get('/dashboard.html', authenticate, (req, res) => {
    // For now, just send index, or create a public/dashboard.html
    // res.sendFile(path.join(__dirname, '../public/dashboard.html')); 
    res.send('<h1>Dashboard (Protected)</h1><p>Session is active.</p><a href="/">Home</a> <a href="/api/logout">Logout</a>');
});

// --- Protected HIDA API Routes (under /api/) ---
app.get('/api/test', authenticate, (req, res) => {
    res.json({ 
        message: "API is working! You are authenticated.", 
        userId: req.session.userId || 'N/A' // Example: access user data stored in session if any
    });
});

// --- Logout Route ---
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login.html'); // Redirect to login page
    });
});

// --- Helper function for fetching dynamic flags (to be used in challenges) ---
async function fetchDynamicFlag(slug, studentToken, academyId) {
    if (!CENTRAL_API_HOST) {
        console.error('Missing CENTRAL_API_HOST in .env');
        throw new Error('Server configuration error for flag generation (missing API host).');
    }
    if (!studentToken) {
        console.error('Missing studentToken for flag generation.');
        throw new Error('Authentication token is required to generate a flag.');
    }
    if (!academyId) {
        console.error('Missing academyId for flag generation.');
        throw new Error('Academy ID is required to generate a flag.');
    }

    const url = `${CENTRAL_API_HOST}/v1/assignment/academy/asset/${slug}/flag`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${studentToken}`,
                'Academy': academyId,
                'Content-Type': 'application/json' 
            }
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error fetching flag for ${slug} (Academy: ${academyId}): ${response.status} - ${errorBody}`);
            throw new Error(`Failed to fetch flag (${response.status})`);
        }
        const data = await response.json();
        if (!data.flag) {
            console.error(`Flag field not found in response for ${slug} (Academy: ${academyId}):`, data);
            throw new Error('Flag not found in API response.');
        }
        return data.flag;
    } catch (error) {
        console.error(`Exception while fetching flag for ${slug} (Academy: ${academyId}):`, error);
        throw error; // Re-throw to be handled by the caller route
    }
}

// --- Example Protected Route for a Challenge that needs a dynamic flag ---
app.get('/api/challenge/1/flag', authenticate, async (req, res) => {
    const studentToken = req.session.authToken || 
                         (req.headers.authorization && req.headers.authorization.startsWith('Token ') ? req.headers.authorization.substring(6) : null);
    const academyId = req.query.academy; // Expecting something like /api/challenge/1/flag?academy=YOUR_ACADEMY_ID
    const challengeSlug = 'challenge_1_slug'; // Replace with actual slug for the challenge

    if (!studentToken) {
        return res.status(401).json({ error: 'Authentication token not found in session or header.' });
    }

    if (!academyId) {
        return res.status(400).json({ error: 'Academy ID is required as a query parameter (e.g., ?academy=123).' });
    }

    try {
        const flag = await fetchDynamicFlag(challengeSlug, studentToken, academyId);
        res.json({ flag: flag, message: "Challenge 1 flag retrieved successfully!" });
    } catch (error) {
        console.error("Error in challenge flag route:", error.message);
        res.status(500).json({ error: error.message || 'Could not retrieve challenge flag.' });
    }
});

// Challenge 1: "The Welcome Briefing"
// Flag in HTTP Response Header of a 4Geeks API call - Postman
app.get('/api/challenge1-briefing', authenticate, async (req, res) => {
    console.log(`[${new Date().toISOString()}] /api/challenge1-briefing: Received request.`);
    console.log(`Original URL: ${req.originalUrl}`);
    console.log('Query parameters (req.query):', req.query);

    const studentToken = req.session.authToken || 
                         (req.headers.authorization && req.headers.authorization.startsWith('Token ') ? req.headers.authorization.substring(6) : null);
    const academyId = req.query.academy;
    const challengeSlug = '4Geeks_CH1_WELCOME_HEADER';

    if (!studentToken) {
        return res.status(401).json({ error: 'Authentication token not found in session or header for challenge briefing.' });
    }
    if (!academyId) {
        return res.status(400).json({ error: 'Academy ID is required as a query parameter (e.g., ?academy=123).' });
    }

    try {
        const flag = await fetchDynamicFlag(challengeSlug, studentToken, academyId);
        res.setHeader('X-4Geeks-Briefing', flag);
        res.json({ message: "Briefing details transmitted. Check all channels." }); // This message can be i18n-keyed on the client if needed
    } catch (error) {
        console.error(`Error in /api/challenge1-briefing for academy ${academyId}:`, error.message);
        res.status(500).json({ error: error.message || 'Could not retrieve challenge briefing.' });
    }
});

// Global error handler (optional, but good practice)
app.use((err, req, res, next) => {
    console.error("[Global Error Handler]:", err.stack);
    res.status(500).send('Something broke on the server!');
});

// Start the server
if (process.env.NODE_ENV !== 'test') { // Avoid EADDRINUSE error during tests if any
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app; // For Vercel compatibility 