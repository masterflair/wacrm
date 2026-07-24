"use client";

import { useEffect, useRef } from "react";

import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from "@/hooks/use-auth";
import { HEARTBEAT_MS, IDLE_AFTER_MS, type StoredPresence } from "@/lib/presence";

/**
 * PresenceHeartbeat — headless. Mount ONCE per signed-in dashboard tab
 * (in the dashboard shell, below the auth gate). Reports this tab's
 * presence to the `member_presence` table via the `touch_presence` RPC
 * roughly every HEARTBEAT_MS.
 *
 * The client only ever reports 'online' or 'away':
 *   - 'away'   when the tab is hidden, or no user input for IDLE_AFTER_MS
 *   - 'online' otherwise
 * It keeps heartbeating while away (so the row stays fresh, i.e. not
 * offline). When the tab closes the beats simply stop and viewers derive
 * 'offline' from staleness — no unreliable unload write needed.
 */
export function PresenceHeartbeat() {
  const { accountId } = useAuth();

  // 0 = "never recorded"; set on mount so we don't read the clock during
  // render (impure). Until the effect runs the tab counts as active.
  const lastActivityRef = useRef<number>(0);

  useEffect(() => {
    if (!accountId) return;

    // We use a custom XHR-based fetch for the heartbeat. Next.js 14+ aggressively 
    // intercepts window.fetch errors and shows a full-screen dev overlay even if 
    // we try/catch them. XHR bypasses the dev overlay.
    const xhrFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options?.method || 'GET', url.toString());
        
        if (options?.headers) {
          const headers = new Headers(options.headers as HeadersInit);
          headers.forEach((value, key) => xhr.setRequestHeader(key, value));
        }

        xhr.onload = () => {
          resolve(new Response(xhr.responseText, { status: xhr.status }));
        };

        xhr.onerror = () => {
          // Resolve with 503 instead of rejecting to completely hide the network error from Next.js
          resolve(new Response(JSON.stringify({ error: "Heartbeat Network Error" }), { status: 503 }));
        };

        xhr.send(options?.body as any);
      });
    };

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { fetch: xhrFetch }
      }
    );
    
    let cancelled = false;
    let lastBeatAt = 0;
    lastActivityRef.current = Date.now();

    const markActive = () => {
      lastActivityRef.current = Date.now();
    };

    const currentStatus = (): StoredPresence => {
      if (typeof document !== "undefined" && document.hidden) return "away";
      if (Date.now() - lastActivityRef.current > IDLE_AFTER_MS) return "away";
      return "online";
    };

    const safeBeat = async () => {
      if (cancelled) return;
      const t = Date.now();
      if (t - lastBeatAt < 1_000) return;
      lastBeatAt = t;

      try {
        const { error } = await supabase.rpc("touch_presence", {
          p_status: currentStatus(),
        });
        
        if (error && !cancelled) {
          const msg = String(error.message || error || "");
          if (
            msg.includes("Failed to fetch") ||
            msg.includes("TypeError") ||
            msg.includes("NetworkError") ||
            msg.includes("Lock was released")
          ) {
            return;
          }
          console.warn("[PresenceHeartbeat] touch_presence failed:", msg);
        }
      } catch (err: any) {
        // Catch raw exceptions from fetch failures (e.g. extension blocking or offline)
        const msg = String(err?.message || err || "");
        if (
          msg.includes("Failed to fetch") ||
          msg.includes("TypeError") ||
          msg.includes("NetworkError") ||
          err instanceof TypeError
        ) {
          return;
        }
        console.warn("[PresenceHeartbeat] touch_presence exception:", msg);
      }
    };

    // Activity listeners. `passive` so we never block scroll/input.
    const activityEvents: (keyof DocumentEventMap)[] = [
      "mousemove",
      "keydown",
      "pointerdown",
      "scroll",
    ];
    activityEvents.forEach((e) =>
      document.addEventListener(e, markActive, { passive: true }),
    );

    // Returning to the tab should beat immediately so a member flips
    // back to online without a 30s wait.
    const onReturn = () => {
      if (!document.hidden) markActive();
      safeBeat();
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);

    safeBeat();
    const interval = setInterval(safeBeat, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      activityEvents.forEach((e) =>
        document.removeEventListener(e, markActive),
      );
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [accountId]);

  return null;
}
