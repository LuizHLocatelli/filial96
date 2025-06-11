import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  isMobile?: boolean;
}

const calculateTimeLeft = (endDate: string) => {
  const difference = +new Date(endDate) - +new Date();
  let timeLeft: { days?: number; hours?: number; minutes?: number } = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }
  return timeLeft;
};

export const CountdownTimer = ({ endDate, isMobile }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: string[] = [];

  if (timeLeft.days !== undefined && timeLeft.days > 0) {
    timerComponents.push(`${timeLeft.days}d`);
  }
  if (timeLeft.hours !== undefined && timeLeft.hours > 0) {
    timerComponents.push(`${timeLeft.hours}h`);
  }
  if (timeLeft.minutes !== undefined && timeLeft.minutes > 0) {
    timerComponents.push(`${timeLeft.minutes}m`);
  }

  if (timerComponents.length === 0) {
    return null;
  }

  const text = isMobile ? timerComponents.join(' ') : `Termina em ${timerComponents.join(' ')}`;

  return (
    <div className="flex items-center gap-1 bg-red-500/80 dark:bg-red-800/80 text-white dark:text-red-100 rounded-full px-2 py-1 backdrop-blur-sm ml-auto min-w-0">
      <Clock className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs truncate block font-semibold">{text}</span>
    </div>
  );
}; 