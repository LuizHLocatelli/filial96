
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
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
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
  minColWidth = '280px'
}: ResponsiveGridProps) {
  const { breakpoints } = useResponsive();

  const getCurrentColumns = () => {
    if (breakpoints.xxl && columns.xxl) return columns.xxl;
    if (breakpoints.xl && columns.xl) return columns.xl;
    if (breakpoints.lg && columns.lg) return columns.lg;
    if (breakpoints.md && columns.md) return columns.md;
    if (breakpoints.sm && columns.sm) return columns.sm;
    return columns.xs || 1;
  };

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

// Grid simplificado para dashboard
interface DashboardGridProps {
  sidebar?: ReactNode;
  main: ReactNode;
  className?: string;
}

export function DashboardGrid({ sidebar, main, className }: DashboardGridProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {main}
        {sidebar}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      <div className="lg:col-span-2">
        {main}
      </div>
      {sidebar && (
        <div className="lg:col-span-1">
          {sidebar}
        </div>
      )}
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
      gap="sm"
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
  minWidth = '250px',
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
