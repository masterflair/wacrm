"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  playNotificationSound,
  showDesktopNotification,
} from "@/lib/notifications";

/**
 * Count of conversations with at least one unread inbound message for
 * the current user. Used by the sidebar to surface a green dot on the
 * Inbox nav entry when the user is elsewhere in the app.
 *
 * Lives on its own realtime channel (distinct from the inbox page's
 * "inbox-realtime") so both can coexist without sharing state.
 */
export function useTotalUnread(): number {
  const [total, setTotal] = useState(0);

  // Keep a live local mirror of {id: unread_count} so INSERT/UPDATE/DELETE
  // events can adjust the total in O(1) without refetching.
  const countsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // Initial load. RLS scopes this to the signed-in user automatically —
    // no explicit user_id filter needed here.
    (async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, unread_count");
      if (cancelled || error || !data) return;

      const map = new Map<string, number>();
      let sum = 0;
      for (const row of data as { id: string; unread_count: number }[]) {
        const n = row.unread_count ?? 0;
        map.set(row.id, n);
        if (n > 0) sum += 1;
      }
      countsRef.current = map;
      setTotal(sum);
    })();

    const channel = supabase
      .channel("total-unread-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          const map = countsRef.current;
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as Partial<Conversation>;
            if (oldRow.id) map.delete(oldRow.id);
          } else {
            const row = payload.new as Conversation;
            const oldRow = payload.old as Partial<Conversation>;
            
            // Trigger notification if the unread count just increased
            if (
              payload.eventType === "UPDATE" &&
              (row.unread_count || 0) > (oldRow.unread_count || 0)
            ) {
              // Play soft in-app sound only if the app is focused (no OS notification)
              if (!document.hidden) {
                playNotificationSound();
              }

              // Fetch contact details asynchronously for the banner
              (async () => {
                const client = createClient();
                const { data } = await client
                  .from("contacts")
                  .select("name, phone, avatar_url")
                  .eq("id", row.contact_id)
                  .maybeSingle();

                const senderName = data?.name || data?.phone || "a customer";

                toast(`Message from ${senderName}`, {
                  description: row.last_message_text || "You have a new message.",
                  icon: <MessageCircle className="h-5 w-5 text-primary" />,
                  className: "border-l-4 border-l-primary bg-card/90 backdrop-blur-xl shadow-2xl p-4 gap-4",
                });
                
                if (document.hidden) {
                  showDesktopNotification(`Message from ${senderName}`, row.last_message_text || "You have a new message.");
                }
              })();
            }

            map.set(row.id, row.unread_count ?? 0);
          }
          // Recompute — cheap, conversations per user stay small.
          let sum = 0;
          for (const n of map.values()) if (n > 0) sum += 1;
          setTotal(sum);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return total;
}
