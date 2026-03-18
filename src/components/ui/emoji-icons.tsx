import * as React from 'react';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  size?: string | number;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

export type LucideIcon = React.ElementType<IconProps>;
export type IconName = string;
export type IconeContextual = React.ElementType<IconProps>;

export const Activity = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📈
      </span>
    );
  }
);
Activity.displayName = 'Activity';
export const AlertCircle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔴
      </span>
    );
  }
);
AlertCircle.displayName = 'AlertCircle';
export const AlertTriangle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⚠️
      </span>
    );
  }
);
AlertTriangle.displayName = 'AlertTriangle';
export const ArrowDown = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⬇️
      </span>
    );
  }
);
ArrowDown.displayName = 'ArrowDown';
export const ArrowLeft = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⬅️
      </span>
    );
  }
);
ArrowLeft.displayName = 'ArrowLeft';
export const ArrowRight = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ➡️
      </span>
    );
  }
);
ArrowRight.displayName = 'ArrowRight';
export const ArrowRightLeft = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ↔️
      </span>
    );
  }
);
ArrowRightLeft.displayName = 'ArrowRightLeft';
export const Award = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🏆
      </span>
    );
  }
);
Award.displayName = 'Award';
export const Baby = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👶
      </span>
    );
  }
);
Baby.displayName = 'Baby';
export const BarChart3 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📊
      </span>
    );
  }
);
BarChart3.displayName = 'BarChart3';
export const Bell = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔔
      </span>
    );
  }
);
Bell.displayName = 'Bell';
export const BookOpen = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📖
      </span>
    );
  }
);
BookOpen.displayName = 'BookOpen';
export const Bot = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🤖
      </span>
    );
  }
);
Bot.displayName = 'Bot';
export const Box = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📦
      </span>
    );
  }
);
Box.displayName = 'Box';
export const Building2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🏢
      </span>
    );
  }
);
Building2.displayName = 'Building2';
export const Calculator = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🧮
      </span>
    );
  }
);
Calculator.displayName = 'Calculator';
export const Calendar = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📅
      </span>
    );
  }
);
Calendar.displayName = 'Calendar';
export const CalendarCog = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🗓️
      </span>
    );
  }
);
CalendarCog.displayName = 'CalendarCog';
export const CalendarDays = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📆
      </span>
    );
  }
);
CalendarDays.displayName = 'CalendarDays';
export const CalendarIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📅
      </span>
    );
  }
);
CalendarIcon.displayName = 'CalendarIcon';
export const Camera = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📷
      </span>
    );
  }
);
Camera.displayName = 'Camera';
export const CameraOff = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🚫📷
      </span>
    );
  }
);
CameraOff.displayName = 'CameraOff';
export const Check = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✔️
      </span>
    );
  }
);
Check.displayName = 'Check';
export const CheckCircle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✅
      </span>
    );
  }
);
CheckCircle.displayName = 'CheckCircle';
export const CheckCircle2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ☑️
      </span>
    );
  }
);
CheckCircle2.displayName = 'CheckCircle2';
export const ChevronDown = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔽
      </span>
    );
  }
);
ChevronDown.displayName = 'ChevronDown';
export const ChevronLeft = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ◀️
      </span>
    );
  }
);
ChevronLeft.displayName = 'ChevronLeft';
export const ChevronRight = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ▶️
      </span>
    );
  }
);
ChevronRight.displayName = 'ChevronRight';
export const ChevronUp = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔼
      </span>
    );
  }
);
ChevronUp.displayName = 'ChevronUp';
export const Circle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⭕
      </span>
    );
  }
);
Circle.displayName = 'Circle';
export const Clock = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🕒
      </span>
    );
  }
);
Clock.displayName = 'Clock';
export const ClockIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🕒
      </span>
    );
  }
);
ClockIcon.displayName = 'ClockIcon';
export const Copy = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📋
      </span>
    );
  }
);
Copy.displayName = 'Copy';
export const Crown = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👑
      </span>
    );
  }
);
Crown.displayName = 'Crown';
export const Database = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🗄️
      </span>
    );
  }
);
Database.displayName = 'Database';
export const DollarSign = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        💵
      </span>
    );
  }
);
DollarSign.displayName = 'DollarSign';
export const Download = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📥
      </span>
    );
  }
);
Download.displayName = 'Download';
export const Edit = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✏️
      </span>
    );
  }
);
Edit.displayName = 'Edit';
export const Edit2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📝
      </span>
    );
  }
);
Edit2.displayName = 'Edit2';
export const Edit3 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✍️
      </span>
    );
  }
);
Edit3.displayName = 'Edit3';
export const ExternalLink = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ↗️
      </span>
    );
  }
);
ExternalLink.displayName = 'ExternalLink';
export const Eye = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👁️
      </span>
    );
  }
);
Eye.displayName = 'Eye';
export const EyeOff = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🙈
      </span>
    );
  }
);
EyeOff.displayName = 'EyeOff';
export const File = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📄
      </span>
    );
  }
);
File.displayName = 'File';
export const FileDown = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⏬
      </span>
    );
  }
);
FileDown.displayName = 'FileDown';
export const FileImage = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🖼️
      </span>
    );
  }
);
FileImage.displayName = 'FileImage';
export const FileSpreadsheet = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📗
      </span>
    );
  }
);
FileSpreadsheet.displayName = 'FileSpreadsheet';
export const FileText = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📝
      </span>
    );
  }
);
FileText.displayName = 'FileText';
export const Filter = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🎛️
      </span>
    );
  }
);
Filter.displayName = 'Filter';
export const Folder = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📁
      </span>
    );
  }
);
Folder.displayName = 'Folder';
export const FolderOpen = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📂
      </span>
    );
  }
);
FolderOpen.displayName = 'FolderOpen';
export const FolderPlus = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📁+
      </span>
    );
  }
);
FolderPlus.displayName = 'FolderPlus';
export const Gift = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🎁
      </span>
    );
  }
);
Gift.displayName = 'Gift';
export const Globe = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🌐
      </span>
    );
  }
);
Globe.displayName = 'Globe';
export const GraduationCap = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🎓
      </span>
    );
  }
);
GraduationCap.displayName = 'GraduationCap';
export const History = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🕰️
      </span>
    );
  }
);
History.displayName = 'History';
export const Home = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🏠
      </span>
    );
  }
);
Home.displayName = 'Home';
export const Image = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🖼️
      </span>
    );
  }
);
Image.displayName = 'Image';
export const ImageIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🖼️
      </span>
    );
  }
);
ImageIcon.displayName = 'ImageIcon';
export const ImagePlus = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🖼️+
      </span>
    );
  }
);
ImagePlus.displayName = 'ImagePlus';
export const ImageUp = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🖼️^
      </span>
    );
  }
);
ImageUp.displayName = 'ImageUp';
export const Info = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ℹ️
      </span>
    );
  }
);
Info.displayName = 'Info';
export const InfinityIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ♾️
      </span>
    );
  }
);
InfinityIcon.displayName = 'InfinityIcon';
export const Key = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔑
      </span>
    );
  }
);
Key.displayName = 'Key';
export const LayoutGrid = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔲
      </span>
    );
  }
);
LayoutGrid.displayName = 'LayoutGrid';
export const LayoutList = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ☰
      </span>
    );
  }
);
LayoutList.displayName = 'LayoutList';
export const Loader2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⏳
      </span>
    );
  }
);
Loader2.displayName = 'Loader2';
export const Lock = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔒
      </span>
    );
  }
);
Lock.displayName = 'Lock';
export const LogIn = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🚪
      </span>
    );
  }
);
LogIn.displayName = 'LogIn';
export const Mail = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✉️
      </span>
    );
  }
);
Mail.displayName = 'Mail';
export const MapPin = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📍
      </span>
    );
  }
);
MapPin.displayName = 'MapPin';
export const MessageSquare = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        💬
      </span>
    );
  }
);
MessageSquare.displayName = 'MessageSquare';
export const Mic = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🎤
      </span>
    );
  }
);
Mic.displayName = 'Mic';
export const Moon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🌙
      </span>
    );
  }
);
Moon.displayName = 'Moon';
export const MoreHorizontal = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⋯
      </span>
    );
  }
);
MoreHorizontal.displayName = 'MoreHorizontal';
export const MoreVertical = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⋮
      </span>
    );
  }
);
MoreVertical.displayName = 'MoreVertical';
export const Package = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📦
      </span>
    );
  }
);
Package.displayName = 'Package';
export const Paperclip = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📎
      </span>
    );
  }
);
Paperclip.displayName = 'Paperclip';
export const Pause = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⏸️
      </span>
    );
  }
);
Pause.displayName = 'Pause';
export const Pencil = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✏️
      </span>
    );
  }
);
Pencil.displayName = 'Pencil';
export const Phone = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📞
      </span>
    );
  }
);
Phone.displayName = 'Phone';
export const Play = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ▶️
      </span>
    );
  }
);
Play.displayName = 'Play';
export const Plus = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ➕
      </span>
    );
  }
);
Plus.displayName = 'Plus';
export const PlusCircle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⊕
      </span>
    );
  }
);
PlusCircle.displayName = 'PlusCircle';
export const Radio = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📻
      </span>
    );
  }
);
Radio.displayName = 'Radio';
export const RefreshCcw = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔄
      </span>
    );
  }
);
RefreshCcw.displayName = 'RefreshCcw';
export const RefreshCw = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔃
      </span>
    );
  }
);
RefreshCw.displayName = 'RefreshCw';
export const RotateCcw = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ↺
      </span>
    );
  }
);
RotateCcw.displayName = 'RotateCcw';
export const RotateCw = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ↻
      </span>
    );
  }
);
RotateCw.displayName = 'RotateCw';
export const Save = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        💾
      </span>
    );
  }
);
Save.displayName = 'Save';
export const Search = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔍
      </span>
    );
  }
);
Search.displayName = 'Search';
export const Send = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📤
      </span>
    );
  }
);
Send.displayName = 'Send';
export const Settings = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⚙️
      </span>
    );
  }
);
Settings.displayName = 'Settings';
export const Share2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔗
      </span>
    );
  }
);
Share2.displayName = 'Share2';
export const Shield = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🛡️
      </span>
    );
  }
);
Shield.displayName = 'Shield';
export const ShoppingBag = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🛍️
      </span>
    );
  }
);
ShoppingBag.displayName = 'ShoppingBag';
export const Smartphone = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📱
      </span>
    );
  }
);
Smartphone.displayName = 'Smartphone';
export const Sparkles = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ✨
      </span>
    );
  }
);
Sparkles.displayName = 'Sparkles';
export const Square = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🟩
      </span>
    );
  }
);
Square.displayName = 'Square';
export const Star = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⭐
      </span>
    );
  }
);
Star.displayName = 'Star';
export const Sun = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ☀️
      </span>
    );
  }
);
Sun.displayName = 'Sun';
export const Tag = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🏷️
      </span>
    );
  }
);
Tag.displayName = 'Tag';
export const Target = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🎯
      </span>
    );
  }
);
Target.displayName = 'Target';
export const Trash2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🗑️
      </span>
    );
  }
);
Trash2.displayName = 'Trash2';
export const TrendingDown = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📉
      </span>
    );
  }
);
TrendingDown.displayName = 'TrendingDown';
export const TrendingUp = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📈
      </span>
    );
  }
);
TrendingUp.displayName = 'TrendingUp';
export const Truck = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🚚
      </span>
    );
  }
);
Truck.displayName = 'Truck';
export const Upload = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📤
      </span>
    );
  }
);
Upload.displayName = 'Upload';
export const UploadCloud = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ☁️
      </span>
    );
  }
);
UploadCloud.displayName = 'UploadCloud';
export const User = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👤
      </span>
    );
  }
);
User.displayName = 'User';
export const UserCircle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🧑
      </span>
    );
  }
);
UserCircle.displayName = 'UserCircle';
export const UserPlus = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👤+
      </span>
    );
  }
);
UserPlus.displayName = 'UserPlus';
export const Users = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        👥
      </span>
    );
  }
);
Users.displayName = 'Users';
export const Volume2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔊
      </span>
    );
  }
);
Volume2.displayName = 'Volume2';
export const VolumeX = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔇
      </span>
    );
  }
);
VolumeX.displayName = 'VolumeX';
export const Wand2 = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🪄
      </span>
    );
  }
);
Wand2.displayName = 'Wand2';
export const Wrench = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔧
      </span>
    );
  }
);
Wrench.displayName = 'Wrench';
export const X = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ❌
      </span>
    );
  }
);
X.displayName = 'X';
export const XCircle = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🚫
      </span>
    );
  }
);
XCircle.displayName = 'XCircle';
export const Zap = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        ⚡
      </span>
    );
  }
);
Zap.displayName = 'Zap';
export const ZoomIn = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔍+
      </span>
    );
  }
);
ZoomIn.displayName = 'ZoomIn';
export const ZoomOut = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        🔍-
      </span>
    );
  }
);
ZoomOut.displayName = 'ZoomOut';
export const FileIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typeof size === 'number' ? `${size}px` : size,
          lineHeight: 1,
          color: color || 'inherit',
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      >
        📄
      </span>
    );
  }
);
FileIcon.displayName = 'FileIcon';

