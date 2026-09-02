// frontend\src\config.js
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Mengambil URL dari environment variable Vite (.env), fallback ke localhost jika dibuka di laptop
export const API_BASE_URL = isLocalhost
    ? "http://localhost:5000"
    : (import.meta.env.VITE_API_URL || "http://api-undangan.arscomcopy.com");

export const API_ENDPOINTS = {
    katalog: `${API_BASE_URL}/api/katalog`,
    login: `${API_BASE_URL}/api/login`,
    signup: `${API_BASE_URL}/api/signup`,
    updateProfile: `${API_BASE_URL}/api/update-profile`,
    changePassword: `${API_BASE_URL}/api/change-password`,
};