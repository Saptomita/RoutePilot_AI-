import './style.css';
import './profile.css';

document.addEventListener("DOMContentLoaded", () => {
    // Basic interaction logic for Settings Page
    
    // Back to Map
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // 1. Load saved data on startup
    const loadProfileData = () => {
        const savedData = localStorage.getItem('userProfileData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Identity
            if (data.name) {
                document.getElementById('profile-name').value = data.name;
                document.getElementById('display-name').innerText = data.name;
            }
            if (data.phone) document.getElementById('profile-phone').value = data.phone;
            if (data.email) document.getElementById('profile-email').value = data.email;
            if (data.password) document.getElementById('profile-password').value = data.password;
            
            // System Preferences
            if (data.theme) document.getElementById('theme-preset').value = data.theme;
            if (data.weather) document.getElementById('weather-source').value = data.weather;
            if (data.vehicle) document.getElementById('vehicle-type').value = data.vehicle;
            if (data.notifications !== undefined) {
                document.getElementById('notifications-toggle').checked = data.notifications;
            }
        }
    };

    loadProfileData();

    // Form Submission / Save
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 2. Collect Data
            const profileName = document.getElementById('profile-name').value;
            const profileData = {
                name: profileName,
                phone: document.getElementById('profile-phone').value,
                email: document.getElementById('profile-email').value,
                password: document.getElementById('profile-password').value,
                theme: document.getElementById('theme-preset').value,
                weather: document.getElementById('weather-source').value,
                vehicle: document.getElementById('vehicle-type').value,
                notifications: document.getElementById('notifications-toggle').checked
            };
            
            // 3. Save to Local Storage
            localStorage.setItem('userProfileData', JSON.stringify(profileData));
            
            // Update left panel identity preview
            document.getElementById('display-name').innerText = profileName;

            // Visual Save Button Feedback
            const btn = form.querySelector('.save-btn');
            const originalContent = btn.innerHTML;
            
            // Simulate Save loading state
            btn.innerHTML = "<span>Syncing with Cloud...</span>";
            btn.style.opacity = "0.7";
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = "<span>Configuration Locked!</span>";
                btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
                btn.style.opacity = "1";
                
                // Optional: Update global app state if needed
                
                setTimeout(() => {
                    // Reset button to original state
                    btn.innerHTML = originalContent;
                    btn.style.background = ""; // reverts to CSS class gradient
                    btn.style.opacity = "";
                    btn.disabled = false;
                }, 2000);
                
            }, 1000);
        });
    }
});
