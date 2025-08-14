import { useCallback, useEffect, useState } from 'react';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
};

export default function usePushNotifications(baseUrl = '/api/notifications') {
    const [supported, setSupported] = useState(false);
    const [permission, setPermission] = useState(Notification.permission);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSupported('serviceWorker' in navigator && 'PushManager' in window);
    }, []);

    const getVapidKey = useCallback(async () => {
        const res = await fetch(`${baseUrl}/vapid-public-key`);
        const data = await res.json();
        return data.publicKey || '';
    }, [baseUrl]);

    const subscribe = useCallback(async () => {
        if (!supported) return false;
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const key = await getVapidKey();
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(key)
            });
            await fetch(`${baseUrl}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ subscription })
            });
            setSubscribed(true);
            return true;
        } finally {
            setLoading(false);
        }
    }, [supported, baseUrl, getVapidKey]);

    const requestPermission = useCallback(async () => {
        if (!supported) return 'denied';
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            await subscribe();
        }
        return result;
    }, [supported, subscribe]);

    return { supported, permission, subscribed, loading, requestPermission, subscribe };
}


