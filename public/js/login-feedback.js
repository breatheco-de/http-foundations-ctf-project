document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const status = params.get('status');
    let payload = params.get('payload');
    let message = params.get('message');

    const feedbackArea = document.getElementById('loginFeedbackArea'); // We'll need to add this div to login.html

    if (feedbackArea && error) {
        let feedbackHTML = '<div class="error-box">'; // Add some styling for this box

        if (error === 'invalid_token') {
            feedbackHTML += '<p><strong>Authentication Failed:</strong> Your token could not be validated.</p>';
            if (status) {
                feedbackHTML += `<p><strong>Status Code:</strong> ${status}</p>`;
            }
            if (payload) {
                try {
                    // Try to parse if it's JSON, for better display
                    const decodedPayload = decodeURIComponent(payload);
                    const parsedPayload = JSON.parse(decodedPayload);
                    feedbackHTML += '<strong>Response:</strong><pre>' + JSON.stringify(parsedPayload, null, 2) + '</pre>';
                } catch (e) {
                    // If not JSON or error parsing, show raw (decoded) payload
                    feedbackHTML += '<strong>Response:</strong><pre>' + decodeURIComponent(payload) + '</pre>';
                }
            }
        } else if (error === 'validation_failed') {
            feedbackHTML += '<p><strong>Authentication Error:</strong> The token validation process encountered an issue.</p>';
            if (message) {
                feedbackHTML += `<p><strong>Details:</strong> ${decodeURIComponent(message)}</p>`;
            }
        } else if (error === 'authentication_required') {
            feedbackHTML += '<p><strong>Authentication Required:</strong> Access to the requested page is protected.</p>';
            if (message) {
                feedbackHTML += `<p><strong>Instructions:</strong> ${decodeURIComponent(message)}</p>`;
            }
        } else {
            feedbackHTML += '<p>An unspecified authentication error occurred.</p>';
        }
        feedbackHTML += '</div>';
        feedbackArea.innerHTML = feedbackHTML;
    }
}); 