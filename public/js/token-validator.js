document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('tokenInput');
    const validateTokenButton = document.getElementById('validateTokenButton');
    const validationResultArea = document.getElementById('validationResult');

    let centralApiHost = null;

    // Fetch the API host from our backend config endpoint
    fetch('/api/app-config')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching app config: ${response.status}`);
            }
            return response.json();
        })
        .then(config => {
            if (config && config.centralApiHost) {
                centralApiHost = config.centralApiHost;
                console.log('Central API Host loaded:', centralApiHost);
                if(validateTokenButton) validateTokenButton.disabled = false; // Enable button once host is loaded
            } else {
                throw new Error('Central API Host not found in app config response.');
            }
        })
        .catch(error => {
            console.error('Failed to load Central API Host:', error);
            if(validationResultArea) validationResultArea.innerHTML = `<p style="color: #cf6679;">Error: Could not load API configuration. Token validation is unavailable. ${error.message}</p>`;
            if(validateTokenButton) validateTokenButton.disabled = true;
        });

    if (validateTokenButton) {
        validateTokenButton.disabled = true; // Disabled until API host is loaded

        validateTokenButton.addEventListener('click', async () => {
            if (!centralApiHost) {
                validationResultArea.innerHTML = '<p style="color: #cf6679;">Error: API configuration not loaded. Cannot validate token.</p>';
                return;
            }

            const token = tokenInput.value.trim();
            if (!token) {
                validationResultArea.innerHTML = '<p style="color: #cf6679;">Please enter a token to validate.</p>';
                return;
            }

            validationResultArea.innerHTML = '<p>Validating token...</p>';

            try {
                const response = await fetch(`${centralApiHost}/auth/token/${token}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json' // Explicitly request JSON
                    }
                });

                const responseBody = await response.text(); // Get raw text first to handle non-JSON error responses
                let responseData;
                try {
                    responseData = JSON.parse(responseBody);
                } catch (e) {
                    responseData = { raw_response: responseBody }; // If not JSON, store raw response
                }

                let resultHTML = `
                    <p><strong>Status Code:</strong> ${response.status}</p>
                    <p><strong>Response Body:</strong></p>
                    <pre>${JSON.stringify(responseData, null, 2)}</pre>
                `;

                if (response.ok) {
                    resultHTML = `<p style="color: #66bb6a;">Token is valid!</p>${resultHTML}`;
                } else {
                    resultHTML = `<p style="color: #cf6679;">Token validation failed.</p>${resultHTML}`;
                }
                validationResultArea.innerHTML = resultHTML;

            } catch (error) {
                console.error('Error during token validation:', error);
                validationResultArea.innerHTML = `<p style="color: #cf6679;">An error occurred while validating the token: ${error.message}</p>`;
            }
        });
    }
}); 