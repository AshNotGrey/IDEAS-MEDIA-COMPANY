const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

class AuthService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Auth service request failed:', error);
            throw error;
        }
    }

    async login(credentials) {
        const { username, password, deviceInfo, rememberMe } = credentials;

        const headers = {};
        if (deviceInfo) {
            headers['x-device-id'] = deviceInfo.deviceId;
            headers['x-device-name'] = deviceInfo.deviceName;
            headers['x-device-platform'] = deviceInfo.platform;
            headers['x-device-browser'] = deviceInfo.browser;
        }

        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers,
        });
    }

    async refreshToken(refreshToken) {
        return this.request('/auth/refresh', {
            method: 'POST',
            headers: {
                'x-refresh-token': refreshToken,
            },
        });
    }

    async logout(refreshToken) {
        if (refreshToken) {
            return this.request('/auth/logout', {
                method: 'POST',
                headers: {
                    'x-refresh-token': refreshToken,
                },
            });
        }
        return { success: true };
    }

    async getCurrentUser(token) {
        return this.request('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    async getSessions(token) {
        return this.request('/auth/sessions', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    async revokeSession(token, sessionId) {
        return this.request('/auth/sessions/revoke', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
        });
    }

    async revokeAllSessions(token, exceptDeviceId) {
        const headers = {
            'Authorization': `Bearer ${token}`,
        };

        if (exceptDeviceId) {
            headers['x-device-id'] = exceptDeviceId;
        }

        return this.request('/auth/sessions/revoke-all', {
            method: 'POST',
            headers,
        });
    }

    async createInvite(inviteData, token) {
        return this.request('/auth/invites', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(inviteData),
        });
    }

    async register(registrationData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registrationData),
        });
    }

    async verifyAdmin(username, token) {
        return this.request('/auth/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
        });
    }

    async getAuthStatus(token) {
        return this.request('/auth/status', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    // Helper method to check if token is expired
    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    // Helper method to get token expiration time
    getTokenExpiration(token) {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return new Date(payload.exp * 1000);
        } catch {
            return null;
        }
    }
}

export default new AuthService();
