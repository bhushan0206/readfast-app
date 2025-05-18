import { supabase } from './supabase';

export async function subscribeToNotifications(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
    });

    await supabase
      .from('push_subscriptions')
      .upsert({ 
        user_id: userId,
        subscription: JSON.stringify(subscription)
      });

    return true;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return false;
  }
}

export async function sendNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}