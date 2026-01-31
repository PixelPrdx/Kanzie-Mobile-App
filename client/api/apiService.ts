import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/Config';

export const apiService = {
    get: async (endpoint: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error('API request failed');
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },

    post: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `API request failed with status ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            const text = await response.text();
            try {
                return text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('JSON Parse Error:', e);
                return {};
            }
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },

    put: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `API request failed with status ${response.status}`);
            }

            return response.status === 204 ? null : await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },

    upload: async (endpoint: string, fileUri: string) => {
        try {
            const formData = new FormData();
            let filename = fileUri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            if (Platform.OS === 'web' && !match) {
                filename += '.jpg';
            }


            if (Platform.OS === 'web') {
                console.log('Fetching blob from:', fileUri);
                const response = await fetch(fileUri);
                const blob = await response.blob();
                console.log('Blob created:', blob);
                formData.append('file', blob, filename || 'upload.jpg');
            } else {
                // @ts-ignore
                formData.append('file', { uri: fileUri, name: filename, type });
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                // Content-Type must be undefined for FormData to work correctly
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Upload failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('UPLOAD Error:', error);
            throw error;
        }
    }
};
