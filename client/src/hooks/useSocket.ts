import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEvent {
  event: string;
  data: unknown;
  timestamp: Date;
}

export function useSocket() {
  const socket = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    socket.current = io(url, { withCredentials: true });

    socket.current.on('connect', () => setConnected(true));
    socket.current.on('disconnect', () => setConnected(false));

    // Listen to all ASMP events
    const events = [
      'flight_arrived', 'services_requested', 'service_started',
      'service_progress_update', 'service_verified', 'turnaround_status_update',
      'flight_departed', 'invoice_generated', 'invoice_approved',
      'invoice_rejected', 'invoice_paid',
    ];

    events.forEach(event => {
      socket.current?.on(event, (data: unknown) => {
        setLastEvent({ event, data, timestamp: new Date() });
      });
    });

    return () => { socket.current?.disconnect(); };
  }, []);

  const on = useCallback((event: string, handler: (data: unknown) => void) => {
    socket.current?.on(event, handler);
    return () => { socket.current?.off(event, handler); };
  }, []);

  return { connected, lastEvent, on };
}
