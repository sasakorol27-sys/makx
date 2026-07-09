// Web Push (PWA) helper.
// Handles: service worker registration, VAPID subscription, opt-in/opt-out.

import { api } from '@/lib/api';

const SW_URL = '/sw.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export const isPushSupported = () =>
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL);
    // Play the in-app ping when the SW receives a push while a page is open.
    if (!window.__swSoundListener) {
      window.__swSoundListener = true;
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'play-notification-sound') {
          playNotificationSound();
        }
      });
    }
    return reg;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('SW register failed', e);
    return null;
  }
}

/** Short friendly two-tone "ping" (E5 → A5) via WebAudio. */
export function playNotificationSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const tone = (freq, start, dur = 0.18) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };
    const t = ctx.currentTime;
    tone(659.25, t);
    tone(880.0, t + 0.15);
    setTimeout(() => ctx.close().catch(() => {}), 700);
  } catch (_) { /* ignore */ }
}

/**
 * Idempotent: if already subscribed, just reports the subscription to the
 * backend. Returns the PushSubscription object or null on failure.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) throw new Error('Push notifications are not supported in this browser');

  const reg = await registerServiceWorker();
  if (!reg) throw new Error('Service Worker registration failed');

  // Permission step
  if (Notification.permission === 'denied') {
    throw new Error('Notifications are blocked. Allow them in browser settings.');
  }
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Notification permission was not granted');
  }

  // Need VAPID public key from server
  const { data } = await api.get('/api/push/vapid-public-key');
  const vapidKey = data?.publicKey;
  if (!vapidKey) throw new Error('Server has no VAPID public key configured');

  // Reuse existing subscription if present
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  // Send subscription to backend
  const json = subscription.toJSON();
  await api.post('/api/push/subscribe', {
    endpoint: json.endpoint,
    keys: json.keys,
  });
  return subscription;
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  const json = sub.toJSON();
  try {
    await api.post('/api/push/unsubscribe', {
      endpoint: json.endpoint,
      keys: json.keys,
    });
  } catch (_) { /* ignore — best-effort cleanup */ }
  await sub.unsubscribe();
  return true;
}

export async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function sendTestPush() {
  const { data } = await api.post('/api/push/test');
  return data;
}
