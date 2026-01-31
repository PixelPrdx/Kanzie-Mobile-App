import { Platform } from 'react-native';

const DEV_IP = '192.168.1.x';

export const SERVER_URL = Platform.select({
    ios: `http://${DEV_IP}:5079`,
    android: `http://${DEV_IP}:5079`,
    default: `http://localhost:5079`,
});

export const API_BASE_URL = `${SERVER_URL}/api`;

export const SIGNALR_URL = Platform.select({
    ios: `http://${DEV_IP}:5079/chatHub`,
    android: `http://${DEV_IP}:5079/chatHub`,
    default: `http://localhost:5079/chatHub`,
});
