import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const now = new Date().getTime();
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate);
    const timer = setInterval(() => {
      setTime(getTimeLeft(target));
    }, 1000);
    setTime(getTimeLeft(target));
    return () => clearInterval(timer);
  }, [targetDate]);

  const pads = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {pads.map((pad) => (
        <div key={pad.label} className="flex flex-col items-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-background border border-border rounded-lg flex items-center justify-center">
            <span className="text-lg lg:text-xl font-bold text-foreground tabular-nums">
              {String(pad.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[9px] mt-1 text-muted-foreground uppercase tracking-wider">{pad.label}</span>
        </div>
      ))}
    </div>
  );
}
