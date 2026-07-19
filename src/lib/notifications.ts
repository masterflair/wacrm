export function playNotificationSound() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Master volume - much quieter than before
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.2; 
    masterGain.connect(ctx.destination);

    // Helper to play a soft, bell-like note
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Sine wave for the softest, purest tone
      osc.type = "sine";
      osc.frequency.value = freq;
      
      // Percussive envelope: fast attack, exponential decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02); // Soft attack
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6); // Long, smooth tail
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    };

    // Play a pleasant, soft ascending interval (E5 -> G#5)
    playNote(659.25, now);       // E5
    playNote(830.61, now + 0.12); // G#5
    
  } catch (e) {
    console.error("Failed to play notification sound", e);
  }
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}

export function showDesktopNotification(title: string, body?: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon?size=192", // Use the app's icon
      });
    }
  }
}
