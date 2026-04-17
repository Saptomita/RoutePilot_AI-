import './style.css';
import './profile.css';

document.addEventListener("DOMContentLoaded", () => {
    // Basic interaction logic for Settings Page

    // Back to Map
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            window.location.href = './index.html';
        });
    }

    // 1. Load saved data on startup
    const loadProfileData = () => {
        const savedData = localStorage.getItem('userProfileData');
        if (savedData) {
            const data = JSON.parse(savedData);

            // Helper to safely set values
            const safeSetVal = (id, val) => {
                const el = document.getElementById(id);
                if (el && val !== undefined) el.value = val;
            };

            // Identity
            safeSetVal('profile-name', data.name);
            if (data.name) {
                const displayEl = document.getElementById('display-name');
                if (displayEl) displayEl.innerText = data.name;
            }
            safeSetVal('profile-phone', data.phone);
            safeSetVal('profile-email', data.email);
            safeSetVal('profile-password', data.password);

            // System Preferences
            safeSetVal('theme-preset', data.theme);
            safeSetVal('weather-source', data.weather);
            safeSetVal('vehicle-type', data.vehicle);

            if (data.notifications !== undefined) {
                const toggle = document.getElementById('notifications-toggle');
                if (toggle) toggle.checked = data.notifications;
            }
        }
    };

    loadProfileData();

    // Form Submission / Save
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Helper to safely get values
            const safeGetVal = (id) => {
                const el = document.getElementById(id);
                return el ? el.value : null;
            };

            const profileName = safeGetVal('profile-name');
            const profileData = {
                name: profileName,
                phone: safeGetVal('profile-phone'),
                email: safeGetVal('profile-email'),
                password: safeGetVal('profile-password'),
                theme: safeGetVal('theme-preset'),
                weather: safeGetVal('weather-source'),
                vehicle: safeGetVal('vehicle-type')
            };

            const toggle = document.getElementById('notifications-toggle');
            if (toggle) profileData.notifications = toggle.checked;

            localStorage.setItem('userProfileData', JSON.stringify(profileData));

            if (profileName) {
                const displayEl = document.getElementById('display-name');
                if (displayEl) displayEl.innerText = profileName;
            }

            const btn = form.querySelector('.save-btn');
            if (btn) {
                const originalContent = btn.innerHTML;
                btn.innerHTML = "<span>Syncing with Cloud...</span>";
                btn.style.opacity = "0.7";
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = "<span>Configuration Locked!</span>";
                    btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
                    btn.style.opacity = "1";

                    setTimeout(() => {
                        btn.innerHTML = originalContent;
                        btn.style.background = "";
                        btn.style.opacity = "";
                        btn.disabled = false;
                    }, 2000);
                }, 1000);
            }
        });
    }
});
