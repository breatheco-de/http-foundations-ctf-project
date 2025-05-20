document.addEventListener('DOMContentLoaded', () => {
    const dynamicUrlElement = document.getElementById('dynamicAppUrlBase');
    if (dynamicUrlElement) {
        dynamicUrlElement.textContent = window.location.origin;
    }
}); 