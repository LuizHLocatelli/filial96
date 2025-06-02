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
  sm: 'gap-2',
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
  minColWidth = '300px'
}: ResponsiveGridProps) {
  const { breakpoints } = useResponsive();

  // Determinar número de colunas baseado no breakpoint atual
  const getCurrentColumns = () => {
    if (breakpoints.xxl && columns.xxl) return columns.xxl;
    if (breakpoints.xl && columns.xl) return columns.xl;
    if (breakpoints.lg && columns.lg) return columns.lg;
    if (breakpoints.md && columns.md) return columns.md;
    if (breakpoints.sm && columns.sm) return columns.sm;
    return columns.xs || 1;
  };

  const currentColumns = getCurrentColumns();

  // Classes de grid baseadas no breakpoint
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
        'grid',
        getGridClasses(),
        gapClasses[gap],
        'w-full',
        className
      )}
      style={autoFit ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
      } : undefined}
      data-columns={currentColumns}
    >
      {children}
    </div>
  );
}

// Grid para stats específico
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
        lg: 3,
        xl: 4
      }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Grid para dashboard layout
interface DashboardGridProps {
  sidebar?: ReactNode;
  main: ReactNode;
  className?: string;
}

export function DashboardGrid({ sidebar, main, className }: DashboardGridProps) {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    return (
      <div className={cn('space-y-6', className)}>
        {main}
        {sidebar}
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className={cn('space-y-6', className)}>
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
      <div className="lg:col-span-1">
        {sidebar}
      </div>
    </div>
  );
}

// Grid para cards compactos mobile
interface CompactGridProps {
  children: ReactNode;
  className?: string;
}

export function CompactGrid({ children, className }: CompactGridProps) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={cn(
        'grid gap-3',
        isMobile ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

// Grid flexível com auto-sizing
interface FlexGridProps {
  children: ReactNode;
  minWidth?: string;
  maxWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlexGrid({
  children,
  minWidth = '280px',
  maxWidth = '1fr',
  gap = 'md',
  className
}: FlexGridProps) {
  return (
    <div
      className={cn(
        'grid',
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

// Grid de masonry para layouts irregulares
interface MasonryGridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export function MasonryGrid({
  children,
  columns = 3,
  gap = '1rem',
  className
}: MasonryGridProps) {
  const { isMobile, isTablet } = useResponsive();
  
  const cols = isMobile ? 1 : isTablet ? 2 : columns;

  return (
    <div
      className={cn('columns-1 md:columns-2 lg:columns-3', className)}
      style={{
        columnCount: cols,
        columnGap: gap,
        columnFill: 'balance'
      }}
    >
      {children}
    </div>
  );
} 