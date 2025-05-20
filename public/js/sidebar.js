document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebarElement = document.getElementById('sidebarMenu'); // Bootstrap offcanvas ID
    const apiHostDisplay = document.getElementById('apiHostDisplay');
    const copyApiHostButton = document.getElementById('copyApiHostButton');
    const copyFeedback = document.getElementById('copyFeedback');

    let sidebarOffcanvasInstance = null;
    if (sidebarElement) {
        sidebarOffcanvasInstance = new bootstrap.Offcanvas(sidebarElement);
    }

    if (apiHostDisplay) {
        apiHostDisplay.value = window.location.origin;
    }

    if (copyApiHostButton && apiHostDisplay && copyFeedback) {
        copyApiHostButton.addEventListener('click', () => {
            navigator.clipboard.writeText(apiHostDisplay.value)
                .then(() => {
                    copyFeedback.textContent = 'Copied!';
                    copyFeedback.classList.remove('text-danger');
                    copyFeedback.classList.add('text-success');
                    copyApiHostButton.disabled = true;
                    setTimeout(() => {
                        copyFeedback.textContent = '';
                        copyApiHostButton.disabled = false;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy API host:', err);
                    copyFeedback.textContent = 'Failed to copy!';
                    copyFeedback.classList.remove('text-success');
                    copyFeedback.classList.add('text-danger');
                    copyApiHostButton.disabled = true;
                    setTimeout(() => {
                        copyFeedback.textContent = '';
                        copyApiHostButton.disabled = false;
                    }, 2000);
                });
        });
    }

    // Hamburger menu functionality for Bootstrap Offcanvas
    // The hamburger button itself uses data-bs-toggle="offcanvas" and data-bs-target="#sidebarMenu"
    // So, explicit JS for toggling might not be strictly necessary unless we want to do more.
    // However, keeping the aria-expanded attribute update is good practice.
    if (hamburgerMenu && sidebarElement) {
        // Optional: Listen to Bootstrap's events if needed
        sidebarElement.addEventListener('show.bs.offcanvas', function () {
            hamburgerMenu.setAttribute('aria-expanded', 'true');
        });

        sidebarElement.addEventListener('hide.bs.offcanvas', function () {
            hamburgerMenu.setAttribute('aria-expanded', 'false');
        });
    }
}); 