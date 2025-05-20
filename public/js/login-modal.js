document.addEventListener('DOMContentLoaded', () => {
    const openModalButton = document.getElementById('openDashboardModalButton');
    const closeModalButton = document.getElementById('closeDashboardModalButton');
    const modalOverlay = document.getElementById('dashboardModalOverlay');
    const dynamicDashboardUrlBase = document.getElementById('dynamicDashboardUrlBase');

    if (openModalButton && closeModalButton && modalOverlay) {
        openModalButton.addEventListener('click', () => {
            if (dynamicDashboardUrlBase) {
                dynamicDashboardUrlBase.textContent = window.location.origin;
            }
            modalOverlay.style.display = 'flex';
        });

        closeModalButton.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });

        // Optional: Close modal if user clicks outside the modal content (on the overlay)
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });
    }
}); 