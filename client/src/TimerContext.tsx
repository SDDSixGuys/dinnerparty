import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "./ThemeContext";

interface Timer {
  id: string;
  label: string;
  totalSeconds: number;
  secondsLeft: number;
  isActive: boolean;
}

interface TimerContextType {
  timers: Timer[];
  startTimer: (id: string, label: string, minutes: number) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  dismissAlarm: () => void;
  alarmTimerId: string | null;
}

const TimerContext = createContext<TimerContextType>({
  timers: [],
  startTimer: () => {},
  toggleTimer: () => {},
  resetTimer: () => {},
  dismissAlarm: () => {},
  alarmTimerId: null,
});

// eslint-disable-next-line react-refresh/only-export-components
export function useTimers() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [timers, setTimers] = useState<Timer[]>([]);
  const [alarmTimerId, setAlarmTimerId] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beepCountRef = useRef(0);

  const playTone = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // audio not available
    }
  }, []);

  const stopAlarmSound = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
  }, []);

  const playAlarm = useCallback(() => {
    beepCountRef.current = 0;
    const doBeep = () => {
      const pos = beepCountRef.current % 4;
      if (pos < 3) {
        playTone();
      }
      beepCountRef.current += 1;
    };
    doBeep();
    audioIntervalRef.current = setInterval(doBeep, 200);
    alarmTimeoutRef.current = setTimeout(() => {
      stopAlarmSound();
      setAlarmTimerId(null);
    }, 60000);
  }, [playTone, stopAlarmSound]);

  const dismissAlarm = useCallback(() => {
    stopAlarmSound();
    if (alarmTimerId) {
      setTimers((prev) => prev.filter((t) => t.id !== alarmTimerId));
    }
    setAlarmTimerId(null);
  }, [alarmTimerId, stopAlarmSound]);

  // Tick active timers every second
  useEffect(() => {
    const hasActive = timers.some((t) => t.isActive && t.secondsLeft > 0);
    if (!hasActive) return;

    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isActive || t.secondsLeft <= 0) return t;
          return { ...t, secondsLeft: t.secondsLeft - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  // Detect when a timer hits zero
  useEffect(() => {
    const finished = timers.find((t) => t.isActive && t.secondsLeft === 0);
    if (finished && !alarmTimerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimers((prev) => prev.map((t) => (t.id === finished.id ? { ...t, isActive: false } : t)));
      setAlarmTimerId(finished.id);
      playAlarm();
    }
  }, [timers, alarmTimerId, playAlarm]);

  const startTimer = useCallback((id: string, label: string, minutes: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    setTimers((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (existing) {
        return prev.map((t) => (t.id === id ? { ...t, isActive: true } : t));
      }
      return [
        ...prev,
        { id, label, totalSeconds: minutes * 60, secondsLeft: minutes * 60, isActive: true },
      ];
    });
  }, []);

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, secondsLeft: t.totalSeconds, isActive: false } : t))
    );
  }, []);

  const alarmTimer = timers.find((t) => t.id === alarmTimerId);

  return (
    <TimerContext.Provider
      value={{ timers, startTimer, toggleTimer, resetTimer, dismissAlarm, alarmTimerId }}
    >
      {children}

      {/* Global alarm overlay */}
      {alarmTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <div
            className="w-full max-w-sm p-10 rounded-xl shadow-2xl text-center"
            style={{ background: theme.card, border: `1px solid ${theme.border}` }}
          >
            <h2 className="text-xl font-medium mb-2" style={{ color: theme.text }}>
              Timer Complete
            </h2>
            <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
              {alarmTimer.label}
            </p>
            <button
              onClick={dismissAlarm}
              className="w-full py-3 rounded-lg font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
              style={{ background: theme.buttonBg, color: theme.buttonText }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </TimerContext.Provider>
  );
}
