"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

/**
 * Subscribes to a socket event for the lifetime of the component.
 * The server decides which rooms this socket is in based on the
 * authenticated user's role — the client never requests a role/room.
 */
export function useSocketEvent(event: string, handler: (payload: any) => void) {
  useEffect(() => {
    const socket: Socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
