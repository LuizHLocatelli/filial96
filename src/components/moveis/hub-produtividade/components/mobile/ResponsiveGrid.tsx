import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  autoFit?: boolean;
  minColWidth?: string;
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10'
};

export function ResponsiveGrid({
  children,
  className,
  gap = 'md',
  columns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 5
  },
  autoFit = false,
  minColWidth = '320px'
}: ResponsiveGridProps) {
  const breakpoints = useResponsive();

  const getGridClasses = () => {
    if (autoFit) {
      return `grid-cols-[repeat(auto-fit,minmax(${minColWidth},1fr))]`;
    }

    const colClasses = [];
    
    if (columns.xs) colClasses.push(`grid-cols-${columns.xs}`);
    if (columns.sm) colClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) colClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) colClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) colClasses.push(`xl:grid-cols-${columns.xl}`);
    if (columns.xxl) colClasses.push(`2xl:grid-cols-${columns.xxl}`);

    return colClasses.join(' ');
  };

  return (
    <div
      className={cn(
        'grid w-full',
        getGridClasses(),
        gapClasses[gap],
        className
      )}
      style={autoFit ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
      } : undefined}
    >
      {children}
    </div>
  );
}

// Grid otimizado para stats
interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <ResponsiveGrid
      columns={{
        xs: 1,
        sm: 2,
        md: 2,
        lg: 4
      }}
      gap="lg"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Grid simplificado para dashboard
interface DashboardGridProps {
  main: ReactNode;
  className?: string;
}

export function DashboardGrid({ main, className }: DashboardGridProps) {
  return (
    <div className={cn('w-full', className)}>
      {main}
    </div>
  );
}

// Grid compacto otimizado
interface CompactGridProps {
  children: ReactNode;
  className?: string;
}

export function CompactGrid({ children, className }: CompactGridProps) {
  return (
    <ResponsiveGrid
      columns={{
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4
      }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Grid flexível otimizado
interface FlexGridProps {
  children: ReactNode;
  minWidth?: string;
  maxWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlexGrid({
  children,
  minWidth = '300px',
  maxWidth = '1fr',
  gap = 'md',
  className
}: FlexGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, ${maxWidth}))`
      }}
    >
      {children}
    </div>
  );
}
