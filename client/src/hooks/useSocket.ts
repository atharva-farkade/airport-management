import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEvent {
  event: string;
  data: unknown;
  timestamp: Date;
}

const EVENTS = [
  'flight_arrived', 'services_requested', 'service_started',
  'service_progress_update', 'service_verified', 'turnaround_status_update',
  'flight_departed', 'invoice_generated', 'invoice_approved',
  'invoice_rejected', 'invoice_paid',
] as const;

export type AsmpEvent = typeof EVENTS[number];

// Module-level singleton — lives for the entire app session
let socket: Socket | null = null;

function ensureSocket(): Socket | null {
  if (socket) return socket;
  const url = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
  const token = localStorage.getItem('asmp_token');
  if (!token) return null;
  socket = io(url, { withCredentials: true, auth: { token } });
  return socket;
}

// Disconnect socket (call on logout)
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Core hook — creates socket, tracks connection, emits lastEvent for toasts.
 * Use once in App.tsx.
 */
export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    const s = ensureSocket();
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    if (s.connected) setConnected(true);

    const cbs = EVENTS.map(event => {
      const handler = (data: unknown) => setLastEvent({ event, data, timestamp: new Date() });
      s.on(event, handler);
      return () => s.off(event, handler);
    });

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      cbs.forEach(off => off());
    };
  }, []);

  return { connected, lastEvent };
}

/**
 * Subscribe to specific socket events and call handler when they fire.
 * Uses a ref so the handler is always fresh — no stale closures.
 */
export function useSocketEvent(events: AsmpEvent | AsmpEvent[], handler: () => void, deps: unknown[] = []) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const s = ensureSocket();
    if (!s) return;

    const list = Array.isArray(events) ? events : [events];
    const cb = () => handlerRef.current();
    list.forEach(e => s.on(e, cb));
    return () => { list.forEach(e => s.off(e, cb)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
