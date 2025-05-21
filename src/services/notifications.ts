import { supabase } from './supabase';
import { toast } from 'sonner';

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function subscribeToNotifications(userId: string) {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    if (!('serviceWorker' in navigator)) {
      toast.error('Service workers are not supported');
      return false;
    }

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

    toast.success('Successfully subscribed to notifications');
    return true;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    toast.error('Failed to subscribe to notifications');
    return false;
  }
}

export async function unsubscribeFromNotifications(userId: string) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);
      
      toast.success('Successfully unsubscribed from notifications');
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    toast.error('Failed to unsubscribe from notifications');
    return false;
  }
}

export async function scheduleReminder(userId: string, time: string, message: string) {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        scheduled_time: time,
        message: message
      });

    if (error) throw error;
    toast.success('Reminder scheduled successfully');
    return data;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    toast.error('Failed to schedule reminder');
    return null;
  }
}

export async function sendNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, options);
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}