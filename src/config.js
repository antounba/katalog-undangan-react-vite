// src/config.js
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Jika di laptop pakai localhost, jika di server pakai IP Server aaPanel
export const API_BASE_URL = isLocalhost
    ? "http://localhost:5000"
    : "https://api-undangan.arscomcopy.online";

export const API_ENDPOINTS = {
    katalog: `${API_BASE_URL}/api/katalog`,
    login: `${API_BASE_URL}/api/login`,
    signup: `${API_BASE_URL}/api/signup`,
    updateProfile: `${API_BASE_URL}/api/update-profile`,
    changePassword: `${API_BASE_URL}/api/change-password`,
};

