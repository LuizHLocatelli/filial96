import { useState, ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  className?: string;
  headerActions?: ReactNode;
  compact?: boolean;
  persistStateKey?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  icon: Icon,
  badge,
  className,
  headerActions,
  compact = false,
  persistStateKey
}: CollapsibleSectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  const getInitialState = () => {
    if (!persistStateKey) return defaultExpanded;
    
    try {
      const saved = localStorage.getItem(`collapsible-${persistStateKey}`);
      return saved ? JSON.parse(saved) : defaultExpanded;
    } catch {
      return defaultExpanded;
    }
  };

  const [isExpanded, setIsExpanded] = useState(getInitialState);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    if (headerRef.current) {
      headerRef.current.blur();
    }
    
    if (persistStateKey) {
      try {
        localStorage.setItem(`collapsible-${persistStateKey}`, JSON.stringify(newState));
      } catch (error) {
        console.warn('Erro ao salvar estado da seção:', error);
      }
    }
  };

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader 
        ref={headerRef}
        tabIndex={0}
        className={cn(
          "cursor-pointer select-none outline-none",
          "transition-colors duration-200",
          "hover:bg-accent/40 active:bg-accent/60",
          "dark:hover:bg-primary/20 dark:active:bg-primary/30",
          compact ? "pb-2 px-3 py-2" : "pb-3"
        )}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className={cn(
                "text-muted-foreground",
                compact ? "h-3.5 w-3.5" : "h-4 w-4"
              )} />
            )}
            
            <h3 className={cn(
              "font-medium",
              compact ? "text-sm" : "text-base"
            )}>
              {title}
            </h3>
            
            {badge && (
              <Badge variant="secondary" className={cn(
                compact ? "text-xs h-4" : "text-xs"
              )}>
                {badge}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {headerActions && (
              <div 
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {headerActions}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all duration-200 outline-none",
                "hover:bg-muted/50 active:bg-muted",
                "dark:hover:bg-primary/20 dark:active:bg-primary/30",
                compact ? "h-6 w-6 p-0" : "h-7 w-7 p-0"
              )}
              aria-label={isExpanded ? "Minimizar seção" : "Expandir seção"}
              onClick={toggleExpanded}
              onMouseDown={(e) => e.preventDefault()}
            >
              {isExpanded ? (
                <ChevronUp className={cn(
                  compact ? "h-3 w-3" : "h-3.5 w-3.5"
                )} />
              ) : (
                <ChevronDown className={cn(
                  compact ? "h-3 w-3" : "h-3.5 w-3.5"
                )} />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent 
          className={cn(
            "animate-in slide-in-from-top-2 duration-200",
            compact ? "px-3 pb-3 pt-0" : "pt-0"
          )}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface CollapsibleGroupProps {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'relaxed';
}

export function CollapsibleGroup({ 
  children, 
  className,
  spacing = 'normal' 
}: CollapsibleGroupProps) {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4'
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}
